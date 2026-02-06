
import openrouter from '../config/openrouter.js';
import logger from '../utils/logger.js';
import Ajv from 'ajv';
const ajv = new Ajv();
const schema = {
  type: 'object',
  properties: {
    claim_id: { type: 'string' },
    claimant_name: { type: 'string' },
    date_of_incident: { type: 'string' },
    policy_number: { type: 'string' },
    total_claimed_amount: { type: 'string' },
    loss_description: { type: 'string' },
    cpt_codes: {
      type: 'array',
      items: { type: 'string' }
    },
    icd10_codes: {
      type: 'array',
      items: { type: 'string' }
    },
    policy_id: { type: 'string' }
  },
  additionalProperties: true
};

const model = 'openai/gpt-4o-mini';

async function extractClaimFields(text) {
  const start = Date.now();
  try {
    const prompt = `Extract structured fields from this healthcare insurance claim text.

Return a JSON object with TWO top-level keys:
1. "fields" - the extracted data with these keys: claim_id, claimant_name, date_of_incident, policy_number, policy_id, total_claimed_amount, loss_description, cpt_codes (array), icd10_codes (array)
2. "confidence_scores" - a parallel object with the SAME keys as "fields", where each value is a number from 0 to 100 representing how confident you are in the extracted value. Use these guidelines:
   - 90-100: Value is clearly and explicitly stated in the text
   - 70-89: Value is likely correct but requires some inference
   - 50-69: Value is uncertain, partially visible, or ambiguous
   - 0-49: Value is a guess or not found in the text

For array fields (cpt_codes, icd10_codes), provide a single confidence score for the entire array.
If a field is not found at all, set the field value to an empty string "" and confidence to 0.

Example response format:
{
  "fields": {
    "claim_id": "CLM-12345",
    "claimant_name": "John Doe",
    "total_claimed_amount": "$1,500.00"
  },
  "confidence_scores": {
    "claim_id": 95,
    "claimant_name": 90,
    "total_claimed_amount": 85
  }
}`;

    const resp = await openrouter.chat.completions.create({
      model,
      messages: [{ role: 'user', content: `${prompt}\n\n${text}` }],
      response_format: { type: 'json_object' }
    });
    logger.info({ latency: Date.now() - start }, 'claimFieldExtractor');
    const raw = resp.choices?.[0]?.message?.content || '{}';
    let data;
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(cleaned);
    } catch {
      data = { raw };
    }

    let fields = data.fields || data;
    let confidenceScores = data.confidence_scores || {};

    if (data.fields && !ajv.validate(schema, data.fields)) {
      logger.warn({ errors: ajv.errors }, 'Invalid claim fields in nested format');
    }

    if (!data.fields) {
      if (!ajv.validate(schema, data)) {
        logger.warn({ errors: ajv.errors }, 'Invalid claim fields');
        throw new Error('Invalid claim field format');
      }
      fields = data;
      confidenceScores = {};
    }

    const overallConfidence = computeOverallConfidence(fields, confidenceScores);

    return { fields, confidenceScores, overallConfidence, version: model };
  } catch (err) {
    console.error('AI extraction failed:', err.message);
    throw new Error('Could not extract claim fields at this time.');
  }
}

function computeOverallConfidence(fields, confidenceScores) {
  if (!confidenceScores || Object.keys(confidenceScores).length === 0) {
    return 0.9;
  }
  const fieldKeys = ['claim_id', 'claimant_name', 'date_of_incident', 'policy_number', 'total_claimed_amount', 'loss_description', 'cpt_codes', 'icd10_codes'];
  const weights = {
    claim_id: 1.5,
    claimant_name: 2.0,
    date_of_incident: 1.5,
    policy_number: 1.5,
    total_claimed_amount: 2.0,
    loss_description: 1.0,
    cpt_codes: 1.0,
    icd10_codes: 1.0
  };

  let totalWeight = 0;
  let weightedSum = 0;
  for (const key of fieldKeys) {
    const score = confidenceScores[key];
    if (typeof score === 'number') {
      const w = weights[key] || 1;
      weightedSum += (score / 100) * w;
      totalWeight += w;
    }
  }

  return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(3)) : 0.9;
}

export { extractClaimFields };
