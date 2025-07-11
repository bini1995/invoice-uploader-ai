// backend/utils/csvParser.js

const fs = require('fs');
const csv = require('csv-parser');
const { normalizeRow } = require('./rowNormalizer');

exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(normalizeRow(row)))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};