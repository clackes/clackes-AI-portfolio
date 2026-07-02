import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, LogOut } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';
import { navigate } from '@/lib/nav';
import { profile } from '@/data/content';
import { useT, useLang, type Lang } from '@/i18n';

type Message = {
  id: string;
  name: string;
  avatar?: string;
  text: string;
  provider: string;
  createdAt: string;
};
type User = { name: string; avatar?: string; provider: string } | null;
type Config = { github: boolean; google: boolean; demo: boolean };

function decodeToken(token: string): User {
  try {
    const b64 = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function timeAgo(iso: string, t: (k: string) => string): string {
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const day = 86400;
  if (secs < 60) return t('guest.time.now');
  if (secs < 3600) return `${Math.floor(secs / 60)}${t('guest.time.m')}`;
  if (secs < day) return `${Math.floor(secs / 3600)}${t('guest.time.h')}`;
  if (secs < day * 30) return `${Math.floor(secs / day)}${t('guest.time.d')}`;
  return `${Math.floor(secs / (day * 30))}${t('guest.time.mo')}`;
}
function shortDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { month: 'short', day: 'numeric' });
}

const AVATAR_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];
function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="h-11 w-11 rounded-full object-cover" />;
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <span
      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ background: color }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function Guestbook() {
  const t = useT();
  const { lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<Config>({ github: false, google: false, demo: true });
  const [user, setUser] = useState<User>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    // capture ?auth= / ?error= from an OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    const err = params.get('error');
    if (auth) {
      localStorage.setItem('gb_token', auth);
      window.history.replaceState({}, '', '/guestbook');
    }
    if (err) setError(`${t('guest.errAuth')} (${err})`);

    const token = localStorage.getItem('gb_token');
    if (token) {
      tokenRef.current = token;
      setUser(decodeToken(token));
    }

    fetch('/api/auth/config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
    fetch('/api/guestbook')
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, []);

  async function demoSignIn() {
    const name = window.prompt(t('guest.namePrompt'));
    if (!name) return;
    const d = await fetch(`/api/auth/demo?name=${encodeURIComponent(name)}`).then((r) => r.json());
    if (d.token) {
      localStorage.setItem('gb_token', d.token);
      tokenRef.current = d.token;
      setUser(decodeToken(d.token));
    }
  }

  function signOut() {
    localStorage.removeItem('gb_token');
    tokenRef.current = null;
    setUser(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, token: tokenRef.current, name: user?.name, avatar: user?.avatar }),
      });
      const d = await res.json();
      if (d.message) {
        setMessages((m) => [...m, d.message]);
        setText('');
      } else {
        setError(d.error || t('guest.errPost'));
      }
    } catch {
      setError(t('guest.errOffline'));
    } finally {
      setSending(false);
    }
  }

  // newest first
  const ordered = [...messages].reverse();

  return (
    <div className="min-h-screen px-4 pb-24 pt-8">
      {/* top bar */}
      <div className="mx-auto flex max-w-3xl items-center justify-between py-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t('guest.back')}
        </button>
        <span className="text-sm font-bold text-foreground">{profile.name}</span>
      </div>

      <div className="mx-auto max-w-3xl pt-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{t('guest.eyebrow')}</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tightest text-foreground sm:text-7xl">
          {t('guest.title.pre')}<span className="gradient-shimmer">{t('guest.title.accent')}</span>
        </h1>
        <p className="mt-5 text-lg text-muted">{t('guest.subtitle')}</p>

        {/* sign-in / compose card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 rounded-3xl border border-accent/20 bg-card/40 p-6 backdrop-blur sm:p-8"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.08)' }}
        >
          {user ? (
            <form onSubmit={submit}>
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Avatar name={user.name} url={user.avatar} />
                  {t('guest.signedInAs')} <strong className="text-foreground">{user.name}</strong>
                </span>
                <button type="button" onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground">
                  <LogOut className="h-3.5 w-3.5" /> {t('guest.signOut')}
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder={t('guest.placeholder')}
                className="w-full resize-none rounded-xl border border-card-border bg-background/60 p-4 text-sm text-foreground placeholder:text-muted focus:border-accent/60 focus:outline-none"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted">{text.length}/280</span>
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity disabled:opacity-40"
                >
                  {sending ? t('guest.pinning') : t('guest.pin')}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-muted">{t('guest.prompt')}</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {config.github && (
                  <a
                    href="/api/auth/github"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-card-border bg-background/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 sm:w-auto"
                  >
                    <SiGithub size={18} /> {t('guest.github')}
                  </a>
                )}
                {config.google && (
                  <a
                    href="/api/auth/google"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-card-border bg-background/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 sm:w-auto"
                  >
                    <FcGoogle size={18} /> {t('guest.google')}
                  </a>
                )}
                {!config.github && !config.google && config.demo && (
                  <button
                    onClick={demoSignIn}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-card-border bg-background/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30"
                  >
                    {t('guest.demo')}
                  </button>
                )}
              </div>
              {!config.github && !config.google && (
                <p className="mt-4 font-mono text-[11px] text-muted/70">
                  {t('guest.oauthHint')}
                </p>
              )}
            </>
          )}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </motion.div>
      </div>

      {/* messages */}
      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        {ordered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
            className="rounded-2xl border border-card-border bg-card/50 p-5"
          >
            <div className="flex items-center gap-3">
              <Avatar name={m.name} url={m.avatar} />
              <div>
                <p className="text-sm font-bold text-foreground">{m.name}</p>
                <p className="font-mono text-[11px] text-muted">
                  {shortDate(m.createdAt, lang)} · {timeAgo(m.createdAt, t)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-foreground/90">{m.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
