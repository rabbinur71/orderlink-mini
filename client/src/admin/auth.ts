import api from '../api';

const TOKEN_KEY = 'orderlink_admin_token';

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// initialize interceptor on module import
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}