import useSWR from 'swr';
import { mutate as globalMutate } from 'swr';
import DOMPurify from 'dompurify';
import { API_BASE } from '../api';

const token = () => localStorage.getItem('token') || '';
const idKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);

const fetcher = (url) =>
  fetch(url, { headers: { Authorization: `Bearer ${token()}` } }).then((r) =>
    r.json()
  );

export default function useReviewNotes(id, enabled = true) {
  const { data, error, mutate, isValidating } = useSWR(
    enabled ? `${API_BASE}/api/claims/${id}/notes` : null,
    fetcher
  );

  const addNote = async (text) => {
    const clean = DOMPurify.sanitize(text);
    if (clean.length < 1 || clean.length > 1000) {
      throw new Error('Note must be between 1 and 1000 chars');
    }
    const newNote = { text: clean };
    const requestId = idKey();
    const start = performance.now();
    await mutate(
      async (notes = []) => {
        const res = await fetch(`${API_BASE}/api/claims/${id}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token()}`,
            'Idempotency-Key': requestId,
            'X-Request-ID': requestId,
          },
          body: JSON.stringify(newNote),
        });
        const latency = performance.now() - start;
        if (!res.ok) {
          const text = await res.text();
          console.log('note-add', { status: 'error', latency, requestId });
          throw new Error(text || 'Failed to save');
        }
        console.log('note-add', { status: 'success', latency, requestId });
        return [...notes, clean];
      },
      { optimisticData: [...(data || []), clean], rollbackOnError: true, revalidate: false }
    );
    await mutate();
    globalMutate(`${API_BASE}/api/claims/${id}`);
    globalMutate(`${API_BASE}/api/claims/${id}/audit`);
    globalMutate(`${API_BASE}/api/claims`);
  };

  return {
    notes: data || [],
    isLoading: !data && !error,
    isError: error,
    addNote,
    isValidating,
  };
}
