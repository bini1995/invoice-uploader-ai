const { Worker } = require('bullmq');
const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
};

const worker = new Worker('invoiceQueue', async (job) => {
  const { invoicePath, tenantId } = job.data;
  console.log(`Processing invoice for tenant ${tenantId}`);
  // call OCR, tagging, analysis here
}, { connection });

module.exports = worker;
