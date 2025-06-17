const fs = require('fs');
const path = require('path');

function getTrainingSamples() {
  try {
    const file = path.join(__dirname, '..', 'data', 'email_samples.txt');
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf8');
    }
  } catch (err) {
    console.error('Email training load error:', err);
  }
  return '';
}

module.exports = { getTrainingSamples };
