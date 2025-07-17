const { IsolationForest } = require('ml-isolation-forest');

function detectFraud(data) {
  const model = new IsolationForest();
  model.fit(data);
  const scores = model.scores();
  return scores.map((s) => s < -0.5);
}

module.exports = { detectFraud };
