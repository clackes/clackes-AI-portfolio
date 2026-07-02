// Guestbook API: persistent message board with GitHub/Google OAuth sign-in.
// Messages are stored in guestbook.json. Identities are carried in a short
// HMAC-signed token so posting is stateless (no session store needed).
// If no OAuth apps are configured, a "demo" sign-in is enabled so the board
// still works locally.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'guestbook.json');
const SECRET = process.env.SESSION_SECRET || 'dev-guestbook-secret-change-me';

const GH_ID = process.env.GITHUB_CLIENT_ID;
const GH_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GG_ID = process.env.GOOGLE_CLIENT_ID;
const GG_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const WEB_BASE = process.env.PUBLIC_BASE_URL || 'http://localhost:3000'; // frontend origin
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8787'; // this server

// ── storage ────────────────────────────────────────────────────────────────
function seed() {
  return [
    {
      id: 'seed-1',
      name: 'Alberto Vergani',
      avatar: '',
      text: 'The first version of this website is now complete!',
      provider: 'owner',
      createdAt: '2026-07-01T10:00:00.000Z',
    },
  ];
}
function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    const s = seed();
    save(s);
    return s;
  }
}
function save(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}

// ── signed identity tokens ───────────────────────────────────────────────────
function sign(obj) {
  const data = Buffer.from(JSON.stringify(obj)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString());
  } catch {
    return null;
  }
}

const githubReady = Boolean(GH_ID && GH_SECRET);
const googleReady = Boolean(GG_ID && GG_SECRET);
const demoAllowed = () => (!githubReady && !googleReady) || process.env.ALLOW_DEMO_SIGNIN === 'true';

export const guestbook = express.Router();

// list messages
guestbook.get('/guestbook', (_req, res) => {
  res.json({ messages: load() });
});

// which sign-in methods are available
guestbook.get('/auth/config', (_req, res) => {
  res.json({ github: githubReady, google: googleReady, demo: demoAllowed() });
});

// post a message (needs a valid signed token, or demo identity when allowed)
guestbook.post('/guestbook', (req, res) => {
  const { text, token, name, avatar } = req.body || {};
  const clean = String(text ?? '').trim().slice(0, 280);
  if (!clean) return res.status(400).json({ error: 'Your message is empty.' });

  let identity = verify(token);
  if (!identity) {
    if (demoAllowed() && name) {
      identity = { name: String(name).slice(0, 40), avatar: avatar || '', provider: 'demo' };
    } else {
      return res.status(401).json({ error: 'Please sign in to leave a message.' });
    }
  }

  const list = load();
  const message = {
    id: crypto.randomUUID(),
    name: identity.name,
    avatar: identity.avatar || '',
    text: clean,
    provider: identity.provider || 'oauth',
    createdAt: new Date().toISOString(),
  };
  list.push(message);
  save(list);
  res.json({ message });
});

// demo sign-in — issues a token without OAuth (local/dev only)
guestbook.get('/auth/demo', (req, res) => {
  if (!demoAllowed()) return res.status(403).json({ error: 'Demo sign-in is disabled.' });
  const name = String(req.query.name || 'Guest').slice(0, 40);
  res.json({ token: sign({ name, avatar: '', provider: 'demo' }) });
});

// ── GitHub OAuth ─────────────────────────────────────────────────────────────
guestbook.get('/auth/github', (_req, res) => {
  if (!githubReady) return res.redirect(`${WEB_BASE}/guestbook?error=github_not_configured`);
  const u = new URL('https://github.com/login/oauth/authorize');
  u.searchParams.set('client_id', GH_ID);
  u.searchParams.set('redirect_uri', `${API_BASE}/api/auth/github/callback`);
  u.searchParams.set('scope', 'read:user');
  res.redirect(u.toString());
});
guestbook.get('/auth/github/callback', async (req, res) => {
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: GH_ID,
        client_secret: GH_SECRET,
        code: req.query.code,
        redirect_uri: `${API_BASE}/api/auth/github/callback`,
      }),
    }).then((r) => r.json());
    const profile = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenRes.access_token}`, 'User-Agent': 'guestbook' },
    }).then((r) => r.json());
    const token = sign({
      name: profile.name || profile.login,
      avatar: profile.avatar_url || '',
      provider: 'github',
      id: String(profile.id),
    });
    res.redirect(`${WEB_BASE}/guestbook?auth=${encodeURIComponent(token)}`);
  } catch {
    res.redirect(`${WEB_BASE}/guestbook?error=github`);
  }
});

// ── Google OAuth ─────────────────────────────────────────────────────────────
guestbook.get('/auth/google', (_req, res) => {
  if (!googleReady) return res.redirect(`${WEB_BASE}/guestbook?error=google_not_configured`);
  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.searchParams.set('client_id', GG_ID);
  u.searchParams.set('redirect_uri', `${API_BASE}/api/auth/google/callback`);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', 'openid profile');
  res.redirect(u.toString());
});
guestbook.get('/auth/google/callback', async (req, res) => {
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GG_ID,
        client_secret: GG_SECRET,
        code: String(req.query.code || ''),
        grant_type: 'authorization_code',
        redirect_uri: `${API_BASE}/api/auth/google/callback`,
      }),
    }).then((r) => r.json());
    const profile = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` },
    }).then((r) => r.json());
    const token = sign({
      name: profile.name || 'Google user',
      avatar: profile.picture || '',
      provider: 'google',
      id: String(profile.id),
    });
    res.redirect(`${WEB_BASE}/guestbook?auth=${encodeURIComponent(token)}`);
  } catch {
    res.redirect(`${WEB_BASE}/guestbook?error=google`);
  }
});
