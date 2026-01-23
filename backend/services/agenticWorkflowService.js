import openrouter from '../config/openrouter.js';
import pool from '../config/db.js';
import logger from '../utils/logger.js';
import { runAgentSequence } from '../utils/rulesEngine.js';

const EMBEDDING_MODEL = 'openai/text-embedding-ada-002';

const hasEmbeddingKey = () => Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);

const buildEmbeddingText = (claim) => {
  if (!claim) return '';
  const fields = [
    claim.claim_number,
    claim.vendor,
    claim.provider,
    claim.description,
    claim.notes,
    claim.amount,
    claim.total_amount,
    claim.policy_number,
  ];
  return fields.filter(Boolean).join(' | ');
};

const fetchContextSignals = async ({ tenantId, embedding }) => {
  if (!embedding) {
    return { similarClaims: [], maxSimilarity: 0 };
  }
  try {
    const query = tenantId
      ? {
          text: `SELECT ce.document_id, 1 - (ce.embedding <=> $1) AS similarity
                 FROM claim_embeddings ce
                 JOIN documents d ON d.id = ce.document_id
                 WHERE d.tenant_id = $2 AND ce.embedding IS NOT NULL
                 ORDER BY ce.embedding <=> $1
                 LIMIT 5`,
          values: [embedding, tenantId],
        }
      : {
          text: `SELECT document_id, 1 - (embedding <=> $1) AS similarity
                 FROM claim_embeddings
                 WHERE embedding IS NOT NULL
                 ORDER BY embedding <=> $1
                 LIMIT 5`,
          values: [embedding],
        };
    const { rows } = await pool.query(query);
    const similarClaims = rows.map((row) => ({
      document_id: row.document_id,
      similarity: Number(row.similarity) || 0,
    }));
    const maxSimilarity = similarClaims.reduce(
      (max, row) => Math.max(max, row.similarity),
      0
    );
    return { similarClaims, maxSimilarity };
  } catch (err) {
    logger.warn({ err }, 'pgvector similarity lookup failed');
    return { similarClaims: [], maxSimilarity: 0 };
  }
};

const deriveRouting = ({ fraud, validation, maxSimilarity }) => {
  if (fraud?.flagged) {
    return { route: 'hitl', reason: fraud.reason || 'Fraud signal detected' };
  }
  if (validation && !validation.isValid) {
    return { route: 'manual_validation', reason: 'Validation errors detected' };
  }
  if (maxSimilarity >= 0.85) {
    return { route: 'hitl', reason: 'High-risk similarity to prior claims' };
  }
  return { route: 'auto', reason: null };
};

export const runAgenticWorkflow = async ({ claim, tenantId }) => {
  const payload = { claim, tenantId };
  const agentResult = await runAgentSequence(payload);

  let embedding = null;
  if (hasEmbeddingKey()) {
    try {
      const embedText = buildEmbeddingText(claim);
      if (embedText) {
        const embedRes = await openrouter.embeddings.create({
          model: EMBEDDING_MODEL,
          input: embedText,
        });
        embedding = embedRes.data?.[0]?.embedding || null;
      }
    } catch (err) {
      logger.warn({ err }, 'Embedding generation failed');
    }
  }

  const { similarClaims, maxSimilarity } = await fetchContextSignals({
    tenantId,
    embedding,
  });
  const routing = deriveRouting({
    fraud: agentResult.fraud,
    validation: agentResult.validation,
    maxSimilarity,
  });

  return {
    ...agentResult,
    embedding: embedding ? { stored: false, dimensions: embedding.length } : null,
    context: { similarClaims, maxSimilarity },
    routing,
  };
};
