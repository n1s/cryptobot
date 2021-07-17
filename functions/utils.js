const { getSimplePrice, getCoinList, getCoin, getTrending } = require("./api");
const { InlineKeyboard } = require("grammy");

async function trendingKb() {
  const trending = await getTrending();

  const keyboard = new InlineKeyboard();

  try {
    if (trending.error) throw new Error(trending.error);
    if (trending.coins.length === 0)
      throw new Error("CoinGecko won't provide us with the data");
  } catch (error) {
    console.error(error.message);
    return keyboard;
  }

  trending.coins.forEach((coin) => {
    keyboard.text(coin.item.name, coin.item.id).row();
  });

  return keyboard;
}

const mainKb = new InlineKeyboard().text("🔍 Show coin", "show");

async function trendingMenu(ctx) {
  delete ctx.session;
  await ctx.reply(
    `Hi ${ctx.from.first_name}👋! I can tell you all secrets about your fave cryptos🔮, what crypto are you interested in?🚀`,
    {
      reply_markup: await trendingKb(),
    }
  );
}

async function selectCoin(ctx, next) {
  const session = ctx.session;
  if (!session.wantedCoin) session.wantedCoin = ctx.msg.text;
  await next();
}

async function printCoinData(ctx, next) {
  const session = ctx.session;
  const localCurrency = session.localCurrency;
  const coin = session.coin || (await next());
  if (!session.coin?.market_data?.ath) session.coin = await getCoin(coin.id);
  const market_data = session.coin.market_data;

  const formattedString = `🌟 *${coin.name}*
💵 *Price:* ${market_data.current_price[localCurrency].toLocaleString(undefined, { maximumFractionDigits: 2 })} ${localCurrency.toUpperCase()}
📉 *Volume 24h:* ${market_data.total_volume[localCurrency].toLocaleString(undefined, { maximumFractionDigits: 0 })} ${localCurrency.toUpperCase()}
💰 *Market Cap:* ${market_data.market_cap[localCurrency].toLocaleString(undefined, { maximumFractionDigits: 0 })} ${localCurrency.toUpperCase()}

*1d change:* ${(market_data.price_change_percentage_24h_in_currency[localCurrency] || 0).toFixed(2)} %
*7d change:* ${(market_data.price_change_percentage_7d_in_currency[localCurrency] || 0).toFixed(2)} %
*30d change:* ${(market_data.price_change_percentage_30d_in_currency[localCurrency] || 0).toFixed(2)} %
*1y change:* ${(market_data.price_change_percentage_1y_in_currency[localCurrency] || 0).toFixed(2)} %
*from ${market_data.ath[localCurrency].toLocaleString(undefined, {maximumFractionDigits: 2,})} ${localCurrency.toUpperCase()} (ATH):* ${market_data.ath_change_percentage[localCurrency].toFixed(2)} % `;

  const urlKb = new InlineKeyboard().url(
    `See more about ${coin.name}`,
    `https://www.coingecko.com/en/coins/${coin.id}`
  );

  await ctx.reply(formattedString, {
    parse_mode: "Markdown",
    reply_markup: urlKb,
  });
}

function handleCoinCallback(ctx, next) {
  const session = ctx.session;
  //if(!session.wantedCoin)
  session.wantedCoin = ctx.callbackQuery.data;
  delete session.coin;
  ctx.answerCallbackQuery();
  next();
}

async function validateCoin(ctx) {
  const session = ctx.session;
  if (!session.coinList) session.coinList = await getCoinList();
  session.coin = session.coinList.find((c) => {
    if (c.id === session.wantedCoin || c.symbol === session.wantedCoin)
      return c;
  });

  try {
    if (session.coin === undefined) {
      delete session.wantedCoin;
      throw new Error("I'm not sure this coin exists");
    }

    await ctx.reply(
      `Picked *${
        session.coin.name
      }* aka [${session.coin.symbol.toUpperCase()}]. Please provide the amount you would like to convert or click the button below`,
      {
        parse_mode: "Markdown",
        reply_markup: mainKb,
      }
    );
  } catch (error) {
    await ctx.reply(error.message);
  }
}

async function convertToFiat(ctx, next) {
  const session = ctx.session;
  if (isNaN(ctx.msg.text)) {
    session.wantedCoin = ctx.msg.text;
    delete session.coin;
    return await next();
  }
  const localCurrency = session.localCurrency;
  session.coin.market_data = session.coin.market_data || {};
  const current_price = (session.coin.market_data.current_price =
    session.coin.market_data.current_price || {});
  if (!current_price[localCurrency])
    current_price[localCurrency] = await getSimplePrice(
      session.coin.id,
      localCurrency
    );

  const amount = ctx.msg.text;
  session.amount = amount;

  function converter(amount, rate) {
    return amount / rate;
  }

  session.exchanged = converter(amount, current_price[localCurrency]);

  await next();
}

async function printConvertedValue(ctx, next) {
  const session = ctx.session;
  const localCurrency = session.localCurrency;
  const amount = parseInt(session.amount);
  const exchanged = session.exchanged;

  const formattedString = `${amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${localCurrency.toUpperCase()} = ${exchanged.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${session.coin.symbol.toUpperCase()}`;

  await ctx.reply(formattedString);

  delete session.amount;
  delete session.exchanged;

  await next();
}

module.exports = {
  trendingMenu,
  selectCoin,
  handleCoinCallback,
  printCoinData,
  printConvertedValue,
  validateCoin,
  convertToFiat
};
