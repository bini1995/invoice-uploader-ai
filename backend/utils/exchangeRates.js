const axios = require('axios');

async function getExchangeRate(currency) {
  if (!currency || currency.toUpperCase() === 'USD') {
    return 1;
  }
  try {
    const url = `https://api.exchangerate.host/latest?base=${currency}&symbols=USD`;
    const res = await axios.get(url);
    return res.data && res.data.rates && res.data.rates.USD ? res.data.rates.USD : 1;
  } catch (err) {
    console.error('Exchange rate fetch error:', err.message);
    return 1;
  }
}

module.exports = { getExchangeRate };
