// Static fallback content for crawlers that don't execute JavaScript.
//
// The frontend is a client-rendered SPA: the shipped index.html contains only
// <div id="root"></div>, so anything that fetches the page without running JS
// sees a blank document. Google's OAuth *branding verification* checker is one
// of those — it reported the home page as "unresponsive" for exactly this
// reason, and it checks the privacy-policy URL the same way.
//
// So we inject real, readable markup into #root before sending the document.
// React's createRoot() clears the container on mount, so the live app replaces
// this the moment the bundle runs; it doubles as a sane loading state.
//
// The legal prose comes from legal-content.js, the same module the React page
// imports — the crawler and the visitor read identical words by construction.
import { CONTENT, TITLES, UPDATED, OWNER } from './legal-content.js';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Inline styles only: the Tailwind stylesheet may not have applied yet (and a
// text-extracting crawler ignores CSS anyway), but we still want the brief
// pre-hydration paint to match the dark theme instead of flashing white.
const WRAP = 'max-width:42rem;margin:0 auto;padding:7rem 1rem 6rem;color:#a1a1aa;font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.7';
const H1 = 'color:#fafafa;font-size:2.25rem;line-height:1.15;margin:0 0 1rem;letter-spacing:-0.03em';
const H2 = 'color:#fafafa;font-size:1.2rem;margin:2.5rem 0 0.6rem;letter-spacing:-0.01em';

function legalHtml(kind) {
  const head = TITLES[kind].en;
  const blocks = CONTENT[kind].en;
  const other = kind === 'privacy' ? 'terms' : 'privacy';

  const body = blocks
    .map((b) => {
      const ps = (b.p || []).map((p) => `<p>${esc(p)}</p>`).join('');
      const ul = b.ul?.length ? `<ul>${b.ul.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : '';
      return `<section><h2 style="${H2}">${esc(b.h)}</h2>${ps}${ul}</section>`;
    })
    .join('');

  return `<div style="${WRAP}">
<h1 style="${H1}">${esc(head.title)}</h1>
<p>${esc(head.sub)}</p>
<p><small>Last updated: ${esc(UPDATED.en)} &middot; ${esc(OWNER.name)} &middot; <a href="mailto:${esc(OWNER.email)}" style="color:#a1a1aa">${esc(OWNER.email)}</a></small></p>
${body}
<p><a href="/${other}" style="color:#a1a1aa">${esc(TITLES[other].en.title)}</a> &middot; <a href="/" style="color:#a1a1aa">Home</a></p>
</div>`;
}

function homeHtml() {
  return `<div style="${WRAP}">
<h1 style="${H1}">${esc(OWNER.name)}</h1>
<p>Developer &middot; AI Builder &middot; Social Media</p>
<p>Full-stack developer who builds with AI — and engineers short-form video that performs on Instagram and TikTok. This is my personal portfolio: my work, an AI assistant that answers questions about me, a guestbook, and a form to book an intro call.</p>
<p>Contact: <a href="mailto:${esc(OWNER.email)}" style="color:#a1a1aa">${esc(OWNER.email)}</a></p>
<p>
  <a href="/book-call" style="color:#a1a1aa">Book a call</a> &middot;
  <a href="/guestbook" style="color:#a1a1aa">Guestbook</a> &middot;
  <a href="/privacy" style="color:#a1a1aa">Privacy Policy</a> &middot;
  <a href="/terms" style="color:#a1a1aa">Terms of Service</a>
</p>
</div>`;
}

// Which static body, if any, a given path gets. Unlisted SPA routes keep the
// plain empty shell — they are app screens, not pages anyone needs to verify.
function fallbackFor(pathname) {
  if (pathname === '/' || pathname === '/index.html') return homeHtml();
  if (pathname === '/privacy') return legalHtml('privacy');
  if (pathname === '/terms') return legalHtml('terms');
  return null;
}

// Also swap <title>/<meta description> so the legal pages identify themselves
// to a crawler that only reads the head.
export function renderShell(template, pathname) {
  const body = fallbackFor(pathname);
  if (!body) return template;

  let html = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  if (pathname === '/privacy' || pathname === '/terms') {
    const kind = pathname === '/privacy' ? 'privacy' : 'terms';
    const { title, sub } = TITLES[kind].en;
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)} — ${esc(OWNER.name)}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/, `$1${esc(sub)}$2`);
  }
  return html;
}
