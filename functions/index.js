const functions = require("firebase-functions");
const { Bot } = require('grammy')

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(functions.config().prod.bot_token)

// React to /start command
bot.command('start', (ctx) => ctx.reply('Welcome! Up and running'))
// Handle other messages
bot.on('message', (ctx) => ctx.reply('OK, I got the message!'))

// This will connect to the Telegram servers and wait for messages.
bot.start()