const getUserByEmail = (email) => {
  for (let key of Object.keys(users)) {
    const user = users[key];
    console.log(user, key);
    if( user.email === email){
      // return user object base on userEmail
      return user;
    }
  }
  return false;
}
//----------------------------------------------------------------
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString} = require("./helper.js");
// -- ejs --
app.set("view engine", "ejs");

//-- body parser --
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//-- cookie parser --
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//----------------------------------------------------------------
// -- DATA --
// -- URL Database -- 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// -- User Database ---

const users = { 
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com", 
    password: "1"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "1"
  }
};
//----------------------------------------------------------------
/*
    This class facilitates creation of individual user objects for users object.
*/


class NewUsers {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
  
  // adds user to users DB
  static addUserToDB(userObj) {
    console.log("userObj --->", userObj);
    users[userObj.id] = { 
      id : `${userObj.id}`,
      email: `${userObj.email}`,
      password:`${userObj.password}`
    };
  }
  // returns current users in DB
  static seeCurrentUsers() {
    console.log(users);
  }
}

//----------------------------------------------------------------
// -- GET ROUTES --
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// -- urls page -- 
app.get("/urls", (req, res) =>{
  const templateVars = {urls: urlDatabase, username: req.cookies["username"], userEmail: users[req.cookies.user_id].email};
  res.render("urls_index", templateVars);
})
// -- new url page --
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"], userEmail: users[req.cookies.user_id].email}
  res.render("urls_new", templateVars);
});

// -- short url page --
app.get("/urls/:shortURL", (req, res) =>{
  console.log(" REQ PARAMS -->",req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies[username], userEmail: users[req.cookies.user_id].email};
  res.render("urls_show", templateVars);
})

// register
app.get("/register", (req, res) => {
  res.render("register");
});

//----------------------------------------------------------------
// -- POST ROUTES --
// -- creates new short url --
app.post("/urls", (req, res) => {
  console.log(" REQ BODY -->",req.body);  // Log the POST request body to the console
  console.log(urlDatabase);
  const userLongUrl = req.body.longURL;
  const userShortUrl = generateRandomString();
  urlDatabase[userShortUrl] = userLongUrl;
  res.redirect(`/urls/${userShortUrl}`); 
  
});
// -- DELETE Url--
app.post("/urls/:shortURL/delete",(req, res)=>{
  const shortURLDelete = req.params.shortURL;
  delete urlDatabase[shortURLDelete];
  res.redirect(`/urls`);
  // console.log(req.params.shortURL);
})

// -- UPDATE/ EDIT Url --
app.post("/urls/:shortURL", (req, res)=>{
  const shortURLDelete = req.params.shortURL;
  console.log(req.body)
})

// -- COOKIES --

app.post("/login", (req, res)=>{
  const userNameEntered = req.body.username;
  console.log("USER NAME -->",userNameEntered)
  // res.cookie( "username", userNameEntered);
  res.cookie( "user_id", userNameEntered);
  console.log("REQ COOKIES -->",req.cookies);

  
  res.redirect(`/urls`);
})

// LOGOUT //
app.post("/logout", (req, res) => {
  const userNameEntered = req.body.username;
  // res.clearCookie("username", userNameEntered)
  res.clearCookie("user_id", userNameEntered)
  res.redirect(`/urls`);
});

//Register
app.post("/register", (req, res) =>{
  userRandomID = `${generateRandomString()}`;
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  console.log("userRandomID -->", userRandomID);
  console.log("EMAIL -->", req.body.email);
  console.log("PASSWORD -->", req.body.password);
  if (userEmail === "" && userPassword === "") {res.status(400).send("You did not enter anything")}; 
  if (getUserByEmail(userEmail)) {res.status(400).send("Email already in records")};
  // new object
  const newUser = new NewUsers(`${userRandomID}`, `${userEmail}`, `${userPassword}`);
  NewUsers.addUserToDB(newUser);
  res.cookie( "user_id", userRandomID);
  // console.log(req.cookies.user_id.email)
  console.log("USERS --->", users)
  console.log("THIS ONE HERE --->", req.cookies.user_id)
  // console.log("THIS ONE HERE!!! --->", users[req.cookies.user_id].email)
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});