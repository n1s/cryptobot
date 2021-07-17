const functions = require("firebase-functions");
//const admin = require('firebase-admin');
const {
  trendingMenu,
  selectCoin,
  handleCoinCallback,
  validateCoin,
  convertToFiat,
  printCoinData,
  printConvertedValue,
} = require("./utils");
const { Bot, session, webhookCallback } = require("grammy");

const bot = new Bot(functions.config().prod.bot_token);

bot.use(
  session({
    initial() {
      return {
        localCurrency: "usd",
      };
    },
  })
);

bot.command("start", trendingMenu);
bot.on(":text", selectCoin);
bot.callbackQuery("show", printCoinData);
bot.on("callback_query:data", handleCoinCallback);
bot.filter((ctx) => !ctx.session.amount && ctx.session.coin, convertToFiat);
bot.filter((ctx) => !ctx.session.coin, validateCoin);
bot.filter((ctx) => ctx.session.exchanged, printConvertedValue);

// Catch errors and log them
bot.catch((err) => console.error(err));

// Start bot!
//bot.start();

exports.bot = functions.https.onRequest(webhookCallback(bot))
