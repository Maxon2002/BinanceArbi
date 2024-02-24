const nodemailer = require('nodemailer');
const config = require('./config.json');
// Создаем объект для отправки электронной почты
let transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true, // используется SSL
    auth: {
        user: process.env.EMAIL_LOGIN,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Функция для отправки уведомления по электронной почте
function sendEmail(subject, text) {
    let mailOptions = {
        from: 'haisarov-2002@mail.ru',
        to: 'haisarov16@gmail.com',
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Пример использования: отправка уведомления при определенном условии

let baseUsdtSmall = 23.59398594
let baseBtcSmall = 0.003583
let baseEthSmall = 0.0243

if (true) {
    sendEmail('Сделать стартовый перевод', `Перевести по: ${baseUsdtSmall} USDT, ${baseBtcSmall} BTC, ${baseEthSmall} ETH`);
}