const fs = require('fs');
const pdfParse = require('pdf-parse');
const { fromPath } = require('pdf2pic');
const { createWorker } = require('tesseract.js');
const openai = require('../config/openai');

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

  if (invoices.length === 0) {
    try {
      const prompt = `Extract invoice_number, date, amount and vendor from this text and return a JSON array.\n\n${text}`;
      const response = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You parse invoices from OCR text.' },
          { role: 'user', content: prompt }
        ]
      });
      const raw = response.choices?.[0]?.message?.content?.trim();
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      console.error('AI OCR parse error:', err.message);
    }
  } else {
    try {
      const prompt = `Fix formatting for the following invoice JSON array. Ensure dates are YYYY-MM-DD and amounts are numbers.\n\n${JSON.stringify(invoices)}`;
      const response = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You clean and standardize invoice data.' },
          { role: 'user', content: prompt }
        ]
      });
      const raw = response.choices?.[0]?.message?.content?.trim();
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : invoices;
    } catch (err) {
      console.error('AI format correction error:', err.message);
    }
  }
  return invoices;
};
