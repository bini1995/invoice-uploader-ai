const axios = require('axios');

async function submitHashToBlockchain(hash) {
  const url = process.env.BLOCKCHAIN_API_URL;
  if (!url) {
    console.warn('No BLOCKCHAIN_API_URL configured. Skipping blockchain submission.');
    return { txId: null };
  }
  try {
    const res = await axios.post(url, { hash });
    return res.data;
  } catch (err) {
    console.error('Blockchain submission failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { submitHashToBlockchain };
