const { parseCSV } = require('../utils/csvParser');
const { parsePDF } = require('../utils/pdfParser');
const { parseImage } = require('../utils/imageParser');
const { parseExcel } = require('../utils/excelParser');
const path = require('path');

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') return parseCSV(filePath);
  if (ext === '.pdf') return parsePDF(filePath);
  if (ext === '.xls' || ext === '.xlsx') return parseExcel(filePath);
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return parseImage(filePath);
  throw new Error('Unsupported file type');
}

module.exports = { parseFile };
