// =============================================================================
// CAS "Write with AI" proxy — a free Cloudflare Worker.
//
// It holds your Google Gemini API key (as a secret, never in the website) and
// turns the details of a CAS entry into a first-person reflection draft.
//
// ---- One-time setup (about 10 minutes, all free) ----------------------------
// 1. Get a free Gemini API key: https://aistudio.google.com/apikey
//    (Sign in with Google, "Create API key". The free tier is plenty.)
//
// 2. Create the Worker. Easiest, no install:
//    - Go to https://dash.cloudflare.com  ->  Workers & Pages  ->  Create  ->
//      Create Worker. Give it a name like "cas-ai". Click Deploy.
//    - Open the worker -> Edit code. Delete the sample, paste THIS whole file,
//      click Deploy.
//    - Settings -> Variables and Secrets -> add a Secret named GEMINI_API_KEY
//      with your key from step 1. Deploy again.
//    (Or with the CLI: `npx wrangler deploy worker/cas-ai-worker.js` then
//     `npx wrangler secret put GEMINI_API_KEY`.)
//
// 3. Copy the Worker URL (looks like https://cas-ai.<something>.workers.dev)
//    and paste it into src/ai-config.ts as AI_WORKER_URL, then rebuild + push.
//
// Optional: restrict who can call it by setting an ALLOW_ORIGIN variable to
// https://casportfolio.pl (defaults to "*", i.e. any site).
// =============================================================================

// Tried in order; the first that is available and not overloaded wins. Override
// with a GEMINI_MODEL variable in the Worker settings (no code edit needed).
const DEFAULT_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-2.5-flash'];

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

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt) await new Promise((res) => setTimeout(res, 700 * attempt));
        try {
          r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reqBody });
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
