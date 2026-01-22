
import { getSuggestions } from '../utils/ocrAgent.js';
import { trainFromCorrections } from '../utils/ocrAgent.js';
import { trainAnomalyModel } from '../utils/anomalyTrainer.js';
import {
  getTrackingUri,
  getOrCreateExperiment,
  createRun,
  logBatch,
  setRunTerminated,
} from '../utils/mlflowClient.js';
import pool from '../config/db.js';
import openrouter from '../config/openrouter.js';
export const getSmartSuggestions = async (req, res) => {
  const { invoice } = req.body || {};
  if (!invoice) return res.status(400).json({ message: 'invoice required' });
  try {
    const suggestions = getSuggestions(invoice);
    res.json({ suggestions });
  } catch (err) {
    console.error('Smart suggestion error:', err);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
};

export const retrain = async (req, res) => {
  try {
    await trainFromCorrections();
    const baseThreshold = Number(req.body?.baseThreshold) || 2;
    const anomalyResult = await trainAnomalyModel({ baseThreshold });
    let mlflow = null;
    if (getTrackingUri()) {
      try {
        const experiment = await getOrCreateExperiment();
        const run = await createRun(experiment.experiment_id, {
          source: 'api',
          retrain_type: 'anomaly',
        });
        await logBatch(run.info.run_id, {
          params: {
            baseThreshold,
            modelPath: anomalyResult.modelPath,
          },
          metrics: {
            vendors: anomalyResult.vendors,
            feedbackCount: anomalyResult.feedbackCount,
          },
        });
        await setRunTerminated(run.info.run_id);
        mlflow = {
          experimentId: experiment.experiment_id,
          runId: run.info.run_id,
        };
      } catch (mlflowError) {
        console.error('MLflow logging error:', mlflowError.response?.data || mlflowError.message);
        mlflow = { error: 'MLflow logging failed' };
      }
    }
    res.json({
      message: 'Retraining complete',
      anomaly: anomalyResult,
      mlflow,
    });
  } catch (err) {
    console.error('Retrain error:', err);
    res.status(500).json({ message: 'Retrain failed' });
  }
};


export const askDocument = async (req, res) => {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ message: 'question required' });
  try {
    const embedRes = await openrouter.embeddings.create({
      model: 'openai/text-embedding-ada-002',
      input: question
    });
    const qVec = embedRes.data[0].embedding;
    const { rows } = await pool.query(
      `SELECT dc.document_id, d.file_name, dc.content, dc.embedding
       FROM document_chunks dc
       JOIN documents d ON d.id = dc.document_id
       WHERE d.tenant_id = $1 AND dc.embedding IS NOT NULL`,
      [req.tenantId]
    );
    let best = null;
    let bestScore = -Infinity;
    for (const r of rows) {
      if (!Array.isArray(r.embedding)) continue;
      const score = r.embedding.reduce((s, v, i) => s + v * qVec[i], 0);
      if (score > bestScore) { best = r; bestScore = score; }
    }
    let context = best ? best.content.slice(0, 2000) : '';
    const ans = await openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You answer questions about business documents.' },
        { role: 'user', content: `${context}\n\nQuestion: ${question}` }
      ]
    });
    res.json({ answer: ans.choices[0].message.content, document_id: best?.document_id });
  } catch (err) {
    console.error('Ask document error:', err.message);
    res.status(500).json({ message: 'Failed to answer question' });
  }
};
