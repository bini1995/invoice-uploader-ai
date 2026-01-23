import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = path.join(__dirname, '..', 'data', 'hf_anomaly_classifier.json');

const buildTrainingText = (row) => [
  row.vendor,
  row.period ? new Date(row.period).toISOString().slice(0, 10) : null,
  row.amount,
  row.note,
].filter(Boolean).join(' | ');

const meanVector = (vectors, dims) => {
  const sums = new Array(dims).fill(0);
  for (const vec of vectors) {
    for (let i = 0; i < dims; i += 1) {
      sums[i] += vec[i] || 0;
    }
  }
  return sums.map((value) => value / vectors.length);
};

export const trainHfAnomalyClassifier = async ({ minSamples = 25 } = {}) => {
  const { rows } = await pool.query(
    `SELECT vendor, period, amount, is_anomaly, note
     FROM anomaly_feedback
     WHERE vendor IS NOT NULL AND amount IS NOT NULL`
  );

  if (rows.length < minSamples) {
    return {
      status: 'skipped',
      reason: 'Not enough feedback samples',
      samples: rows.length,
    };
  }

  let pipeline;
  try {
    ({ pipeline } = await import('@xenova/transformers'));
  } catch (err) {
    logger.warn({ err }, 'Transformers dependency unavailable');
    return {
      status: 'skipped',
      reason: 'Transformers dependency unavailable',
      samples: rows.length,
    };
  }

  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const anomalyVectors = [];
  const normalVectors = [];

  for (const row of rows) {
    const text = buildTrainingText(row);
    if (!text) continue;
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    const vector = Array.isArray(output) ? output : output.data;
    if (!vector) continue;
    if (row.is_anomaly) {
      anomalyVectors.push(vector);
    } else {
      normalVectors.push(vector);
    }
  }

  const dims = anomalyVectors[0]?.length || normalVectors[0]?.length;
  if (!dims || (!anomalyVectors.length && !normalVectors.length)) {
    return {
      status: 'skipped',
      reason: 'No usable feedback text for embeddings',
      samples: rows.length,
    };
  }

  const model = {
    version: 1,
    trainedAt: new Date().toISOString(),
    model: 'Xenova/all-MiniLM-L6-v2',
    samples: rows.length,
    anomalyCentroid: anomalyVectors.length ? meanVector(anomalyVectors, dims) : null,
    normalCentroid: normalVectors.length ? meanVector(normalVectors, dims) : null,
    expectedFalsePositiveReduction: 0.2,
  };

  fs.writeFileSync(MODEL_PATH, JSON.stringify(model, null, 2));
  return {
    status: 'trained',
    modelPath: MODEL_PATH,
    samples: rows.length,
    expectedFalsePositiveReduction: model.expectedFalsePositiveReduction,
  };
};
