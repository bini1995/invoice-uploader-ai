// Support both REACT_APP_API_BASE_URL and legacy REACT_APP_API_BASE
// Some deployments accidentally include the `/api` prefix in the env variable
// which results in requests like `/api/api/...`.  Normalize the base URL to
// exclude a trailing `/api` so the fetch helpers can append paths consistently.
const rawBase =
  process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || '';
let base = rawBase.replace(/\/+$/, '');
if (base.endsWith('/api')) {
  base = base.slice(0, -4);
}
export const API_BASE = base;
