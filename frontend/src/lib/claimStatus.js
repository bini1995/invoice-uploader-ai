export const STATUS_TRANSITIONS = {
  Extracted: ['Needs Review', 'Approved', 'Escalated'],
  'Needs Review': ['Approved', 'Escalated', 'Flagged'],
  Flagged: ['Needs Review', 'Escalated'],
  Approved: [],
  Escalated: []
};

export const ACTIONS_BY_STATUS = {
  Extracted: ['approve', 'request-info', 'escalate'],
  'Needs Review': ['approve', 'request-info', 'escalate'],
  Flagged: ['request-info', 'escalate'],
  Approved: [],
  Escalated: []
};
