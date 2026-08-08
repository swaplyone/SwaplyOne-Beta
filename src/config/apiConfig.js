// Central API Base URL helper for Local Dev & Production Render Deployment
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://swaplyone-beta.onrender.com' : '');

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export async function fetchWithRetry(url, options = {}, retries = 2, delayMs = 3500, onRetry = null) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      if (attempt === retries) throw err;
      if (onRetry) onRetry(attempt + 1, retries);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export default API_BASE;
