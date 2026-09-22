// Tiny local backend that proxies chat to Gemini.
// The API key lives ONLY here (server-side, from .env) — it never reaches the browser.
import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { renderShell } from './prerender.js';
import { PERSONA } from './persona.js';
import { localAnswer } from './fallback.js';
import { guestbook } from './guestbook.js';
import { booking } from './booking.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

// Guestbook + auth routes (message board with GitHub/Google sign-in).
app.use('/api', guestbook);

// Booking routes (Google Calendar + Meet).
app.use('/api', booking);

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!API_KEY) {
  console.warn(
    '\n[server] GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.\n'
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(API_KEY), model: MODEL });
});

// POST /api/chat  { messages: [{ role: 'user'|'assistant', content: string }], lang?: 'en'|'it' }
app.post('/api/chat', async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const langHint = req.body?.lang === 'it' || req.body?.lang === 'en' ? req.body.lang : undefined;

  // No key yet → answer locally so the "Ask me anything" box still works.
  if (!genAI) {
    return res.json({ reply: localAnswer(messages, langHint), mode: 'local' });
  }

  try {
    // Nudge Gemini toward the visitor's language explicitly, on top of PERSONA.
    const languageDirective = langHint === 'it'
      ? '\n\nThe visitor is browsing in Italian. Reply in Italian unless they clearly write in English.'
      : langHint === 'en'
        ? '\n\nThe visitor is browsing in English. Reply in English unless they clearly write in another language.'
        : '';
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: PERSONA + languageDirective,
    });

    // Map the chat transcript to Gemini's history format. Gemini requires the
    // history to start with a 'user' turn, so we drop any leading assistant msgs.
    const history = messages
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content ?? '') }],
      }));
    while (history.length && history[0].role === 'model') history.shift();

    const last = messages[messages.length - 1];
    const chat = model.startChat({
      history,
      generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
    });
    const result = await chat.sendMessage(String(last?.content ?? ''));
    res.json({ reply: result.response.text(), mode: 'gemini' });
  } catch (err) {
    // Gemini failed (quota/billing/network) — degrade gracefully to the local
    // responder so the chat always answers instead of erroring out.
    console.error('[server] Gemini error, using local fallback:', err?.message || err);
    res.json({ reply: localAnswer(messages, langHint), mode: 'local-fallback' });
  }
});

// In production the built frontend (dist/) is served by this same process, so a
// single container serves both the SPA and the /api backend. In dev this folder
// doesn't exist (Vite serves the UI on :3000 and proxies /api here), so we skip.
const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  // index:false — the document for "/" must go through the prerenderer below,
  // not be served straight off disk by the static middleware.
  app.use(express.static(distDir, { index: false }));

  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

  // SPA fallback for client-side routes (/guestbook, /book-call, /links …) —
  // but never swallow /api/* requests. renderShell() injects static content for
  // the pages a non-JS crawler has to be able to read (see prerender.js).
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.type('html').send(renderShell(template, req.path));
  });
  console.log('[server] serving built frontend from', distDir);
}

app.listen(PORT, () => {
  console.log(`[server] AI proxy listening on http://localhost:${PORT}`);
});
