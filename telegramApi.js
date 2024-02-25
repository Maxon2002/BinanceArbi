let botKey = "7176718080:AAHk5RzYR7uL9BmeqQNrJ3B_sxA6Ucnu_aM"

const TelegramBot = require('node-telegram-bot-api');

const botMax = new TelegramBot(botKey, { polling: true });


const userChatId = 647607874;

let messageBot = `Здарова Макс.
Это твой бот пишет тебе!`

botMax.on('polling_error', (error) => {
    console.error('Ошибка опроса:', error.code); // Логируем ошибку
    if (error.code === 'ECONNRESET') {
        console.error('Соединение было неожиданно разорвано'); // Дополнительные действия для этой ошибки

        setTimeout(() => {
            botMax.sendMessage(userChatId, `Макс, прив из process`);
    
        }, 5000);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    setTimeout(() => {
        botMax.sendMessage(userChatId, `Макс, прив из process`);

    }, 5000);
});

setInterval(() => {
    botMax.sendMessage(userChatId, messageBot);
}, 3000);

