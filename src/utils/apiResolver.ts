// Centralized API Resolver for GoDaddy / Static Hosting
// Intercepts relative /api requests and routes them to Cloudflare Worker in production

const DEFAULT_WORKER_URL = 'https://sahayakbooks-api.goyalaclasses.workers.dev';

export function setupApiResolver() {
  const env = (import.meta as any).env || {};
  const customApiUrl = env.VITE_API_URL;
  const baseUrl = customApiUrl || (env.PROD ? DEFAULT_WORKER_URL : '');

  if (!baseUrl) return;

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const originalFetch = window.fetch;

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url: string;

    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof input === 'object' && 'url' in input) {
      url = (input as Request).url;
    } else {
      url = String(input);
    }

    if (url.startsWith('/api/') || url === '/api') {
      const targetUrl = `${cleanBaseUrl}${url}`;
      if (typeof input === 'string') {
        return originalFetch.call(this, targetUrl, init);
      } else if (input instanceof URL) {
        return originalFetch.call(this, new URL(targetUrl), init);
      } else if (input && typeof input === 'object' && 'url' in input) {
        const req = input as Request;
        return originalFetch.call(this, new Request(targetUrl, req), init);
      }
    }

    return originalFetch.call(this, input, init);
  };
}

setupApiResolver();
