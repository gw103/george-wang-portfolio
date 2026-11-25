/**
 * Cloudflare Worker: sits between the portfolio chatbot and the Gemini API.
 *
 * The Gemini API key is stored here as a secret, so it never appears in the
 * public site or the GitHub repo (Google disables keys it finds published).
 *
 * Set these under the Worker's Settings -> Variables and Secrets:
 *   GEMINI_API_KEY  (Secret)  key from https://aistudio.google.com/apikey
 *   SITE_URL        (Text)    where the portfolio is served, no trailing slash,
 *                             e.g. https://gw103.github.io/george-wang-portfolio
 *
 * The chatbot's persona and facts are read from <SITE_URL>/chatbot-context.txt,
 * so updating that file in the repo updates the bot; no redeploy needed.
 */

const MODEL = 'gemini-3.5-flash-lite';
const MAX_MESSAGE_CHARS = 500;

export default {
  async fetch(request, env) {
    const siteUrl = String(env.SITE_URL || '').replace(/\/+$/, '');
    let siteOrigin = '';
    try {
      siteOrigin = new URL(siteUrl).origin;
    } catch {
      // handled below
    }

    const cors = {
      'Access-Control-Allow-Origin': siteOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...cors },
      });

    if (!env.GEMINI_API_KEY || !siteOrigin) {
      return reply({ error: 'Worker is missing GEMINI_API_KEY or SITE_URL' }, 500);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return reply({ error: 'Use POST' }, 405);
    }
    // Only the portfolio itself may use this endpoint.
    if (request.headers.get('Origin') !== siteOrigin) {
      return reply({ error: 'Origin not allowed' }, 403);
    }

    let message = '';
    try {
      const body = await request.json();
      message = String(body.message || '').trim().slice(0, MAX_MESSAGE_CHARS);
    } catch {
      // handled below
    }
    if (!message) {
      return reply({ error: 'Missing "message"' }, 400);
    }

    const contextRes = await fetch(`${siteUrl}/chatbot-context.txt`, {
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!contextRes.ok) {
      return reply({ error: `Could not load chatbot-context.txt (HTTP ${contextRes.status})` }, 502);
    }
    const context = (await contextRes.text()).trim();

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${context}\n\nUser: ${message}\n\nAssistant:` }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );

    const data = await geminiRes.json().catch(() => ({}));
    if (!geminiRes.ok) {
      // Full detail goes to the Worker's logs; the browser only gets the status.
      console.error('Gemini error:', geminiRes.status, JSON.stringify(data.error || data));
      const status = (data.error && data.error.status) || '';
      return reply({ error: `Gemini returned HTTP ${geminiRes.status} ${status}`.trim() }, 502);
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || '').join('').trim();
    if (!text) {
      console.error('Gemini returned no text:', JSON.stringify(data));
      return reply({ error: 'Gemini returned no text' }, 502);
    }
    return reply({ reply: text });
  },
};
