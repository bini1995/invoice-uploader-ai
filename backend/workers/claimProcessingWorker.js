import { Worker } from 'bullmq';
import pool from '../config/db.js';
import logger from '../utils/logger.js';
import { getRedisConnection } from '../utils/redis.js';
import { runAgenticWorkflow } from '../services/agenticWorkflowService.js';

const connection = getRedisConnection();

if (!connection) {
  logger.warn('Claim processing worker disabled: Redis not configured.');
} else {
  const worker = new Worker(
    'claim-processing',
    async (job) => {
      const { claimId, claim, tenantId } = job.data || {};
      let claimPayload = claim || {};
      if (claimId && (!claimPayload || Object.keys(claimPayload).length === 0)) {
        const { rows } = await pool.query(
          `SELECT id, vendor, amount, description, date, raw_text, fields
           FROM documents
           WHERE id = $1`,
          [claimId]
        );
        if (rows[0]) {
          claimPayload = {
            ...rows[0],
            ...(rows[0].fields || {}),
            raw_text: rows[0].raw_text,
          };
        }
      }
      const workflowResult = await runAgenticWorkflow({ claim: claimPayload, tenantId });

      if (claimId) {
        try {
          await pool.query(
            `UPDATE documents
             SET status = $1,
                 flag_reason = $2,
                 metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
             WHERE id = $4`,
            [
              workflowResult.routing.route === 'auto' ? 'processed' : 'review',
              workflowResult.fraud?.reason || null,
              JSON.stringify({ agentic_workflow: workflowResult }),
              claimId,
            ]
          );
        } catch (err) {
          logger.error({ err, claimId }, 'Failed to persist agentic workflow results');
        }
      }

      return workflowResult;
    },
    { connection }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Claim processing job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Claim processing job failed');
  });
}
