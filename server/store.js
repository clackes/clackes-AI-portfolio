// Site content store: published version, draft, and the history of every
// publish. Everything lives in server/data/ (a volume on the NAS), so edits
// made from Nexus go live without rebuilding the image.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA = path.join(__dirname, 'data');
export const UPLOADS = path.join(DATA, 'uploads');
const HISTORY = path.join(DATA, 'history');
const PUBLISHED = path.join(DATA, 'content.json');
const DRAFT = path.join(DATA, 'draft.json');
const HISTORY_KEEP = 60;

for (const d of [DATA, UPLOADS, HISTORY]) fs.mkdirSync(d, { recursive: true });

export const DEFAULTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'default-content.json'), 'utf8'));
export const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/strings.json'), 'utf8'));

export function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(file, value) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 1));
  fs.renameSync(tmp, file);
}

// ── shape checks ────────────────────────────────────────────────────────────
const str = (v, max = 4000) => String(v ?? '').slice(0, max);
const loc = (v, max) => (typeof v === 'string' ? { en: str(v, max), it: '' } : { en: str(v?.en, max), it: str(v?.it, max) });
const SLUG = /^[a-z0-9][a-z0-9-]{0,59}$/;
const URLISH = /^(https?:\/\/|mailto:|\/)/;

export function normalize(c) {
  if (!c || typeof c !== 'object') throw new Error('Contenuto non valido');
  const seen = new Set();
  const projects = (Array.isArray(c.projects) ? c.projects : []).slice(0, 60).map((p) => {
    const slug = str(p.slug, 60);
    if (!SLUG.test(slug)) throw new Error(`Indirizzo del progetto non valido: «${slug}» (solo lettere minuscole, numeri e trattini)`);
    if (seen.has(slug)) throw new Error(`Due progetti con lo stesso indirizzo: ${slug}`);
    seen.add(slug);
    if (!str(p.name).trim()) throw new Error(`Il progetto ${slug} non ha un nome`);
    const link = str(p.link, 500).trim();
    if (link && !URLISH.test(link)) throw new Error(`Il link di ${p.name} deve cominciare con https://`);
    return {
      slug,
      kind: p.kind === 'client' ? 'client' : 'build',
      hidden: Boolean(p.hidden),
      name: str(p.name, 120).trim(),
      tagline: loc(p.tagline, 200),
      blurb: loc(p.blurb, 800),
      description: loc(p.description, 4000),
      tags: (Array.isArray(p.tags) ? p.tags : []).map((t) => str(t, 40).trim()).filter(Boolean).slice(0, 16),
      image: str(p.image, 500),
      phones: (Array.isArray(p.phones) ? p.phones : []).map((x) => str(x, 500)).filter(Boolean).slice(0, 3),
      domain: str(p.domain, 200).trim(),
      year: str(p.year, 20).trim(),
      client: str(p.client, 120).trim(),
      link,
      gradient: Number.isInteger(p.gradient) ? Math.max(0, Math.min(2, p.gradient)) : 0,
    };
  });
  const skills = (Array.isArray(c.skills) ? c.skills : [])
    .slice(0, 80)
    .map((s) => ({ name: str(s.name, 40).trim(), logo: str(s.logo, 500), color: str(s.color, 20), hidden: Boolean(s.hidden) }))
    .filter((s) => s.name);
  const socials = (Array.isArray(c.profile?.socials) ? c.profile.socials : []).slice(0, 12).map((s) => ({
    label: str(s.label, 40).trim(),
    href: str(s.href, 500).trim(),
    handle: str(s.handle, 80).trim(),
  }));
  const texts = { en: {}, it: {} };
  for (const lang of ['en', 'it']) {
    for (const [k, v] of Object.entries(c.texts?.[lang] || {})) {
      // Only keys the site knows, and only when they differ from the default.
      if (k in STRINGS.en && typeof v === 'string' && v.trim() && v !== STRINGS[lang][k]) texts[lang][k] = v.slice(0, 2000);
    }
  }
  return {
    v: 1,
    profile: { email: str(c.profile?.email, 120).trim(), socials },
    projects,
    skills,
    texts,
    assistant: { extra: str(c.assistant?.extra, 6000) },
  };
}

// ── published / draft / history ─────────────────────────────────────────────
let cache = null;
export function published() {
  if (!cache) cache = readJson(PUBLISHED, null) || DEFAULTS;
  return cache;
}

export function draft() {
  return readJson(DRAFT, null) || published();
}

export function saveDraft(content) {
  const clean = normalize(content);
  writeJson(DRAFT, clean);
  return clean;
}

export function discardDraft() {
  fs.rmSync(DRAFT, { force: true });
}

export function isDirty() {
  return fs.existsSync(DRAFT) && JSON.stringify(readJson(DRAFT, null)) !== JSON.stringify(published());
}

export function meta() {
  return readJson(path.join(DATA, 'meta.json'), { publishedAt: null, note: '' });
}

export function publish(note) {
  const next = normalize(draft());
  const prev = published();
  const at = new Date().toISOString();
  const id = `${at.replace(/[:.]/g, '-')}-${crypto.randomBytes(2).toString('hex')}`;
  // History keeps what was online *before* each publish, so any state can come back.
  writeJson(path.join(HISTORY, `${id}.json`), { id, at, note: str(note, 200), replacedNote: meta().note || '', content: prev });
  writeJson(PUBLISHED, next);
  writeJson(path.join(DATA, 'meta.json'), { publishedAt: at, note: str(note, 200) });
  fs.rmSync(DRAFT, { force: true });
  cache = next;
  const old = fs.readdirSync(HISTORY).filter((f) => f.endsWith('.json')).sort();
  for (const f of old.slice(0, Math.max(0, old.length - HISTORY_KEEP))) fs.rmSync(path.join(HISTORY, f), { force: true });
  return { publishedAt: at };
}

export function history() {
  return fs
    .readdirSync(HISTORY)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
    .map((f) => {
      const h = readJson(path.join(HISTORY, f), null);
      return h && { id: h.id, at: h.at, note: h.note, replacedNote: h.replacedNote, projects: h.content?.projects?.length ?? 0 };
    })
    .filter(Boolean);
}

/** Put an old version back into the draft (it goes online only after Pubblica). */
export function restore(id) {
  if (!/^[\w-]+$/.test(id)) throw new Error('Versione non valida');
  const h = readJson(path.join(HISTORY, `${id}.json`), null);
  if (!h) throw new Error('Versione non trovata');
  return saveDraft(h.content);
}
