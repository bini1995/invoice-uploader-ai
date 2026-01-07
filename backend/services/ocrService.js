
import { parseCSV } from '../utils/csvParser.js';
import { parsePDF } from '../utils/pdfParser.js';
import { parseImage } from '../utils/imageParser.js';
import { parseExcel } from '../utils/excelParser.js';
import path from 'path';
async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') return parseCSV(filePath);
  if (ext === '.pdf') return parsePDF(filePath);
  if (ext === '.xls' || ext === '.xlsx') return parseExcel(filePath);
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return parseImage(filePath);
  throw new Error('Unsupported file type');
}

export { parseFile };
