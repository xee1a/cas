// URL of the free Cloudflare Worker that proxies the "Write with AI" button to
// Google Gemini (see worker/cas-ai-worker.js for the Worker code and setup).
//
// Leave this null and the AI button is hidden. After you deploy the Worker,
// paste its URL here (e.g. 'https://cas-ai.<your-subdomain>.workers.dev'),
// then rebuild and push. The Gemini API key lives in the Worker, never here.
export const AI_WORKER_URL: string | null = null;
