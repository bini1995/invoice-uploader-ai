
import { parseCSV } from '../utils/csvParser.js';
import { parsePDF } from '../utils/pdfParser.js';
import { parseImage } from '../utils/imageParser.js';
import { parseExcel } from '../utils/excelParser.js';
import path from 'path';
import fs from 'fs';

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') return parseCSV(filePath);
  if (ext === '.pdf') return parsePDF(filePath);
  if (ext === '.xls' || ext === '.xlsx') return parseExcel(filePath);
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return parseImage(filePath);
  if (['.txt', '.eml'].includes(ext)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return [{ rawText: content }];
  }
  throw new Error('Unsupported file type');
}

export { parseFile };
