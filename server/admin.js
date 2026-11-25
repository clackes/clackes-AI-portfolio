// Admin API for Nexus ("Gestionale portfolio"). Two locks:
//  1. a bearer token (PORTFOLIO_ADMIN_TOKEN in .env), compared in constant time;
//  2. requests that came through Cloudflare (the public site) are refused
//     outright, so the admin API only answers on the private network.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as store from './store.js';
import { buildPersona } from './persona.js';
import { visitsReport } from './visits.js';
import { guestbookAll, guestbookDelete, guestbookOwnerPost, guestbookSet } from './guestbook.js';
import { bookingDelete, bookingSet, bookingsAll } from './booking.js';

const TOKEN = process.env.PORTFOLIO_ADMIN_TOKEN || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const STARTED = new Date().toISOString();
const IMAGE_MAX = 8 * 1024 * 1024;

export const admin = Router();

function same(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

admin.use((req, res, next) => {
  if (req.headers['cf-ray'] || req.headers['cf-connecting-ip']) return res.status(404).json({ error: 'Not found' });
  if (!TOKEN) return res.status(503).json({ error: 'PORTFOLIO_ADMIN_TOKEN non è impostato nel .env del portfolio' });
  const got = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!same(got, TOKEN)) return res.status(401).json({ error: 'Chiave del portfolio non valida' });
  res.set('Cache-Control', 'no-store');
  next();
});

const wrap = (fn) => async (req, res) => {
  try {
    res.json((await fn(req)) ?? { ok: true });
  } catch (e) {
    res.status(400).json({ error: e?.message || String(e) });
  }
};

// ── preview tokens (signed with the admin token, valid 2 hours) ─────────────
export function previewToken() {
  const exp = Date.now() + 2 * 3600_000;
  const sig = crypto.createHmac('sha256', `preview|${TOKEN}`).update(String(exp)).digest('base64url').slice(0, 32);
  return `${exp}.${sig}`;
}
export function previewValid(token) {
  if (!TOKEN || !token) return false;
  const [exp, sig] = String(token).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const want = crypto.createHmac('sha256', `preview|${TOKEN}`).update(exp).digest('base64url').slice(0, 32);
  return same(sig, want);
}

// ── content ─────────────────────────────────────────────────────────────────
admin.get(
  '/state',
  wrap(() => ({
    published: store.published(),
    draft: store.draft(),
    dirty: store.isDirty(),
    meta: store.meta(),
    history: store.history(),
    strings: store.STRINGS,
  })),
);
admin.put('/draft', wrap((req) => ({ draft: store.saveDraft(req.body?.content), dirty: store.isDirty() })));
admin.post('/discard', wrap(() => (store.discardDraft(), { draft: store.published(), dirty: false })));
admin.post('/publish', wrap((req) => ({ ...store.publish(req.body?.note), history: store.history() })));
admin.post('/restore', wrap((req) => ({ draft: store.restore(String(req.body?.id || '')), dirty: store.isDirty() })));
admin.post('/preview', wrap(() => ({ token: previewToken() })));

// ── images ──────────────────────────────────────────────────────────────────
function imageExt(buf) {
  if (buf.slice(0, 4).toString('hex') === '89504e47') return 'png';
  if (buf.slice(0, 3).toString('hex') === 'ffd8ff') return 'jpg';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  if (buf.slice(0, 3).toString() === 'GIF') return 'gif';
  if (buf.slice(4, 12).toString() === 'ftypavif') return 'avif';
  return null;
}

admin.post(
  '/upload',
  wrap((req) => {
    const buf = Buffer.from(String(req.body?.data || ''), 'base64');
    if (!buf.length) throw new Error("L'immagine è vuota");
    if (buf.length > IMAGE_MAX) throw new Error('Immagine troppo grande (al massimo 8 MB)');
    const ext = imageExt(buf);
    if (!ext) throw new Error('Formato non supportato: usa WebP, PNG, JPG, GIF o AVIF');
    const base =
      String(req.body?.name || 'immagine')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'immagine';
    const file = `${base}-${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8)}.${ext}`;
    fs.writeFileSync(path.join(store.UPLOADS, file), buf);
    return { url: `/uploads/${file}`, size: buf.length };
  }),
);

admin.get(
  '/uploads',
  wrap(() => ({
    files: fs
      .readdirSync(store.UPLOADS)
      .filter((f) => !f.startsWith('.'))
      .map((f) => ({ url: `/uploads/${f}`, size: fs.statSync(path.join(store.UPLOADS, f)).size, at: fs.statSync(path.join(store.UPLOADS, f)).mtime }))
      .sort((a, b) => +b.at - +a.at),
  })),
);

// ── translation (Gemini) ────────────────────────────────────────────────────
admin.post(
  '/translate',
  wrap(async (req) => {
    if (!genAI) throw new Error('Manca GEMINI_API_KEY: la traduzione automatica non è disponibile');
    const to = req.body?.to === 'it' ? 'it' : 'en';
    const texts = Object.fromEntries(
      Object.entries(req.body?.texts || {})
        .filter(([, v]) => typeof v === 'string' && v.trim())
        .slice(0, 40)
        .map(([k, v]) => [k, v.slice(0, 4000)]),
    );
    if (!Object.keys(texts).length) return { texts: {} };
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      systemInstruction:
        `You translate copy for Alberto Vergani's personal portfolio into ${to === 'it' ? 'Italian' : 'English'}. ` +
        'Keep the tone: plain, confident, concrete, no buzzwords, no exaggeration. Keep product names, brand names and ' +
        'technology names as they are. Return ONLY a JSON object with the same keys and the translated strings as values.',
    });
    const r = await model.generateContent(JSON.stringify(texts));
    let out;
    try {
      out = JSON.parse(r.response.text());
    } catch {
      throw new Error('La traduzione non è arrivata in un formato leggibile: riprova');
    }
    return { texts: Object.fromEntries(Object.keys(texts).map((k) => [k, typeof out[k] === 'string' ? out[k] : ''])) };
  }),
);

// ── AI assistant ────────────────────────────────────────────────────────────
admin.get('/assistant', wrap(() => ({ prompt: buildPersona(store.draft()), published: buildPersona(store.published()), model: MODEL, ready: Boolean(genAI) })));
admin.post(
  '/assistant/test',
  wrap(async (req) => {
    if (!genAI) throw new Error('Manca GEMINI_API_KEY');
    const msg = String(req.body?.message || '').trim().slice(0, 1000);
    if (!msg) throw new Error('Scrivi una domanda');
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: buildPersona(store.draft()) });
    const r = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: msg }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 400 } });
    return { reply: r.response.text() };
  }),
);

// ── guestbook & bookings ────────────────────────────────────────────────────
admin.get('/guestbook', wrap(() => ({ messages: guestbookAll().slice().reverse() })));
admin.post('/guestbook', wrap((req) => ({ message: guestbookOwnerPost(req.body?.text) })));
admin.patch('/guestbook/:id', wrap((req) => ({ message: guestbookSet(req.params.id, req.body || {}) })));
admin.delete('/guestbook/:id', wrap((req) => (guestbookDelete(req.params.id), { ok: true })));

admin.get('/bookings', wrap(() => ({ bookings: bookingsAll().slice().reverse() })));
admin.patch('/bookings/:id', wrap((req) => ({ booking: bookingSet(req.params.id, req.body || {}) })));
admin.delete('/bookings/:id', wrap((req) => (bookingDelete(req.params.id), { ok: true })));

// ── visits & status ─────────────────────────────────────────────────────────
admin.get('/visits', wrap((req) => visitsReport(Math.max(7, Math.min(365, Number(req.query.days) || 30)))));

admin.get(
  '/status',
  wrap(() => {
    const env = process.env;
    return {
      ok: true,
      startedAt: STARTED,
      uptime: Math.round(process.uptime()),
      node: process.version,
      commit: env.GIT_COMMIT || null,
      builtAt: env.BUILT_AT || null,
      publicUrl: env.PUBLIC_BASE_URL || null,
      memoryMb: Math.round(process.memoryUsage().rss / 1048576),
      ai: { ready: Boolean(genAI), model: MODEL },
      booking: Boolean(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN),
      guestbookLogin: { github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET), google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) },
      publishedAt: store.meta().publishedAt,
      dirty: store.isDirty(),
      counts: {
        projects: store.published().projects.filter((p) => !p.hidden).length,
        guestbook: guestbookAll().filter((m) => !m.hidden).length,
        bookings: bookingsAll().length,
      },
    };
  }),
);
