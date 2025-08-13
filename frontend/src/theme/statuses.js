import { CheckCircle, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';

export const STATUS_MAP = {
  extracted: 'neutral',
  needs_review: 'amber',
  approved: 'green',
  escalated: 'red',
  flagged: 'red',
  correct: 'green',
  incorrect: 'red',
};

export const STATUS_DETAILS = {
  neutral: { class: 'status-neutral', icon: MinusCircle, label: 'Extracted' },
  amber: { class: 'status-amber', icon: AlertTriangle, label: 'Needs Review' },
  green: { class: 'status-green', icon: CheckCircle, label: 'Approved' },
  red: { class: 'status-red', icon: XCircle, label: 'Flagged' },
};

export const getStatusDetails = (status) => {
  const key = STATUS_MAP[status] || 'neutral';
  return STATUS_DETAILS[key];
};

export const getStatusClass = (status) => getStatusDetails(status).class;
