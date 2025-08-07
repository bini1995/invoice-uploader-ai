import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { API_BASE } from '../api';
import { ACTIONS_BY_STATUS } from '../lib/claimStatus';

const token = () => localStorage.getItem('token') || '';
const role = () => localStorage.getItem('role') || '';
const idKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);

const fetcher = async (url) => {
  const requestId = idKey();
  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      'Idempotency-Key': requestId,
      'X-Request-ID': requestId,
    },
  });
  const latency = performance.now() - start;
  if (!res.ok) {
    const text = await res.text();
    console.log('claim-action', { url, status: 'error', latency, requestId });
    const err = new Error(text || 'Request failed');
    err.status = res.status;
    err.requestId = requestId;
    throw err;
  }
  console.log('claim-action', { url, status: 'success', latency, requestId });
  return res.json().catch(() => ({}));
};

export default function useClaimActions(id, status) {
  const userRole = role();
  const allowed = ACTIONS_BY_STATUS[status] || [];

  const canApprove = allowed.includes('approve') && ['admin', 'adjuster'].includes(userRole);
  const canRequestInfo = allowed.includes('request-info') && ['admin', 'adjuster', 'auditor'].includes(userRole);
  const canEscalate = allowed.includes('escalate') && ['admin', 'auditor'].includes(userRole);

  const revalidate = () => {
    mutate(`${API_BASE}/api/claims`);
    mutate(`${API_BASE}/api/claims/${id}`);
    mutate(`${API_BASE}/api/claims/${id}/audit`);
    mutate(`${API_BASE}/api/claims/${id}/notes`);
  };

  const approve = useSWRMutation(
    canApprove ? `${API_BASE}/api/claims/${id}/approve` : null,
    fetcher,
    { onSuccess: revalidate }
  );
  const requestInfo = useSWRMutation(
    canRequestInfo ? `${API_BASE}/api/claims/${id}/request-info` : null,
    fetcher,
    { onSuccess: revalidate }
  );
  const escalate = useSWRMutation(
    canEscalate ? `${API_BASE}/api/claims/${id}/escalate` : null,
    fetcher,
    { onSuccess: revalidate }
  );

  return {
    canApprove,
    canRequestInfo,
    canEscalate,
    approve: approve.trigger,
    approving: approve.isMutating,
    requestInfo: requestInfo.trigger,
    requesting: requestInfo.isMutating,
    escalate: escalate.trigger,
    escalating: escalate.isMutating,
  };
}
