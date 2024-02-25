let botKey = "7176718080:AAHk5RzYR7uL9BmeqQNrJ3B_sxA6Ucnu_aM"

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(botKey, { polling: true });


const userChatId = 647607874;

bot.sendMessage(userChatId, 'Здарова Макс');
