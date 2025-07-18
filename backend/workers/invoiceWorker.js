const invoiceQueue = require('../queues/invoiceQueue');

invoiceQueue.process(async (job) => {
  const { invoicePath, tenantId } = job.data;
  console.log(`Processing invoice for tenant ${tenantId}`);
  // call OCR, tagging, analysis here
});
