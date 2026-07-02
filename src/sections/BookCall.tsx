import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2, Clock, Video, MapPin, ChevronLeft, ChevronRight, ArrowLeft, Check,
} from 'lucide-react';
import { profile } from '@/data/content';
import { useLang, useT } from '@/i18n';
import { navigate } from '@/lib/nav';
import { Navbar } from '@/sections/Navbar';

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sameDay = (a: Date, b: Date) => ymd(a) === ymd(b);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Working hours: 09:00 → 17:30 every 30 minutes.
const ALL_SLOTS: string[] = [];
for (let h = 9; h < 18; h++) ALL_SLOTS.push(`${pad(h)}:00`, `${pad(h)}:30`);

export function BookCall() {
  const t = useT();
  const { lang } = useLang();

  const now = useMemo(() => new Date(), []);
  const startToday = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<Date | null>(startToday);
  const [slot, setSlot] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // Localized month title + Monday-first narrow weekday headers.
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(viewYear, viewMonth, 1)),
    [lang, viewYear, viewMonth],
  );
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i))); // Jan 1 2024 = Monday
  }, [lang]);

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const lead = (first.getDay() + 6) % 7; // Monday = 0
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
  }, [viewYear, viewMonth]);

  const atCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const prevMonth = () => {
    if (atCurrentMonth) return;
    const m = viewMonth - 1;
    if (m < 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth(m);
  };
  const nextMonth = () => {
    const m = viewMonth + 1;
    if (m > 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth(m);
  };

  const slots = useMemo(() => {
    if (!selected) return [];
    const isToday = sameDay(selected, now);
    return ALL_SLOTS.filter((s) => {
      if (!isToday) return true;
      const [hh, mm] = s.split(':').map(Number);
      const dt = new Date(selected);
      dt.setHours(hh, mm, 0, 0);
      return dt.getTime() > now.getTime();
    });
  }, [selected, now]);

  const pickDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() < startToday.getTime()) return; // no past days
    setSelected(d);
    setSlot(null);
  };

  const canSubmit = name.trim() && isEmail(email) && selected && slot && status !== 'loading';

  const submit = async () => {
    if (!name.trim() || !isEmail(email) || !selected || !slot) {
      setStatus('error');
      setErrorMsg(t('book.error.fields'));
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: topic.trim(),
          date: ymd(selected),
          time: slot,
          tz,
          durationMin: 30,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.error || 'failed');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t('book.error.fail'));
    }
  };

  const reset = () => {
    setStatus('idle');
    setSlot(null);
    setName('');
    setEmail('');
    setTopic('');
  };

  const dateLabel = selected
    ? new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(selected)
    : '';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 md:pt-36">
        {/* back link */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('book.back')}
        </button>

        {/* hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tightest text-foreground sm:text-6xl">
            {t('book.title.pre')}
            <span className="gradient-shimmer">{t('book.title.accent')}</span>
            {t('book.title.post')}
          </h1>
          <p className="mt-4 text-muted">{t('book.subtitle')}</p>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-12 max-w-lg rounded-2xl border border-card-border bg-card/40 p-8 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
              <Check className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-foreground">{t('book.success.title')}</h2>
            <p className="mt-2 text-muted">{t('book.success.body')}</p>
            <div className="mt-4 rounded-xl border border-card-border bg-background/40 p-4 text-sm text-foreground">
              <span className="font-semibold capitalize">{dateLabel}</span> · {slot} · {t('book.info.duration')}
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-card-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/60"
            >
              {t('book.success.another')}
            </button>
          </motion.div>
        ) : (
          <div className="mt-12 overflow-hidden rounded-2xl border border-card-border bg-card/40">
            {/* top: profile · calendar · slots */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)_minmax(0,0.95fr)]">
              {/* profile */}
              <div className="border-b border-card-border p-6 md:border-b-0 md:border-r">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-background font-mono text-xs font-bold uppercase text-foreground">
                    {profile.initials}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide text-foreground">{profile.name}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-muted">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-muted" /> {t('book.info.confirm')}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0 text-muted" /> {t('book.info.duration')}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Video className="h-4 w-4 shrink-0 text-muted" /> {t('book.info.meet')}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-muted" /> {t('book.info.place')}
                  </li>
                </ul>
              </div>

              {/* calendar */}
              <div className="border-b border-card-border p-6 md:border-b-0 md:border-r">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    <span className="uppercase">{monthLabel}</span>{' '}
                    <span className="text-muted">{viewYear}</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      disabled={atCurrentMonth}
                      aria-label="Previous month"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-border hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      aria-label="Next month"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-border hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {weekdays.map((w, i) => (
                    <span key={i} className="pb-2 font-mono text-[10px] uppercase tracking-widest text-muted/60">
                      {w}
                    </span>
                  ))}
                  {cells.map((day, i) => {
                    if (day === null) return <span key={`e${i}`} />;
                    const d = new Date(viewYear, viewMonth, day);
                    d.setHours(0, 0, 0, 0);
                    const past = d.getTime() < startToday.getTime();
                    const isSel = selected && sameDay(d, selected);
                    const weekend = [0, 6].includes(d.getDay());
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={past}
                        onClick={() => pickDay(day)}
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ${
                          isSel
                            ? 'bg-accent font-semibold text-white'
                            : past
                              ? 'cursor-not-allowed text-muted/25'
                              : weekend
                                ? 'text-muted/60 hover:bg-card-border hover:text-foreground'
                                : 'text-foreground hover:bg-card-border'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* slots */}
              <div className="p-6">
                <h3 className="text-xl font-bold uppercase leading-tight tracking-tight text-foreground">
                  {t('book.slots.title')}
                </h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted/70">
                  {t('book.slots.tz')} {tz}
                </p>

                {!selected ? (
                  <p className="mt-6 text-sm text-muted">{t('book.slots.pick')}</p>
                ) : slots.length === 0 ? (
                  <p className="mt-6 text-sm text-muted">{t('book.slots.none')}</p>
                ) : (
                  <div data-lenis-prevent className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1">
                    {slots.map((s) => {
                      const active = slot === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={`flex w-full items-center justify-center rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? 'border-accent bg-accent/15 text-foreground'
                              : 'border-card-border text-muted hover:border-accent/50 hover:text-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* form */}
            <div className="border-t border-card-border p-6 md:p-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                    {t('book.form.name')}
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('book.form.name.ph')}
                    className="w-full rounded-xl border border-card-border bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                    {t('book.form.email')}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('book.form.email.ph')}
                    className="w-full rounded-xl border border-card-border bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                  {t('book.form.topic')}
                </span>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value.slice(0, 300))}
                  placeholder={t('book.form.topic.ph')}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-card-border bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
                />
                <span className="mt-1 block text-right font-mono text-[10px] text-muted/60">{topic.length}/300</span>
              </label>

              {status === 'error' && errorMsg && (
                <p className="mt-3 text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === 'loading' ? t('book.confirming') : t('book.confirm')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
