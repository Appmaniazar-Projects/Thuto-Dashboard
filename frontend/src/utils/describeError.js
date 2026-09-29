const redact = (text) =>
  String(text || '')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')   // emails
    .replace(/\+?\d[\d\s-]{6,}\d/g, '[number]');        // phone-like numbers

// Keep only the first two path segments so ids, phones and usernames never appear
const safePath = (url = '') => {
  const path = url.split('?')[0];
  const parts = path.split('/').filter(Boolean);
  return parts.length > 2 ? `/${parts.slice(0, 2).join('/')}/…` : path;
};


// Turns any axios/JS error into a message that says what failed and where.
export const describeError = (error, fallback = 'Something went wrong.') => {
  if (!error) return fallback;

  // Plain Errors thrown by our own code (not axios): use their message as-is
  if (!error.response && !error.request && !error.config) {
    return error.message || fallback;
  }

  const method = (error.config?.method || '').toUpperCase();
  const url = safePath(error.config?.url || '');
  const where = url ? ` (${method} ${url})` : '';
  const status = error.response?.status;
  const data = error.response?.data;
  const serverMessage = redact(
  (typeof data === 'string' ? data : data?.message || data?.error) || '');

  // No response at all: server offline, DNS/CORS failure, or timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return `The server took too long to respond${where}. Please try again.`;
    }
    return `Could not reach the server${where}. It may be offline or unreachable, or your connection may be down.`;
  }

  // Only readable if the backend exposes this header via CORS
  const requestId = error.response.headers?.['x-railway-request-id'];
  const ref = requestId ? ` Ref: ${requestId}.` : '';

  if (status === 400 || status === 422) {
    return `The server rejected the request${where}: ${serverMessage || 'invalid data'}.`;
  }
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return `You don't have permission to do that${where}.`;
  if (status === 404) {
    return `Not found${where}: ${serverMessage || 'the endpoint or record does not exist'}.`;
  }
  if (status === 409) {
    return `Conflict${where}: ${serverMessage || 'this record already exists or clashes with another'}.`;
  }
  if (status === 429) return `Too many requests${where}. Please wait a moment and retry.`;
  if (status === 502 || status === 503 || status === 504) {
    return `The server is unavailable (${status})${where}. It may be restarting or offline.${ref}`;
  }
  if (status >= 500) {
    return `Server error ${status}${where}: ${serverMessage || 'no details returned'}. This is a backend problem, so share this message with whoever maintains the server.${ref}`;
  }
 return `Request failed${where}${status ? ` (${status})` : ''}: ${serverMessage || redact(error.message) || fallback}.`;
};

export const logError = (label, error) => {
  console.error(label, {
    status: error?.response?.status ?? null,
    method: (error?.config?.method || '').toUpperCase() || null,
    path: safePath(error?.config?.url || ''),
    message: redact(error?.response?.data?.message || error?.message),
  });
};