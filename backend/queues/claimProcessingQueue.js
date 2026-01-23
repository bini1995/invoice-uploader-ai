import { Queue } from 'bullmq';
import logger from '../utils/logger.js';
import { getRedisConnection } from '../utils/redis.js';

const connection = getRedisConnection();

export const claimProcessingQueue = connection
  ? new Queue('claim-processing', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 500 },
      },
    })
  : null;

export const isClaimProcessingQueueEnabled = () => Boolean(claimProcessingQueue);

export const enqueueClaimProcessing = async (payload, jobName = 'process-claim') => {
  if (!claimProcessingQueue) {
    logger.warn('Claim processing queue unavailable; skipping enqueue');
    return null;
  }
  return claimProcessingQueue.add(jobName, payload);
};
