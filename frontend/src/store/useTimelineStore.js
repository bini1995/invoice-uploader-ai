import { create } from 'zustand';
import { API_BASE } from '../api';

export const useTimelineStore = create((set, get) => ({
  timelineByClaim: {},
  statusByClaim: {},
  requestByClaim: {},
  setTimeline: (claimId, timeline) =>
    set((state) => ({
      timelineByClaim: { ...state.timelineByClaim, [claimId]: timeline },
      statusByClaim: { ...state.statusByClaim, [claimId]: 'success' },
    })),
  fetchTimeline: async ({ claimId, token, fallbackTimeline }) => {
    const requestId = `${claimId}-${Date.now()}`;
    set((state) => ({
      statusByClaim: { ...state.statusByClaim, [claimId]: 'loading' },
      requestByClaim: { ...state.requestByClaim, [claimId]: requestId },
    }));

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await fetch(`${API_BASE}/api/claims/${claimId}/timeline`, { headers });
      const data = await res.json();
      const timeline = Array.isArray(data) ? data : Array.isArray(data.timeline) ? data.timeline : [];
      if (get().requestByClaim[claimId] !== requestId) return;
      const finalTimeline =
        timeline.length === 0 && Array.isArray(fallbackTimeline) ? fallbackTimeline : timeline;
      set((state) => ({
        timelineByClaim: { ...state.timelineByClaim, [claimId]: finalTimeline },
        statusByClaim: { ...state.statusByClaim, [claimId]: 'success' },
      }));
    } catch (error) {
      if (get().requestByClaim[claimId] !== requestId) return;
      set((state) => ({
        statusByClaim: { ...state.statusByClaim, [claimId]: 'error' },
      }));
    }
  },
}));
