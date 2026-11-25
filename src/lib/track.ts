// Cookieless page-view counter: one small beacon per page view or outbound
// click. No identifiers are stored in the browser; the server only keeps
// daily totals (see server/visits.js).
export function track(kind: 'view' | 'click', target?: string) {
  if (typeof window === 'undefined' || window.__PORTFOLIO_PREVIEW__) return;
  try {
    const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : '';
    const body = JSON.stringify({ kind, path: window.location.pathname, target: target || '', ref });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/v', new Blob([body], { type: 'application/json' }));
    else fetch('/api/v', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch {
    /* never break the page for a counter */
  }
}
