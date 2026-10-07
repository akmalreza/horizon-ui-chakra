import { api } from 'lib/apiClient';

export function login(email, password) {
  return api.post('/api/auth/login', { email, password });
}

export function fetchMe() {
  return api.get('/api/users/me', { auth: true });
}
