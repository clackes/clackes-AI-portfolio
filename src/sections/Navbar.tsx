import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Calendar } from 'lucide-react';
import { useLang, useT } from '@/i18n';
import { navigate } from '@/lib/nav';
import { openGetInTouch } from '@/lib/getInTouchBus';

const linkDefs: { key: string; href: string; id: string }[] = [
  { key: 'nav.home', href: '#home', id: 'home' },
  { key: 'nav.about', href: '#about', id: 'about' },
  { key: 'nav.projects', href: '#work', id: 'work' },
  { key: 'nav.skills', href: '#skills', id: 'skills' },
  { key: 'nav.other', href: '#other', id: 'other' },
];

// Circular button that flips the language, showing the current one (EN / IT).
function LangCircle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'it' : 'en')}
      aria-label={t('nav.lang.label')}
      title={t('nav.lang.label')}
      className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-card-border bg-card/60 font-mono text-xs font-semibold uppercase tracking-widest text-foreground backdrop-blur transition-colors hover:border-accent/60 ${className}`}
    >
      {lang}
    </button>
  );
}

export function Navbar() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  // Scroll-spy — highlight the section currently in view (home page only).
  useEffect(() => {
    const sections = linkDefs
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Anchor links keep working from sub-pages (e.g. /book-call): jump home first.
  const onNavClick = (e: React.MouseEvent, href: string) => {
    const id = href.slice(1);
    if (window.location.pathname !== '/') {
      e.preventDefault();
      navigate('/');
      requestAnimationFrame(() =>
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })),
      );
    }
    setOpen(false);
  };

  const bookNow = () => {
    setOpen(false);
    openGetInTouch();
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      <nav className="relative mx-auto flex max-w-page items-center px-6 py-4 md:px-8">
        {/* left — language toggle */}
        <LangCircle />

        {/* center — pill nav */}
        <div className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-card-border bg-card/50 p-1.5 backdrop-blur md:flex">
          {linkDefs.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => onNavClick(e, l.href)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-card-border text-foreground' : 'text-muted hover:text-foreground'
                }`}
              >
                {t(l.key)}
              </a>
            );
          })}
        </div>

        {/* right — book a call. Icon-only circle on mobile (matches the lang
            + hamburger circles and leaves room for the centred hamburger);
            expands to the full text pill from md up. */}
        <div className="pointer-events-auto ml-auto">
          <button
            type="button"
            onClick={bookNow}
            aria-label={t('nav.book')}
            className="flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-card-border bg-card/40 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent/60 md:h-auto md:w-auto md:px-5 md:py-2.5"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">{t('nav.book')}</span>
          </button>
        </div>

        {/* mobile — centred hamburger opens a real dropdown (Radix: focus
            trap, Esc, outside-click, arrow-key nav all come for free) */}
        <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 md:hidden">
          <DropdownMenu.Root open={open} onOpenChange={setOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-card/60 backdrop-blur"
                aria-label="Toggle menu"
              >
                <div className="space-y-1.5">
                  <span className={`block h-px w-5 bg-foreground transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
                  <span className={`block h-px w-5 bg-foreground transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
                </div>
              </button>
            </DropdownMenu.Trigger>

            <AnimatePresence>
              {open && (
                <DropdownMenu.Portal forceMount>
                  <DropdownMenu.Content
                    forceMount
                    asChild
                    align="center"
                    sideOffset={12}
                    collisionPadding={16}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="pointer-events-auto w-56 origin-top rounded-2xl border border-card-border bg-background/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
                    >
                      {linkDefs.map((l) => (
                        <DropdownMenu.Item key={l.href} asChild className="outline-none">
                          <a
                            href={l.href}
                            onClick={(e) => onNavClick(e, l.href)}
                            className={`block cursor-pointer rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
                              active === l.id ? 'bg-card-border text-foreground' : 'text-foreground/90 hover:bg-card-border/60 hover:text-foreground'
                            }`}
                          >
                            {t(l.key)}
                          </a>
                        </DropdownMenu.Item>
                      ))}
                    </motion.div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              )}
            </AnimatePresence>
          </DropdownMenu.Root>
        </div>
      </nav>
    </motion.header>
  );
}
