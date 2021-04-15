


//--------------- HELPER FUNCTIONS ---------------------

const generateRandomString =() => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  let answer = "";
  for (let i = 0; i < 3; i ++) {
    let number = Math.floor(Math.random()*3);
    let letter = alphabet[Math.floor(Math.random() * alphabet.length)]
    answer += number;
    answer += letter;
  }
  return answer;
  }
  
//----------------------------------------------------------------

/*  getUserByEmail
  returns the user object takes 
  email and look in teh db for the matching 
  email if its there returns user obj. 
*/

// const getUserByEmail = (email, users) => {
//   for (let key of Object.keys(users)) {
//     const user = users[key];
//     console.log("THIS IS getUserByEmail --->",user, key);
//     if( user.email === email){
//       return user;
//     }
//   }
//   return undefined;
// }

//----------------------------------------------------------------
// returns all the urls in the db identified by user.

const urlsForUser =(id,urlDatabase) => {
  let tempUrls = {};
  console.log("URL dataBase -->", urlDatabase);
  for (let key in urlDatabase) {
    console.log("url DB key-->", urlDatabase[key]);
    if (urlDatabase[key].userID === id) {
      tempUrls[key] = urlDatabase[key]
    }  
  }
  return tempUrls;
}




module.exports = {generateRandomString, urlsForUser};