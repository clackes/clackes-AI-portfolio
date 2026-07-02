import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

        {/* right — book a call */}
        <div className="pointer-events-auto ml-auto hidden md:block">
          <button
            type="button"
            onClick={bookNow}
            className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent/60"
          >
            <Calendar className="h-4 w-4" />
            {t('nav.book')}
          </button>
        </div>

        {/* mobile — hamburger */}
        <div className="pointer-events-auto ml-auto flex items-center gap-2 md:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-card/60 backdrop-blur"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <div className="space-y-1.5">
              <span className={`block h-px w-5 bg-foreground transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
              <span className={`block h-px w-5 bg-foreground transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mx-6 mt-2 overflow-hidden rounded-2xl border border-card-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {linkDefs.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => onNavClick(e, l.href)}
                  className="py-2 text-lg font-semibold text-foreground/90 hover:text-foreground"
                >
                  {t(l.key)}
                </a>
              ))}
              <button
                type="button"
                onClick={bookNow}
                className="mt-2 inline-flex w-max items-center gap-2 rounded-full border border-card-border px-5 py-2 text-sm font-semibold text-foreground"
              >
                <Calendar className="h-4 w-4" />
                {t('nav.book')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
