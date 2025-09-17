// Resolve the API base from env vars or fall back to dev/prod defaults
let fromEnv = '';
try {
  // eslint-disable-next-line no-new-func
  fromEnv = new Function('return import.meta.env.VITE_API_BASE_URL')();
} catch (_e) {
  fromEnv = process.env.REACT_APP_API_BASE_URL || '';
}
const cleaned = fromEnv.replace(/\/+$/, '').replace(/\/api$/, '');

export const API_BASE =
  cleaned ||
  (typeof window !== 'undefined' &&
  window.location.origin.includes('localhost')
    ? 'http://localhost:3000'  // Local development
    : 'https://clarifyops.com/api');  // Production - always use this for clarifyops.com

// Simple health check helper used by status indicators
export async function pingHealth() {
  const r = await fetch(`${API_BASE}/health`, { method: 'GET' });
  if (!r.ok) throw new Error(`Health ${r.status}`);
  return r.json();
}
