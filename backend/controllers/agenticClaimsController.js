import crypto from 'crypto';
import logger from '../utils/logger.js';
import {
  enqueueClaimProcessing,
  isClaimProcessingQueueEnabled,
} from '../queues/claimProcessingQueue.js';
import { runAgenticWorkflow } from '../services/agenticWorkflowService.js';

export const processClaimWorkflow = async (req, res) => {
  const { claimId, claim } = req.body || {};
  if (!claimId && !claim) {
    return res.status(400).json({ message: 'claimId or claim payload required' });
  }

  const payload = {
    claimId: claimId || null,
    claim: claim || {},
    tenantId: req.tenantId,
    requestedBy: req.user?.id || null,
    correlationId: crypto.randomUUID(),
  };

  try {
    if (isClaimProcessingQueueEnabled()) {
      const job = await enqueueClaimProcessing(payload);
      return res.status(202).json({
        message: 'Claim processing queued',
        jobId: job?.id || null,
        correlationId: payload.correlationId,
      });
    }

    const workflowResult = await runAgenticWorkflow({
      claim: payload.claim,
      tenantId: payload.tenantId,
    });
    return res.status(200).json({
      message: 'Claim processed synchronously (queue unavailable)',
      correlationId: payload.correlationId,
      result: workflowResult,
    });
  } catch (err) {
    logger.error({ err }, 'Claim processing failed');
    return res.status(500).json({ message: 'Claim processing failed' });
  }
};
