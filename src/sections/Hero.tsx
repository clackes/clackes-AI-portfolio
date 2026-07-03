import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, ArrowUp } from 'lucide-react';
import { profile } from '@/data/content';
import { useLang, useT } from '@/i18n';

type Msg = { role: 'user' | 'assistant'; content: string };

const quickLinkDefs = [
  { key: 'hero.quick.work', href: '#work' },
  { key: 'hero.quick.about', href: '#about' },
  { key: 'hero.quick.skills', href: '#skills' },
  { key: 'hero.quick.contact', href: '#contact' },
];

export function Hero() {
  const t = useT();
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [q, setQ] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  // Browsers paint <video> as an opaque black rectangle until a frame is
  // ready, regardless of CSS background — poster helps but can itself still
  // be loading for a moment. Keep the video invisible and show a real <img>
  // underneath instead, so there's never a black flash, only ever the poster
  // photo cross-fading into the playing video.
  const [videoReady, setVideoReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const ask = async (text: string) => {
    const value = text.trim();
    if (!value || loading) return;
    const next = [...messages, { role: 'user' as const, content: value }];
    setMessages(next);
    setQ('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, lang }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.reply || data.error || t('hero.errorWrong') },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: t('hero.errorAI') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-start px-4 pb-40 pt-2"
      style={{ scrollMarginTop: 120 }}
    >
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        {/* avatar — animated memoji video */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative top-12 mb-2 h-40 w-40 overflow-hidden rounded-full sm:h-48 sm:w-48"
        >
          {/* The source video/poster has a pure #000 background baked in (no
              real alpha channel in mp4/webm). "screen" blend mode makes true
              black contribute nothing to the composite, so it reads as
              transparent against the page's near-black background instead of
              a visible dark disc. */}
          <img
            src="/avatar-poster.webp"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
          />
          <video
            className="absolute inset-0 h-full w-full object-cover mix-blend-screen transition-opacity duration-300"
            style={{ opacity: videoReady ? 1 : 0 }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/avatar-poster.webp"
            aria-label={`${profile.name} avatar`}
            onLoadedData={() => setVideoReady(true)}
          >
            <source src="/avatar.webm" type="video/webm" />
            <source src="/avatar.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* availability pill */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-3 mt-4 inline-flex items-center gap-2 rounded-full border border-card-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {t('hero.availability')}
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-bold tracking-tightest text-foreground sm:text-5xl md:text-6xl"
        >
          {t('hero.greeting')} <span className="gradient-shimmer">{profile.name}</span>
        </motion.h1>

        {/* big ask panel — always-visible AI entry point, like the reference */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 flex w-full max-w-2xl flex-col rounded-3xl border border-card-border bg-card/40 backdrop-blur"
        >
          {messages.length === 0 ? (
            /* empty-state prompt — click to focus the input */
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="flex min-h-[220px] flex-1 items-center justify-center px-6 py-10 text-center sm:min-h-[260px]"
            >
              <span className="inline-flex items-center gap-2 text-lg text-muted sm:text-xl">
                <Sparkles className="h-5 w-5 text-accent" />
                {t('hero.askEmpty')} {profile.name.split(' ')[0]}…
              </span>
            </button>
          ) : (
            /* conversation */
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="flex max-h-[320px] min-h-[220px] flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 text-left sm:min-h-[260px]"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-foreground text-background'
                        : 'bg-card text-foreground'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl bg-card px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-2 w-2 rounded-full bg-muted"
                        animate={reduced ? undefined : { y: [0, -4, 0] }}
                        transition={reduced ? undefined : { duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* quick links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 pb-5 font-mono text-xs uppercase tracking-widest text-muted">
            {quickLinkDefs.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
                {t(l.key)}
              </a>
            ))}
          </nav>

          {/* input row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
            className="border-t border-card-border p-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-card-border bg-background/60 py-2 pl-5 pr-2 transition-colors focus-within:border-accent/60">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`${t('hero.askPlaceholder')} ${profile.name.split(' ')[0]}…`}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none sm:text-base"
                aria-label={t('hero.askAria')}
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                aria-label={t('hero.askSubmit')}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-6 inline-flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-foreground"
      >
        {t('hero.scroll')}
        <motion.span
          animate={reduced ? undefined : { y: [0, 6, 0] }}
          transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block h-8 w-px bg-gradient-to-b from-muted to-transparent"
        />
      </motion.a>
    </section>
  );
}
