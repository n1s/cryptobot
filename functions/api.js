const { CoinGeckoClient } = require('coingecko-api-v3');

const cgc = new CoinGeckoClient

async function getCoin(id) {
    const input = {
        'id': id,
        'market_data': true,
        'localization': false,
        'tickers': false,
        'community_data': false,
        'sparkline': false,
        'developer_data': false
    }
    return await cgc.coinId(input);
}

async function getCoinList() {
    return await cgc.coinList();
}

async function getSimplePrice(id, currency) {
    const input = {
        vs_currencies: currency,
        ids: id,
        include_market_cap: false,
        include_24hr_vol: false,
        include_24hr_change: false,
        include_last_updated_at: false,
    }

    const simplePrice = await cgc.simplePrice(input);
    return simplePrice[id][currency]
}

async function getTrending() {
    return cgc.trending()
}

module.exports = {
    getSimplePrice,
    getCoinList,
    getCoin,
    getTrending
}