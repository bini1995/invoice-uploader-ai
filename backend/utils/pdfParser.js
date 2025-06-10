const fs = require('fs');
const pdfParse = require('pdf-parse');
const { fromPath } = require('pdf2pic');
const { createWorker } = require('tesseract.js');

async function ocrImage(path) {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(path);
  await worker.terminate();
  return text;
}

async function extractText(filePath) {
  const data = await pdfParse(fs.readFileSync(filePath));
  let text = data.text.trim();
  if (text) return text;

  // Fallback OCR for scanned PDFs
  const converter = fromPath(filePath, {
    density: 200,
    savePath: '/tmp',
    format: 'png'
  });
  text = '';
  for (let i = 1; i <= data.numpages; i++) {
    const page = await converter(i);
    text += await ocrImage(page.path);
    fs.unlinkSync(page.path);
  }
  return text;
}

exports.parsePDF = async (filePath) => {
  const text = await extractText(filePath);

  const invoices = [];
  const regex = /Invoice\s*#?:?\s*(\S+)\s+Date:?\s*([\d\/-]+)\s+Amount:?\s*\$?([0-9,.]+)\s+Vendor:?\s*(\w+)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    invoices.push({
      invoice_number: match[1],
      date: new Date(match[2]),
      amount: parseFloat(match[3].replace(/,/g, '')),
      vendor: match[4]
    });
  }
  return invoices;
};
