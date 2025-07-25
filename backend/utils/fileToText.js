const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { fromPath } = require('pdf2pic');
const { createWorker } = require('tesseract.js');
const mammoth = require('mammoth');

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

async function ocrImage(p) {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(p);
  await worker.terminate();
  return normalize(text);
}

async function extractPdf(filePath) {
  const data = await pdfParse(fs.readFileSync(filePath));
  let text = data.text.trim();
  if (text) return text;
  const converter = fromPath(filePath, { density: 200, savePath: '/tmp', format: 'png' });
  text = '';
  for (let i = 1; i <= data.numpages; i++) {
    const page = await converter(i);
    text += await ocrImage(page.path);
    fs.unlinkSync(page.path);
  }
  return text;
}

async function extractDocx(filePath) {
  const { value } = await mammoth.extractRawText({ path: filePath });
  return normalize(value);
}

module.exports = async function fileToText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return extractPdf(filePath);
  if (ext === '.docx') return extractDocx(filePath);
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return ocrImage(filePath);
  return normalize(fs.readFileSync(filePath, 'utf8'));
};
