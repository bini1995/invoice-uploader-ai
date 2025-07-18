const Queue = require('bull');
const invoiceQueue = new Queue('invoiceQueue', 'redis://redis:6379');

module.exports = invoiceQueue;
