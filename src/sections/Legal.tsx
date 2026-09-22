// Privacy Policy + Terms of Service pages.
//
// The prose itself lives in server/legal-content.js — a plain-ESM module shared
// with the server's static prerenderer, so the text a crawler sees without
// JavaScript and the text a visitor sees are guaranteed to be the same words.
//
// The Privacy text describes what the app ACTUALLY does (booking -> Google
// Calendar, guestbook fields, Gemini chat, localStorage only, no cookies).
// If those flows change, change that file too.
import { ArrowLeft } from 'lucide-react';
import { useT, useLang } from '@/i18n';
import { navigate } from '@/lib/nav';
import { Navbar } from '@/sections/Navbar';
import { CONTENT, TITLES, UPDATED } from '../../server/legal-content.js';

export function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const t = useT();
  const { lang } = useLang();
  const blocks = CONTENT[kind][lang] ?? CONTENT[kind].en;
  const head = TITLES[kind][lang] ?? TITLES[kind].en;
  const other = kind === 'privacy' ? 'terms' : 'privacy';
  const otherLabel = TITLES[other][lang]?.title ?? TITLES[other].en.title;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* same faint dotted texture as the other standalone pages */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)',
          backgroundSize: '22px 22px',
          color: '#ffffff',
        }}
      />

      <main className="relative mx-auto max-w-2xl px-4 pb-24 pt-28 md:pt-36">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('links.back')}
        </button>

        <header>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-accent">{head.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tightest text-foreground sm:text-5xl">{head.title}</h1>
          <p className="mt-4 text-muted">{head.sub}</p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted">
            {lang === 'it' ? 'Ultimo aggiornamento' : 'Last updated'} · {UPDATED[lang] ?? UPDATED.en}
          </p>
        </header>

        <div className="mt-14 flex flex-col gap-10">
          {blocks.map((b, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{b.h}</h2>
              {b.p?.map((para, j) => (
                <p key={j} className="mt-3 leading-relaxed text-muted">
                  {para}
                </p>
              ))}
              {b.ul && (
                <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-muted marker:text-accent">
                  {b.ul.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* cross-link to the sibling document */}
        <div className="mt-16 border-t border-card-border pt-8">
          <button
            type="button"
            onClick={() => navigate(other === 'privacy' ? '/privacy' : '/terms')}
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            {otherLabel} →
          </button>
        </div>
      </main>
    </div>
  );
}
