// Minimal path-based navigation (no router library). Updates the URL and
// notifies listeners so App can swap the rendered page.
export function navigate(to: string) {
  if (window.location.pathname === to) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
