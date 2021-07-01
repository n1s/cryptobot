const { Bot, session, InlineKeyboard, /* webhookCallback */ } = require("grammy");
const { testHandler } = require('./index')
const test = require('ava');

function createBot (...args) {
    const bot = new Bot('dummy', ...args)
    bot.api.config.use((prev, method, payload) => undefined)
    bot.botInfo = { id: 42, is_bot: true, username: 'bot', first_name: 'Bot' }
    return bot
}
  
const BaseTextMessage = {
    chat: { 
        id: 1,
        first_name: "Test" 
    },
    from: { id: 1 },
    text: '/start'
    //text: 'foo'
}

test('should execute enter middleware in scene', async (t) => {
    const bot = createBot()
    const msg = {
        message: {
            chat: {
                id: 1,
            },
            from: {
                id: 1
            },
            text: '/test'
        }
    }

    bot.use(testHandler)

    const res = await bot.handleUpdate(msg)
    t.is("hello1", res)
    console.log(res)
    return res
    //const res = await bot.handleUpdate({ message: BaseTextMessage })
/*     t.assert(text, res)
    return res */
})


/* const b = new Bot('dummy')
b.api.config.use((prev, m, p) =>
// Let all API calls return undefined because we don't need return values
undefined)
b.use(fooMiddleware)
await bot.handleUpdate(fakeUpdateObjectThatCanTestTheMiddleware) */