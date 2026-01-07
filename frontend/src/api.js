// Resolve the API base from env vars or fall back to dev/prod defaults (no /api suffix).
const fromEnv = import.meta.env.VITE_API_BASE_URL || '';
const cleaned = fromEnv.replace(/\/+$/, '').replace(/\/api$/, '');

export const API_BASE =
  cleaned ||
  (typeof window !== 'undefined' &&
  window.location.origin.includes('localhost')
    ? 'http://localhost:3000'  // Local development
    : 'https://clarifyops.com');  // Production - always use this for clarifyops.com

// Simple health check helper used by status indicators
export async function pingHealth() {
  const r = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
  if (!r.ok) throw new Error(`Health ${r.status}`);
  return r.json();
}
