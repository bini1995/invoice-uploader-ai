const openrouter = require('../config/openrouter');
const logger = require('../utils/logger');
const Ajv = require('ajv');

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

// tuned for healthcare/claim domain extraction
const model = 'openai/gpt-4o-mini';

async function extractClaimFields(text) {
  const start = Date.now();
  try {
    const prompt =
      'Extract structured fields from this healthcare insurance claim text. ' +
      'Return JSON with the following keys: claim_id, claimant_name, date_of_incident, policy_number, policy_id, total_claimed_amount, loss_description, cpt_codes (array), icd10_codes (array).';
    const resp = await openrouter.chat.completions.create({
      model,
      messages: [{ role: 'user', content: `${prompt}\n\n${text}` }]
    });
    logger.info({ latency: Date.now() - start }, 'claimFieldExtractor');
    const raw = resp.choices?.[0]?.message?.content || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
    if (!ajv.validate(schema, data)) {
      logger.warn({ errors: ajv.errors }, 'Invalid claim fields');
      throw new Error('Invalid claim field format');
    }
    return { fields: data, version: model };
  } catch (err) {
    console.error('AI extraction failed:', err.message);
    throw new Error('Could not extract claim fields at this time.');
  }
}

module.exports = { extractClaimFields };
