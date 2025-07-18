// Support both REACT_APP_API_BASE_URL and legacy REACT_APP_API_BASE
export const API_BASE =
  process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || '';
