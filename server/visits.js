// Cookieless visit counter. The browser sends a beacon per page view; the
// server keeps only daily totals. Unique visitors are counted with a hash of
// IP + user agent + a salt that changes every day and is never written to
// disk, so a visitor cannot be followed from one day to the next.
import path from 'node:path';
import crypto from 'node:crypto';
import { Router } from 'express';
import { DATA, readJson, writeJson } from './store.js';

const FILE = path.join(DATA, 'visits.json');
const KEEP_DAYS = 400;
const BOT = /bot|crawl|spider|slurp|preview|monitor|uptime|headless|lighthouse|curl|wget|python|go-http|axios|node-fetch|facebookexternalhit|whatsapp|telegram/i;

let db = readJson(FILE, { days: {} });
let salt = { day: '', value: '' };
const seen = new Map(); // day → Set of hashes (memory only)
let dirty = false;

const today = () => new Date().toISOString().slice(0, 10);
const bump = (obj, key, n = 1) => {
  if (!key) return;
  obj[key] = (obj[key] || 0) + n;
};
// Cap the long tails so one day can't grow without bound.
const cap = (obj, max = 60) => {
  const keys = Object.keys(obj);
  if (keys.length <= max) return;
  for (const k of keys.sort((a, b) => obj[a] - obj[b]).slice(0, keys.length - max)) delete obj[k];
};

function dayBucket(day) {
  db.days[day] ||= { views: 0, visitors: 0, paths: {}, refs: {}, countries: {}, devices: {}, clicks: {} };
  return db.days[day];
}

function refHost(ref) {
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '');
    if (/albertovergani\.com$/.test(h)) return '';
    if (/^(l\.)?instagram\.com$/.test(h)) return 'instagram.com';
    if (/(^|\.)facebook\.com$/.test(h)) return 'facebook.com';
    if (/^(t\.co|x\.com|twitter\.com)$/.test(h)) return 'x.com';
    if (/^(lnkd\.in|linkedin\.com)$/.test(h) || h.endsWith('.linkedin.com')) return 'linkedin.com';
    if (/google\./.test(h)) return 'google';
    return h.slice(0, 60);
  } catch {
    return '';
  }
}

export const visits = Router();

visits.post('/v', (req, res) => {
  res.status(204).end();
  const ua = String(req.headers['user-agent'] || '');
  if (!ua || BOT.test(ua)) return;
  const b = req.body || {};
  const kind = b.kind === 'click' ? 'click' : 'view';
  const day = today();
  const d = dayBucket(day);
  if (kind === 'click') {
    bump(d.clicks, String(b.target || '').slice(0, 200));
    cap(d.clicks);
  } else {
    const p = String(b.path || '/').slice(0, 80).replace(/[^\w/-]/g, '') || '/';
    d.views += 1;
    bump(d.paths, p);
    bump(d.refs, refHost(String(b.ref || '')));
    bump(d.countries, String(req.headers['cf-ipcountry'] || '').slice(0, 2).toUpperCase() || '??');
    bump(d.devices, /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop');
    if (salt.day !== day) {
      salt = { day, value: crypto.randomBytes(16).toString('hex') };
      for (const k of seen.keys()) if (k !== day) seen.delete(k);
    }
    const ip = String(req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '');
    const h = crypto.createHash('sha256').update(`${salt.value}|${ip}|${ua}`).digest('base64url').slice(0, 16);
    const set = seen.get(day) || new Set();
    seen.set(day, set);
    if (!set.has(h)) {
      set.add(h);
      d.visitors += 1;
    }
    cap(d.paths);
    cap(d.refs);
  }
  dirty = true;
});

function flush() {
  if (!dirty) return;
  dirty = false;
  const days = Object.keys(db.days).sort();
  for (const k of days.slice(0, Math.max(0, days.length - KEEP_DAYS))) delete db.days[k];
  try {
    writeJson(FILE, db);
  } catch (e) {
    console.error('[visits] save failed:', e?.message || e);
  }
}
setInterval(flush, 30_000).unref();
process.on('SIGTERM', () => {
  flush();
  process.exit(0);
});

/** Daily series plus totals for the last `n` days (for Nexus). */
export function visitsReport(n = 30) {
  flush();
  const out = [];
  const sum = { views: 0, visitors: 0, paths: {}, refs: {}, countries: {}, devices: {}, clicks: {} };
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    const d = db.days[day];
    out.push({ day, views: d?.views || 0, visitors: d?.visitors || 0 });
    if (!d) continue;
    sum.views += d.views;
    sum.visitors += d.visitors;
    for (const k of ['paths', 'refs', 'countries', 'devices', 'clicks']) for (const [key, v] of Object.entries(d[k] || {})) bump(sum[k], key, v);
  }
  const top = (o, m = 10) =>
    Object.entries(o)
      .sort((a, b) => b[1] - a[1])
      .slice(0, m)
      .map(([key, count]) => ({ key, count }));
  return {
    days: out,
    views: sum.views,
    visitors: sum.visitors,
    paths: top(sum.paths),
    refs: top(sum.refs),
    countries: top(sum.countries),
    devices: top(sum.devices),
    clicks: top(sum.clicks),
  };
}
