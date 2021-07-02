const { Bot, session, InlineKeyboard, /* webhookCallback */ } = require("grammy");
const { testHandler } = require('./index')
const test = require('ava');
const { assert } = require("assert")

function createBot(args) {
    const bot = new Bot('dummy')
    bot.botInfo = { id: 42, is_bot: true, username: 'bot', first_name: 'Bot' }
    bot.api.config.use((prev, method, payload) => {
        //console.log(payload.text)
        //console.log(args)
        assert.strictEqual(args, payload.text, 'lama')
        if(!payload.text === args) {
            throw new Error(`${payload.text} =/= ${args}`)
        }
    })
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

test('should execute enter middleware in scene', async () => {
    const res = "hello1" 
    const bot = createBot(res)
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

    return await bot.handleUpdate(msg)
})


