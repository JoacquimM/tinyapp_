
//----------------------------------------------------------------
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const generateRandomString = require("./helper.js");
// -- ejs --
app.set("view engine", "ejs");

//-- body parser --
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// -- URL Database -- 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
})
// -- new url page --
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// -- short url page --
app.get("/urls/:shortURL", (req, res) =>{
  console.log(" REQ PARAMS -->",req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
})


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
// -- DELETE --
app.post('/urls/:shortURL/delete',(req, res)=>{
  const shortURLDelete = req.params.shortURL;
  delete urlDatabase[shortURLDelete];
  res.redirect(`/urls`);
  // console.log(req.params.shortURL);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});