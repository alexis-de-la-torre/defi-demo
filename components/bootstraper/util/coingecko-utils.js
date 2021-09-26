const axios = require('axios')

const coingeckoAddr = process.env['COINGECKO_ADDR']
  || 'https://api.coingecko.com/api/v3'

async function get(route) {
    return axios.get(`${coingeckoAddr}${route}`)
}

async function getPrices(tokens) {
    const route = `/simple/price?ids=${tokens.join(',')}&vs_currencies=usd`
    return get(route)
      .then(res => res.data)
}

module.exports = {getPrices}
