const API_BASE = import.meta.env.VITE_CRMEB_API_BASE || '/api';
const API_ORIGIN = import.meta.env.VITE_CRMEB_API_ORIGIN || '';
const TOKEN_KEY = import.meta.env.VITE_CRMEB_TOKEN_KEY || 'Authori-zation';

function getToken() {
  return localStorage.getItem('crmeb_token') || localStorage.getItem(TOKEN_KEY) || '';
}

function joinUrl(path) {
  const cleanBase = API_BASE.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
}

export function crmebAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;
  if (!path.startsWith('/')) return path;
  return API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, '')}${path}` : path;
}

export async function crmebRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) headers.set(TOKEN_KEY, token.startsWith('Bearer ') ? token : `Bearer ${token}`);

  const response = await fetch(joinUrl(path), {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`CRMEB API ${response.status}`);
  }

  const payload = await response.json();
  if (payload.status && payload.status !== 200) {
    throw new Error(payload.msg || 'CRMEB API error');
  }

  return payload.data ?? payload;
}
