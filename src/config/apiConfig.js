// Central API Base URL helper for Local Dev & Production Render Deployment
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://swaplyone-beta.onrender.com' : '');

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export default API_BASE;
