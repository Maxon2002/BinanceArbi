const axios = require('axios');

// Данные для отправки
let data = {
  comis: 100
};

// data = {
//   deleteAccount: 1
// };

// data = {
//   comisMain: 100
// };



// Отправка POST запроса
axios.post('http://localhost:3000/dataBinArbi', data)
  .then((response) => {
    console.log('Response:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });