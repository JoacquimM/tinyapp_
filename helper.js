
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

module.exports = generateRandomString;