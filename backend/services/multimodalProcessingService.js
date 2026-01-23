import fs from 'fs';
import { HfInference } from '@huggingface/inference';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

const hfToken = process.env.HF_API_TOKEN;
const hfClient = hfToken ? new HfInference(hfToken) : null;
const DAMAGE_LABELS = [
  'vehicle damage',
  'property damage',
  'hail damage',
  'water damage',
  'fire damage',
  'glass damage',
  'total loss',
  'no visible damage',
  'interior damage',
  'exterior scratches',
];
const CLIP_MODEL = 'openai/clip-vit-base-patch32';
const DEFAULT_SIMILARITY_THRESHOLD = 0.9;

function normalizeVector(vector) {
  if (!Array.isArray(vector)) return null;
  const squared = vector.reduce((sum, value) => sum + value * value, 0);
  if (!squared) return vector;
  const norm = Math.sqrt(squared);
  return vector.map((value) => value / norm);
}

function flattenEmbedding(embedding) {
  if (!Array.isArray(embedding)) return null;
  if (Array.isArray(embedding[0])) {
    return embedding[0];
  }
  return embedding;
}

async function classifyDamage(imageBuffer) {
  if (!hfClient) {
    return null;
  }
  try {
    const results = await hfClient.zeroShotImageClassification({
      model: CLIP_MODEL,
      data: imageBuffer,
      labels: DAMAGE_LABELS,
    });
    return results?.slice(0, 5) || [];
  } catch (error) {
    logger.warn('Image classification failed', { error: error.message });
    return null;
  }
}

async function embedImage(imageBuffer) {
  if (!hfClient) {
    return null;
  }
  try {
    const embedding = await hfClient.featureExtraction({
      model: CLIP_MODEL,
      data: imageBuffer,
    });
    return normalizeVector(flattenEmbedding(embedding));
  } catch (error) {
    logger.warn('Image embedding failed', { error: error.message });
    return null;
  }
}

export async function processImageMultimodal({ documentId, filePath, similarityThreshold }) {
  if (!filePath) return null;
  if (!hfClient) {
    return {
      warning: 'HF_API_TOKEN is not configured; image processing skipped.',
    };
  }

  const imageBuffer = fs.readFileSync(filePath);
  const [damageAssessment, embedding] = await Promise.all([
    classifyDamage(imageBuffer),
    embedImage(imageBuffer),
  ]);

  let duplicateCandidates = [];
  if (embedding && embedding.length) {
    await pool.query(
      `INSERT INTO multimodal_embeddings (document_id, modality, embedding, model, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        documentId,
        'image',
        embedding,
        CLIP_MODEL,
        JSON.stringify({ damage_assessment: damageAssessment }),
      ]
    );

    const { rows } = await pool.query(
      `SELECT document_id,
              1 - (embedding <=> $1) AS similarity
       FROM multimodal_embeddings
       WHERE modality = $2
         AND document_id <> $3
         AND 1 - (embedding <=> $1) >= $4
       ORDER BY similarity DESC
       LIMIT 5`,
      [
        embedding,
        'image',
        documentId,
        similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD,
      ]
    );
    duplicateCandidates = rows;
  }

  return {
    model: CLIP_MODEL,
    damage_assessment: damageAssessment || [],
    duplicate_candidates: duplicateCandidates,
    similarity_threshold: similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD,
  };
}
