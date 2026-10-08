// =============================================================================
// CAS Cloudflare Worker — two free jobs in one:
//
//   POST /          "Write with AI": turns the details of a CAS entry into a
//                   first-person reflection draft (holds the Gemini key as a
//                   secret, never in the website).
//   POST /upload    Video upload: a signed-in editor uploads a video file; it
//                   is stored in an R2 bucket and the Worker returns a URL.
//   GET  /v/<key>   Serves an uploaded video (with range/seek support).
//
// ---- One-time setup (all free) ----------------------------------------------
// A) "Write with AI" (Gemini):
//   1. Get a free Gemini API key: https://aistudio.google.com/apikey
//   2. Create the Worker: https://dash.cloudflare.com -> Workers & Pages ->
//      Create -> Create Worker. Name it e.g. "cas-ai". Deploy. Edit code,
//      delete the sample, paste THIS whole file, Deploy.
//   3. Settings -> Variables and Secrets -> add a Secret named GEMINI_API_KEY
//      with your key. Deploy again.
//   4. Copy the Worker URL (https://cas-ai.<something>.workers.dev) into
//      src/ai-config.ts as AI_WORKER_URL, then rebuild + push.
//
// B) Video upload (R2 object storage, 10 GB free):
//   1. In the Cloudflare dashboard: R2 -> Overview -> (enable R2 if asked; it
//      wants a payment method on file but stays free within 10 GB). Create a
//      bucket named exactly  cas-videos.
//   2. Open the Worker -> Settings -> Bindings (or "Variables and Bindings") ->
//      Add -> R2 bucket. Variable name:  VIDEOS   Bucket:  cas-videos.  Deploy.
//   3. That's it. The Firebase database URL below already matches this project;
//      only change FIREBASE_DB_URL (as a plain variable) if you move projects.
//
// Optional: set ALLOW_ORIGIN to https://casportfolio.pl to lock down callers
// (defaults to "*").
// =============================================================================

// Gemini models tried in order; the first available and not overloaded wins.
// Override with a GEMINI_MODEL variable (no code edit needed).
const DEFAULT_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-2.5-flash'];

// Firebase Realtime Database (public URL; used only to check the uploader is an
// editor). Override with a FIREBASE_DB_URL variable.
const DEFAULT_DB_URL = 'https://komentarzecas-default-rtdb.europe-west1.firebasedatabase.app';

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB; Workers' request body limit
// Only browser-playable types, mapped to the file extension we store under so
// the website's <video> player recognises them.
const VIDEO_EXT = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
};

const LO = {
  1: { en: 'Identify own strengths and develop areas for growth', pl: 'Rozpoznawanie własnych mocnych stron i rozwijanie obszarów do poprawy' },
  2: { en: 'Demonstrate that challenges have been undertaken, developing new skills', pl: 'Podejmowanie wyzwań i rozwijanie nowych umiejętności' },
  3: { en: 'Demonstrate how to initiate and plan a CAS experience', pl: 'Inicjowanie i planowanie doświadczenia CAS' },
  4: { en: 'Show commitment to and perseverance in CAS experiences', pl: 'Zaangażowanie i wytrwałość w doświadczeniach CAS' },
  5: { en: 'Demonstrate the skills and recognise the benefits of working collaboratively', pl: 'Umiejętność współpracy i dostrzeganie korzyści z pracy zespołowej' },
  6: { en: 'Demonstrate engagement with issues of global significance', pl: 'Zaangażowanie w kwestie o znaczeniu globalnym' },
  7: { en: 'Recognise and consider the ethics of choices and actions', pl: 'Rozpoznawanie i rozważanie etyki wyborów i działań' },
};

function buildPrompt(b) {
  const lang = b.lang === 'pl' ? 'pl' : 'en';
  const langName = lang === 'pl' ? 'Polish' : 'English';
  const los = (b.los || []).map((n) => `LO${n}: ${LO[n] ? LO[n][lang] : ''}`).join('\n');
  const lines = [
    `Activity title: ${b.title}`,
    `CAS strand: ${b.strand}`,
    b.summary ? `Short description: ${b.summary}` : '',
    b.hours ? `Approximate hours: ${b.hours}` : '',
    los ? `Learning outcomes to address:\n${los}` : '',
    (b.captions && b.captions.length) ? `Photo captions (evidence): ${b.captions.join('; ')}` : '',
  ].filter(Boolean).join('\n');

  return [
    `You are helping an IB Diploma Programme student write a first-person CAS reflection.`,
    `Write the reflection in ${langName}.`,
    ``,
    `Details of the experience:`,
    lines,
    ``,
    `Instructions:`,
    `- Write in the first person, as the student, in a natural, honest, down-to-earth voice. Not flowery or corporate.`,
    `- 150 to 300 words.`,
    `- Use plain text with short sections. Start each section heading with "## " on its own line, then a blank line. Good sections: what I planned, what I did, what I learned. Separate paragraphs with a blank line.`,
    `- Naturally reflect the chosen learning outcomes without quoting them or writing "LO2" in the text.`,
    `- Do not invent specific facts you cannot know (exact names, precise numbers, dates). Keep details general and true, and leave room for the student to add specifics.`,
    `- Do not use em dashes or en dashes. Use commas, periods or colons instead.`,
    `- Output ONLY the reflection text. No preamble, no title, no quotation marks around it.`,
  ].join('\n');
}

// Pull the email out of a Firebase ID token WITHOUT trusting it; the token is
// actually verified by using it to read a node the rules protect (below).
function jwtEmail(token) {
  try {
    const part = token.split('.')[1];
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json))).email || null;
  } catch {
    return null;
  }
}

// Returns the editor's email if the bearer token belongs to a listed editor,
// else null. The Realtime Database read both verifies the token (an invalid or
// expired one is rejected) and enforces the editors allow-list.
async function authorizeEditor(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const email = jwtEmail(token);
  if (!email) return null;
  const key = email.toLowerCase().replace(/\./g, ',');
  const dbUrl = (env.FIREBASE_DB_URL || DEFAULT_DB_URL).replace(/\/$/, '');
  let r;
  try {
    r = await fetch(`${dbUrl}/editors/${encodeURIComponent(key)}.json?auth=${encodeURIComponent(token)}`);
  } catch {
    return null;
  }
  if (!r.ok) return null;
  const val = await r.json().catch(() => null);
  return val ? email : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      'Access-Control-Max-Age': '86400',
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ---- Serve an uploaded video -------------------------------------------
    if (url.pathname.startsWith('/v/') && (request.method === 'GET' || request.method === 'HEAD')) {
      if (!env.VIDEOS) return new Response('No video storage configured.', { status: 500, headers: cors });
      const key = decodeURIComponent(url.pathname.slice(3));
      const head = await env.VIDEOS.head(key);
      if (!head) return new Response('Not found.', { status: 404, headers: cors });
      const headers = new Headers(cors);
      head.writeHttpMetadata(headers);
      headers.set('etag', head.httpEtag);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      const size = head.size;

      const range = request.headers.get('Range');
      const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (m) {
        let start = m[1] === '' ? undefined : Number(m[1]);
        let end = m[2] === '' ? undefined : Number(m[2]);
        if (start === undefined) { start = Math.max(0, size - (end ?? 0)); end = size - 1; }
        else if (end === undefined || end >= size) end = size - 1;
        if (isNaN(start) || isNaN(end) || start > end || start >= size) {
          headers.set('Content-Range', `bytes */${size}`);
          return new Response(null, { status: 416, headers });
        }
        headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
        headers.set('Content-Length', String(end - start + 1));
        if (request.method === 'HEAD') return new Response(null, { status: 206, headers });
        const obj = await env.VIDEOS.get(key, { range: { offset: start, length: end - start + 1 } });
        return new Response(obj.body, { status: 206, headers });
      }

      headers.set('Content-Length', String(size));
      if (request.method === 'HEAD') return new Response(null, { status: 200, headers });
      const obj = await env.VIDEOS.get(key);
      return new Response(obj.body, { status: 200, headers });
    }

    // ---- Upload a video -----------------------------------------------------
    if (url.pathname === '/upload' && request.method === 'POST') {
      if (!env.VIDEOS) return json({ error: 'Video storage is not set up (missing VIDEOS bucket).' }, 500);
      const email = await authorizeEditor(request, env);
      if (!email) return json({ error: 'Only signed-in editors can upload videos.' }, 403);
      const ct = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
      const ext = VIDEO_EXT[ct];
      if (!ext) return json({ error: 'Unsupported format. Use MP4, WebM, OGG or MOV.' }, 415);
      const declared = Number(request.headers.get('Content-Length') || 0);
      if (declared > MAX_VIDEO_BYTES) return json({ error: 'Video is too large (max 100 MB).' }, 413);
      const body = await request.arrayBuffer();
      if (!body.byteLength) return json({ error: 'The upload was empty.' }, 400);
      if (body.byteLength > MAX_VIDEO_BYTES) return json({ error: 'Video is too large (max 100 MB).' }, 413);
      const key = `${crypto.randomUUID().replace(/-/g, '')}.${ext}`;
      try {
        await env.VIDEOS.put(key, body, { httpMetadata: { contentType: ct } });
      } catch (e) {
        return json({ error: 'Could not store the video. Try again.' }, 502);
      }
      return json({ url: `${url.origin}/v/${key}` });
    }

    // ---- Write with AI (default POST) --------------------------------------
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);
    if (!env.GEMINI_API_KEY) return json({ error: 'Worker is missing GEMINI_API_KEY' }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const b = {
      title: String(body.title || '').slice(0, 200),
      strand: String(body.strand || '').slice(0, 20),
      summary: String(body.summary || '').slice(0, 600),
      hours: Number(body.hours) || 0,
      lang: body.lang === 'pl' ? 'pl' : 'en',
      los: Array.isArray(body.los) ? body.los.map(Number).filter((n) => n >= 1 && n <= 7) : [],
      captions: Array.isArray(body.captions) ? body.captions.slice(0, 20).map((c) => String(c).slice(0, 200)) : [],
    };
    if (!b.title || !b.strand) return json({ error: 'Need at least a title and a strand.' }, 400);

    const models = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : DEFAULT_MODELS;
    const reqBody = JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(b) }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 1200, topP: 0.95 },
    });
    // Try each model; retry a model on a brief overload (503/429), skip it on 404,
    // and stop on a hard error (e.g. a bad key).
    let r = null, detail = '';
    outer: for (const model of models) {
      const api = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt) await new Promise((res) => setTimeout(res, 700 * attempt));
        try {
          r = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reqBody });
        } catch (e) {
          detail = 'Could not reach Gemini.';
          continue;
        }
        if (r.ok) break outer;
        detail = (await r.text()).slice(0, 300);
        if (r.status === 404) break; // model not available here, try the next one
        if (r.status !== 503 && r.status !== 429 && r.status < 500) break outer; // hard error
      }
    }
    if (!r || !r.ok) {
      return json({ error: 'Gemini error', detail }, 502);
    }
    const data = await r.json();
    const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
    if (!text) return json({ error: 'Gemini returned nothing. Try again.' }, 502);
    return json({ text });
  },
};
