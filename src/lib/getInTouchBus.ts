// Tiny event bus so the navbar / footer / cards can open the "Get in touch"
// slide-up panel without prop-drilling or a context provider.
type Listener = () => void;

let listener: Listener | null = null;

/** Open the "Get in touch" panel. */
export function openGetInTouch() {
  listener?.();
}

/** The panel registers here; returns an unsubscribe. */
export function onOpenGetInTouch(l: Listener) {
  listener = l;
  return () => {
    if (listener === l) listener = null;
  };
}
