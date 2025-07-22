const Queue = require('bull');

const parseDocumentQueue = new Queue('parseDocumentQueue', {
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },
});

module.exports = parseDocumentQueue;
