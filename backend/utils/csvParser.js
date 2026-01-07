// backend/utils/csvParser.js


import fs from 'fs';
import csv from 'csv-parser';
import { normalizeRow } from './rowNormalizer.js';
export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(normalizeRow(row)))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};