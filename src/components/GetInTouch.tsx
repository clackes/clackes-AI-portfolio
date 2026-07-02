import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Calendar, Mail, X, Copy, Check, Github, Linkedin } from 'lucide-react';
import { profile } from '@/data/content';
import { useT } from '@/i18n';
import { navigate } from '@/lib/nav';
import { onOpenGetInTouch } from '@/lib/getInTouchBus';

const gmailCompose = (to: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;

export function GetInTouch() {
  const t = useT();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => onOpenGetInTouch(() => setOpen(true)), []);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const goBook = () => {
    close();
    navigate('/book-call');
  };

  const github = profile.socials.find((s) => s.label === 'GitHub')?.href;
  const linkedin = profile.socials.find((s) => s.label === 'LinkedIn')?.href;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden />

          {/* sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('contact.title')}
            initial={reduced ? { opacity: 0 } : { y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 48, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-card-border bg-card p-6 shadow-2xl shadow-black/60 sm:p-8"
          >
            {/* grabber */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-card-border" />

            {/* close */}
            <button
              type="button"
              onClick={close}
              aria-label={t('contact.close')}
              className="absolute right-5 top-6 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-border hover:text-foreground sm:top-8"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-4xl font-bold tracking-tight text-foreground">{t('contact.title')}</h2>
            <p className="mt-2 text-muted">{t('contact.subtitle')}</p>

            {/* options */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={goBook}
                className="group/card flex flex-col items-start rounded-2xl border border-card-border bg-background/40 p-5 text-left transition-colors hover:border-accent/60"
              >
                <Calendar className="h-5 w-5 text-accent" />
                <span className="mt-8 block font-semibold text-foreground">{t('contact.book.title')}</span>
                <span className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                  {t('contact.book.sub')}
                </span>
              </button>

              <a
                href={gmailCompose(profile.email)}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="group/card flex flex-col items-start rounded-2xl border border-card-border bg-background/40 p-5 text-left transition-colors hover:border-accent/60"
              >
                <Mail className="h-5 w-5 text-accent" />
                <span className="mt-8 block font-semibold text-foreground">{t('contact.email.title')}</span>
                <span className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                  {t('contact.email.sub')}
                </span>
              </a>
            </div>

            {/* footer row */}
            <div className="mt-6 flex items-center justify-between border-t border-card-border/60 pt-5">
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? t('contact.copied') : t('contact.copy')}
              </button>

              <div className="flex items-center gap-1">
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-border hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-border hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                <a
                  href={gmailCompose(profile.email)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Email"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-border hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
