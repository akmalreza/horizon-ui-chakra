import { getToken } from 'lib/authStorage';

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError('Unable to reach the server', 0);
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(
      (data && data.error) || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options }),
  post: (path, body, options) =>
    request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: 'PATCH', body }),
};
