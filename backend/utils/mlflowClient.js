import axios from 'axios';

function getTrackingUri() {
  return process.env.MLFLOW_TRACKING_URI;
}

async function getOrCreateExperiment() {
  const trackingUri = getTrackingUri();
  if (!trackingUri) return null;
  const name = process.env.MLFLOW_EXPERIMENT_NAME || 'anomaly-classifier';
  try {
    const existing = await axios.post(`${trackingUri}/api/2.0/mlflow/experiments/get-by-name`, { name });
    return existing.data.experiment;
  } catch (err) {
    if (err.response?.status !== 404) throw err;
  }
  const created = await axios.post(`${trackingUri}/api/2.0/mlflow/experiments/create`, { name });
  return { experiment_id: created.data.experiment_id, name };
}

async function createRun(experimentId, tags = {}) {
  const trackingUri = getTrackingUri();
  if (!trackingUri) return null;
  const payload = {
    experiment_id: experimentId,
    tags: Object.entries(tags).map(([key, value]) => ({ key, value: String(value) })),
  };
  const response = await axios.post(`${trackingUri}/api/2.0/mlflow/runs/create`, payload);
  return response.data.run;
}

async function logBatch(runId, { params = {}, metrics = {} }) {
  const trackingUri = getTrackingUri();
  if (!trackingUri) return;
  const payload = {
    run_id: runId,
    params: Object.entries(params).map(([key, value]) => ({ key, value: String(value) })),
    metrics: Object.entries(metrics).map(([key, value]) => ({ key, value: Number(value) })),
  };
  await axios.post(`${trackingUri}/api/2.0/mlflow/runs/log-batch`, payload);
}

async function setRunTerminated(runId, status = 'FINISHED') {
  const trackingUri = getTrackingUri();
  if (!trackingUri) return;
  await axios.post(`${trackingUri}/api/2.0/mlflow/runs/update`, { run_id: runId, status });
}

export { getTrackingUri, getOrCreateExperiment, createRun, logBatch, setRunTerminated };
