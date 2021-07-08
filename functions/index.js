const functions = require("firebase-functions");
//const admin = require('firebase-admin'); 
const {
    trendingMenu,
    selectCoin,
    printCoinData,
    printConvertedValue,
    validateCoin,
    convertToFiat,
    testHandler
} = require('./utils')
const { Bot, session, /* webhookCallback */ } = require("grammy");

const bot = new Bot(functions.config().prod.bot_token);

bot.use(session({
    initial() {
        return { 
            wantedCoin: '',
            localCurrency: 'usd' };
        },      
    })
)

bot.api.config.use((prev, m, p) => {
    console.log(p)
    return prev(m, p)
})

bot.command('test', testHandler)

bot.command('start', trendingMenu)

bot.on(":text", selectCoin)

bot.callbackQuery("show", printCoinData);


bot.on("callback_query:data", (ctx, next) => {
    const session = ctx.session
    //if(!session.wantedCoin) 
    session.wantedCoin = ctx.callbackQuery.data
    delete session.coin 
    ctx.answerCallbackQuery()
    next()
})


bot.filter(ctx => (!ctx.session.amount && ctx.session.coin), convertToFiat)

bot.filter(ctx => (!ctx.session.coin), validateCoin)

bot.filter(ctx => (ctx.session.exchanged), printConvertedValue)


// Catch errors and log them
bot.catch(err => console.error(err))

// Start bot!
bot.start()

//exports.bot = functions.https.onRequest(webhookCallback(bot))
