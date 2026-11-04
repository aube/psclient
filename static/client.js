const API_BASE = '/api/v1/client';

export class ClientApiError extends Error {
  constructor(message, { status = 0, data = null, response = null } = {}) {
    super(message);
    this.name = 'ClientApiError';
    this.status = status;
    this.data = data;
    this.response = response;
  }
}

function getSiteUuid() {
  if (typeof window === 'undefined') return '';
  return window.__SITE_SETTINGS?.siteUuid || '';
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, value);
  }

  const result = query.toString();
  return result ? `?${result}` : '';
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text || null;
}

export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
  } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  const siteUuid = getSiteUuid();
  if (siteUuid && !requestHeaders['x-site-uuid']) {
    requestHeaders['x-site-uuid'] = siteUuid;
  }

  let payload;

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      payload = body;
    } else {
      if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }
      payload = JSON.stringify(body);
    }
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body: payload,
      credentials: 'same-origin',
      signal,
    });
  } catch (error) {
    throw new ClientApiError(error.message || 'Ошибка сети', { response: null });
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = (data && typeof data === 'object' && (data.error || data.message))
      || `Ошибка запроса (${response.status})`;

    throw new ClientApiError(String(message), {
      status: response.status,
      data,
      response,
    });
  }

  return data;
}

export const client = {
  request,

  getAccount: () => request(''),
  updateAccount: (data) => request('', { method: 'PATCH', body: data }),
  deleteAccount: () => request('', { method: 'DELETE' }),

  login: (data) => request('/login', { method: 'POST', body: data }),
  logout: () => request('/logout', { method: 'POST' }),
  register: (data) => request('/register', { method: 'POST', body: data }),
  resendVerification: () => request('/resend-verification', { method: 'POST' }),
  verifyEmail: (token) => request('/verify-email', {
    method: 'POST',
    body: typeof token === 'string' ? { token } : token,
  }),
  changePassword: (data) => request('/password', { method: 'PATCH', body: data }),

  getProfile: () => request('/profile'),
  createProfile: (data) => request('/profile', { method: 'POST', body: data }),
  updateProfile: (data) => request('/profile', { method: 'PATCH', body: data }),
  replaceProfile: (data) => request('/profile', { method: 'PUT', body: data }),

  getAvailability: (params) => request(`/availability${buildQuery(params)}`),
  getEvents: (params) => request(`/events${buildQuery(params)}`),
  getEvent: (uuid) => request(`/event/${encodeURIComponent(uuid)}`),
  book: (data) => request('/book', { method: 'POST', body: data }),
};

export default client;
