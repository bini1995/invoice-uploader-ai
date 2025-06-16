const { createWorker } = require('tesseract.js');

async function ocrImage(path) {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(path);
  await worker.terminate();
  return text;
}

exports.parseImage = async (filePath) => {
  const text = await ocrImage(filePath);
  const invoices = [];
  const regex = /Invoice\s*#?:?\s*(\S+)\s+Date:?\s*([\d\/-]+)\s+Amount:?\s*\$?([0-9,.]+)\s+Vendor:?\s*(\w+)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    invoices.push({
      invoice_number: match[1],
      date: new Date(match[2]),
      amount: parseFloat(match[3].replace(/,/g, '')),
      vendor: match[4],
    });
  }
  return invoices;
};
