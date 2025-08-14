export function logEvent(event, data = {}) {
  try {
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track(event, data);
    } else if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...data });
    } else {
      console.log('analytics event', event, data);
    }
  } catch (e) {
    // swallow analytics errors
  }
}

export function getRequestId() {
  try {
    let id = sessionStorage.getItem('request_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('request_id', id);
    }
    return id;
  } catch {
    return undefined;
  }
}
