const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
redis.on('error', (err) => console.error('Redis error:', err));
module.exports = redis;
