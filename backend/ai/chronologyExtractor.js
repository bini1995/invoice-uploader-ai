import openrouter from '../config/openrouter.js';
import logger from '../utils/logger.js';

const model = 'openai/gpt-4o-mini';

async function extractChronology(text) {
  const start = Date.now();
  try {
    const prompt = `You are a medical chronology specialist. Analyze this insurance/healthcare claim document and extract a chronological timeline of all medical events, treatments, and encounters.

Return a JSON object with a single key "events" containing an array of event objects. Each event should have:
- "date": The date of the event in YYYY-MM-DD format. If only month/year is available, use the 1st of the month. If no date is found, use "unknown".
- "event_type": One of: "consultation", "diagnosis", "treatment", "procedure", "prescription", "lab_test", "imaging", "hospitalization", "follow_up", "referral", "discharge", "injury", "incident"
- "provider": The name of the healthcare provider, facility, or doctor involved. Use "" if unknown.
- "description": A concise description of what happened (1-2 sentences max).
- "codes": An object with optional "cpt" and "icd10" arrays of relevant codes mentioned for this event.
- "cost": The cost/charge for this specific event if mentioned, as a string like "$500.00". Use "" if not mentioned.

Sort events chronologically (earliest first). Extract as many distinct events as possible from the document text.

If the document has no medical events, return {"events": []} with an empty array.

Example:
{
  "events": [
    {
      "date": "2024-01-15",
      "event_type": "consultation",
      "provider": "Dr. Smith, City Medical Center",
      "description": "Initial consultation for lower back pain following workplace injury.",
      "codes": {"cpt": ["99213"], "icd10": ["M54.5"]},
      "cost": "$250.00"
    },
    {
      "date": "2024-01-22",
      "event_type": "imaging",
      "provider": "City Radiology Associates",
      "description": "MRI of lumbar spine ordered to evaluate disc herniation.",
      "codes": {"cpt": ["72148"], "icd10": ["M54.5"]},
      "cost": "$1,200.00"
    }
  ]
}`;

    const resp = await openrouter.chat.completions.create({
      model,
      messages: [{ role: 'user', content: `${prompt}\n\nDocument text:\n${text.slice(0, 12000)}` }],
      response_format: { type: 'json_object' }
    });

    logger.info({ latency: Date.now() - start }, 'chronologyExtractor');

    const raw = resp.choices?.[0]?.message?.content || '{}';
    let data;
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(cleaned);
    } catch {
      data = { events: [] };
    }

    const events = Array.isArray(data.events) ? data.events : [];

    const validated = events.map((e, i) => ({
      date: typeof e.date === 'string' ? e.date : 'unknown',
      event_type: typeof e.event_type === 'string' ? e.event_type : 'unknown',
      provider: typeof e.provider === 'string' ? e.provider : '',
      description: typeof e.description === 'string' ? e.description : '',
      codes: e.codes && typeof e.codes === 'object' ? {
        cpt: Array.isArray(e.codes.cpt) ? e.codes.cpt : [],
        icd10: Array.isArray(e.codes.icd10) ? e.codes.icd10 : []
      } : { cpt: [], icd10: [] },
      cost: typeof e.cost === 'string' ? e.cost : '',
      sort_order: i
    }));

    return { events: validated, model_version: model };
  } catch (err) {
    console.error('Chronology extraction failed:', err.message);
    throw new Error('Could not extract chronology at this time.');
  }
}

export { extractChronology };
