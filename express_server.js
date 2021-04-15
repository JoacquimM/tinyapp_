
//----------------------------------------------------------------
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// -- helper functions --
const {generateRandomString, urlsForUser, getUserByEmail} = require("./helper.js");
// -- ejs --
app.set("view engine", "ejs");

//-- body parser --
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// -- cookie session --
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: [ 'key1', 'key2'],
})
);

// -- bcrypt --
const bcrypt = require('bcrypt');

//----------------------------------------------------------------
// -- DATA --
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

// -- user Database ---

const users = { 
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com", 
  //   password: "1"
  // },
  // "user2RandomID": {
  //   id: "user2RandomID", 
  //   email: "user2@example.com", 
  //   password: "1"
  // }
};
//----------------------------------------------------------------
/*
    This class facilitates creation of individual user objects for users object.
*/

class NewUsers {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = bcrypt.hashSync(password, 10);
  }
  
  // adds user to users DB
  static addUserToDB(userObj) {
    // console.log("userObj --->", userObj);
    users[userObj.id] = { 
      id : `${userObj.id}`,
      email: `${userObj.email}`,
      password:`${userObj.password}`
    };
  }
  // returns current users in DB
  static seeCurrentUsers() {
    // console.log(users);
  }
}

//----------------------------------------------------------------

// -- GET ROUTES --
app.get("/", (req, res) => {
  res.send("hello :)");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// -- urls page -- 
app.get("/urls", (req, res) =>{
  const user = users[req.session.user_id]; // user obj
  if (!user) {
    res.send("<html><body>Looks like you need to login <a href='/login'>Here</a> or regester <a href='/register'>Here</a></body></html>\n");
  }
  let userEmail;
  let templateVars = { urls:{}, email:"", longURL:"", shortURL:"",};
  if (user) { 
    userEmail = user.email;
    templateVars = { urls: urlsForUser(user.id,urlDatabase) ,  userEmail: userEmail, longURL:"", shortURL: req.params.shortURL};
  }
  res.render("urls_index", templateVars);
});
// -- new url page --
app.get("/urls/new", (req, res) => {
  const currentUser = req.session.user_id;
  if (!currentUser) { 
    res.redirect("/login");
    return;
  }
  const templateVars = { userEmail: users[req.session.user_id].email};
  res.render("urls_new", templateVars);
});

// -- short url page --
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id]; // user obj
  if (!user) {
    res.send("<html><body>Hey there! Looks like you need to login <a href='/login'>Here</a> or regester <a href='/register'>Here</a></body></html>\n");
  }
  const templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,  userEmail: users[req.session.user_id].email};
  res.render("urls_show", templateVars);
});

// register
app.get("/register", (req, res) => {
  const userCookieID = req.session.user_id;
  if (!userCookieID) {
    res.render("register");
  }
  res.redirect(`/urls`);
});
//-- login -- 
app.get("/login", (req, res) => {
  const userCookieID = req.session.user_id;
  if (!userCookieID) { 
    res.render("login");
  }
  res.redirect(`/urls`);
});

// u/:id GET - verifies and routes to external website using longURL link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    res.render("error_urls", { errorMessage: "Uh-OH! This url is not in our database." });
  }
  res.redirect(longURL);
});

//----------------------------------------------------------------

// -- POST ROUTES --
// -- creates new short url --
app.post("/urls", (req, res) => {
  const userLongUrl = req.body.longURL;
  const userShortUrl = generateRandomString();
  const userId =  req.session.user_id;
  urlDatabase[userShortUrl] = {longURL:userLongUrl , userID: userId}; 
  res.redirect(`/urls/${userShortUrl}`); 
  
});

// -- DELETE Url--
app.post("/urls/:shortURL/delete",(req, res) => {
  const shortURLDelete = req.params.shortURL;
  if (req.session.user_id  === urlDatabase[shortURLDelete].userID) {
    delete urlDatabase[shortURLDelete];
    res.redirect(`/urls`);
  }  
  res.status(401).send("You are not authorized");
});

// -- UPDATE/ EDIT Url --
app.post("/urls/:shortURL", (req, res) => {
  let shortURLUpdate = req.params.shortURL;
  let newURLEdit = req.body.user_input;
  if (req.session.user_id  === urlDatabase[shortURLUpdate].userID) {
    urlDatabase[shortURLUpdate].longURL = newURLEdit;
    res.redirect(`/urls`);
  }
  res.status(401).send("You are not authorized"); 
});

// -- COOKIES --
app.post("/login", (req, res) => {
  const userNameEntered = req.body.email; // was .username
  const userPasswordEntered = req.body.password;
  // const hashedPassword = bcrypt.hashSync(userPasswordEntered, 10)
  const userFromEmail = getUserByEmail(userNameEntered, users);
  if (!userFromEmail) { 
    return res.status(403).send("Email can not be found");
  }
  if (bcrypt.compareSync(userPasswordEntered, userFromEmail.password)) {
    req.session["user_id"] = userFromEmail.id;
    res.redirect(`/urls`);
  } else {
    return res.status(403).send("invalid password");
  }
});

// LOGOUT //
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect(`/login`);
});

//Register
app.post("/register", (req, res) => {
  const userRandomID = `${generateRandomString()}`;
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (userEmail === "" && userPassword === "") {
    res.status(400).send("You did not enter anything");
  } 
  if (getUserByEmail(userEmail, users)) {
    res.status(400).send("Email already in records");
  }
  // new object
  const newUser = new NewUsers(`${userRandomID}`, `${userEmail}`, `${userPassword}`);
  NewUsers.addUserToDB(newUser);
  req.session["user_id"] = userRandomID; //userFromEmail is the user obj in users
  res.redirect(`/urls`);
  // console.log("USERS OBJ -->",users);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {users};