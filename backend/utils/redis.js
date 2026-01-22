import IORedis from 'ioredis';
import logger from './logger.js';

let redisConnection;

function buildRedisOptions() {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  if (!process.env.REDIS_HOST) {
    return null;
  }
  return {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0),
    maxRetriesPerRequest: null,
  };
}

export function getRedisConnection() {
  if (redisConnection) return redisConnection;
  const options = buildRedisOptions();
  if (!options) {
    logger.warn('Redis not configured; async queues disabled');
    return null;
  }
  redisConnection = typeof options === 'string'
    ? new IORedis(options, { maxRetriesPerRequest: null })
    : new IORedis(options);
  redisConnection.on('error', (err) => {
    logger.error('Redis connection error', { error: err.message });
  });
  return redisConnection;
}
