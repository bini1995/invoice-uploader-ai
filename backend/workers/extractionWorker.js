import 'dotenv/config';
import { Worker } from 'bullmq';
import logger from '../utils/logger.js';
import { getRedisConnection } from '../utils/redis.js';
import { processDocumentExtraction } from '../services/documentExtractionService.js';
import { processClaimFieldExtraction } from '../services/claimFieldExtractionService.js';
import { loadSecrets } from '../utils/secretsManager.js';

await loadSecrets();

const connection = getRedisConnection();

if (!connection) {
  logger.error('Redis not configured; extraction worker exiting');
  process.exit(1);
}

const worker = new Worker(
  'document-extraction',
  async (job) => {
    const { documentId, schemaPreset, user } = job.data || {};
    if (!documentId) {
      throw new Error('Missing documentId');
    }
    if (job.name === 'extract-claim-fields') {
      await processClaimFieldExtraction({ documentId, user });
      return;
    }
    await processDocumentExtraction({ documentId, schemaPreset, user });
  },
  { connection }
);

worker.on('completed', (job) => {
  logger.info('Extraction job completed', { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error('Extraction job failed', { jobId: job?.id, error: err.message });
});
