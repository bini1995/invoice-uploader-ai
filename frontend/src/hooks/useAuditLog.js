import { useEffect } from 'react';
import useSWR from 'swr';
import { API_BASE } from '../api';

const token = () => localStorage.getItem('token') || '';
const fetcher = (url) =>
  fetch(url, { headers: { Authorization: `Bearer ${token()}` } }).then((r) =>
    r.json()
  );

export default function useAuditLog(id, params = {}, enabled = true) {
  const search = new URLSearchParams(params).toString();
  const key = `${API_BASE}/api/claims/${id}/audit?${search}`;
  const { data, error, isValidating, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
  });
  useEffect(() => {
    if (enabled && !data) mutate();
  }, [enabled, data, mutate]);
  return {
    logs: data?.items || [],
    total: data?.total || 0,
    isLoading: !data && !error,
    isError: error,
    isValidating,
    mutate,
  };
}
