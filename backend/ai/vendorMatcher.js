const levenshtein = require('fast-levenshtein');

function matchVendor(name, vendors) {
  let best = null;
  let score = 0;
  for (const v of vendors) {
    const dist = levenshtein.get(name.toLowerCase(), v.toLowerCase());
    const sim = 1 - dist / Math.max(name.length, v.length);
    if (sim > score) {
      score = sim;
      best = v;
    }
  }
  return { vendor: best, score };
}

module.exports = { matchVendor };
