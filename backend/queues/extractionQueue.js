import { Queue } from 'bullmq';
import logger from '../utils/logger.js';
import { getRedisConnection } from '../utils/redis.js';

const connection = getRedisConnection();

export const extractionQueue = connection
  ? new Queue('document-extraction', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 1000 },
      },
    })
  : null;

export const isExtractionQueueEnabled = () => Boolean(extractionQueue);

export const enqueueExtraction = async (payload, jobName = 'extract') => {
  if (!extractionQueue) {
    logger.warn('Extraction queue unavailable; skipping enqueue');
    return null;
  }
  return extractionQueue.add(jobName, payload);
};
