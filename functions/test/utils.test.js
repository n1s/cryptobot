const { Bot, session } = require("grammy");
const {
  testHandler,
  trendingMenu,
  printCoinData,
  validateCoin,
  printConvertedValue,
  convertToFiat,
} = require("../utils");
const test = require("ava");
require("./mockApi");

function createBot(t, expected, type) {
  const bot = new Bot("dummy", {
    botInfo: {
      id: 42,
      is_bot: true,
      username: "bot",
      first_name: "Bot",
      can_join_groups: false,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
    },
  });

  bot.api.config.use((_prev, _method, payload) => {
    t.is(
      type in payload && JSON.stringify(payload[type]),
      JSON.stringify(expected)
    );
    return Promise.resolve({ ok: true, result: true });
  });

  return bot;
}

const baseUpdate = {
  date: 1441645532,
  chat: {
    last_name: "Test Lastname",
    id: 1111111,
    type: "private",
    first_name: "Test",
    username: "Test",
  },
  message_id: 1365,
  from: {
    last_name: "Test Lastname",
    id: 1111111,
    first_name: "Test",
    username: "Test",
    is_bot: false,
  },
  text: "test",
};

test("should send hello", async (t) => {
  const bot = createBot(t, "hello", "text");
  bot.use(testHandler);
  await bot.handleUpdate({ message: { ...baseUpdate } });
  t.pass();
});

test("should show trending menu", async (t) => {
  const jsonKeyboard = {
    inline_keyboard: [
      [{ text: "fakecoin", callback_data: "fakecoin" }],
      [{ text: "fakecoin1", callback_data: "fakecoin1" }],
      [{ text: "fakecoin2", callback_data: "fakecoin2" }],
      [{ text: "fakecoin3", callback_data: "fakecoin3" }],
      [{ text: "fakecoin4", callback_data: "fakecoin4" }],
      [{ text: "fakecoin5", callback_data: "fakecoin5" }],
      [{ text: "fakecoin6", callback_data: "fakecoin6" }],
      [],
    ],
  };
  const bot = createBot(t, jsonKeyboard, "reply_markup");

  bot.use(trendingMenu);

  await bot.handleUpdate({ message: { ...baseUpdate } });
  t.pass();
});

test("should show coin data", async (t) => {
  const jsonKeyboard = {
    inline_keyboard: [
      [
        {
          text: "See more about Fakecoin",
          url: "https://www.coingecko.com/en/coins/fakecoin",
        },
      ],
    ],
  };

  const bot = createBot(t, jsonKeyboard, "reply_markup");
  bot.use(
    session({
      initial() {
        return {
          wantedCoin: "fakecoin",
          coinList: [{ id: "fakecoin", symbol: "FKE", name: "Fakecoin" }],
          coin: { id: "fakecoin", symbol: "FKE", name: "Fakecoin" },
          localCurrency: "usd",
        };
      },
    })
  );
  bot.use(printCoinData);

  await bot.handleUpdate({ message: { ...baseUpdate } });
  t.pass();
});

test("should validate the coin against the list", async (t) => {
  const expectedText =
    "Picked *Fakecoin* aka [FKE]. Please provide the amount you would like to convert or click the button below";
  const bot = createBot(t, expectedText, "text");

  bot.use(
    session({
      initial() {
        return {
          wantedCoin: "fakecoin",
        };
      },
    })
  );
  bot.use(validateCoin);

  await bot.handleUpdate({ message: { ...baseUpdate } });
  t.pass();
});

test("should convert to fiat", async (t) => {
  const update = { ...baseUpdate, text: "1500" };
  const expectedText = "1,500 USD = 1.5 FKE";
  const bot = createBot(t, expectedText, "text");

  bot.use(
    session({
      initial() {
        return {
          coin: { id: "fakecoin", symbol: "FKE", name: "Fakecoin" },
          localCurrency: "usd",
        };
      },
    })
  );
  bot.use(convertToFiat);
  bot.use(printConvertedValue);

  await bot.handleUpdate({ message: { ...update } });
  t.pass();
});
