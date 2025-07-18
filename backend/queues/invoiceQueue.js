const { Queue } = require('bullmq');
const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
};
const invoiceQueue = new Queue('invoiceQueue', { connection });

module.exports = invoiceQueue;
