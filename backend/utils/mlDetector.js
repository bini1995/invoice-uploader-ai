const IsolationForest = require('ml-isolation-forest').default;

function prepareData(rows) {
  const vendorMap = {};
  let idx = 0;
  const data = rows.map(r => {
    const v = r.vendor ? r.vendor.toLowerCase() : '';
    if (!(v in vendorMap)) vendorMap[v] = idx++;
    const hour = new Date(r.created_at).getHours();
    return [parseFloat(r.amount || 0), hour, vendorMap[v]];
  });
  return data;
}

function detectAnomalies(rows, threshold = 0.65) {
  if (!rows.length) return [];
  const data = prepareData(rows);
  const forest = new IsolationForest();
  forest.fit(data);
  const scores = forest.scores();
  return rows
    .map((r, i) => ({ id: r.id, score: scores[i] }))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

module.exports = { detectAnomalies };
