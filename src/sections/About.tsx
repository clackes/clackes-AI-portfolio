import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { profile, principles } from '@/data/content';
import { useT } from '@/i18n';
import type { IconType } from 'react-icons';
import {
  SiReact, SiNextdotjs, SiTypescript, SiPython, SiFastapi,
  SiNodedotjs, SiTailwindcss, SiDocker, SiGooglegemini, SiPostgresql,
} from 'react-icons/si';
import luganoMap from '@/assets/lugano-map.webp';

/* ────────────────────────────────────────────────────────────────────────
   About bento — 1:1 with the reference (pszostak.pl) grid & type scale.

   Desktop grid  md:grid-rows-[9rem_auto_9rem]
   row 1 (9rem):  [ Name ]      [ ===== Hover deck (span 2) ===== ]
   row 2 (auto):  [ Mindset ]   [ Portrait ]        [ Craft ]
   row 3 (9rem):  [ (Mindset) ] [ Location ]        [ (Craft) ]
   ──────────────────────────────────────────────────────────────────────── */

const CARD_SHADOW = '0 -5px 30px rgba(0,0,0,0.3)';
const ACCENT_SHADOW = '0 -5px 35px rgba(59,130,246,0.5)';

// ── Name tile ──────────────────────────────────────────────────────────────
function NameCard({ className = '' }: { className?: string }) {
  const t = useT();
  const lines = profile.name.split(' ');
  return (
    <div
      className={`group relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-card to-card-border p-7 text-center backdrop-blur-md transition-colors duration-300 hover:border-accent/60 ${className}`}
    >
      {/* soft radial glow behind the name */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="h-full w-full blur-3xl"
          style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.10) 0%, transparent 70%)', mixBlendMode: 'overlay' }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-1">
        <div className="flex w-full flex-col items-center pb-2">
          {lines.map((word) => (
            <span
              key={word}
              className="bg-gradient-to-b from-foreground to-muted bg-clip-text text-4xl font-black uppercase leading-[1.1] tracking-tighter text-transparent"
              style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.25))' }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="-mt-1 flex flex-col items-center gap-2">
          <div className="h-px w-12 bg-foreground/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted opacity-80">{t('about.role')}</span>
        </div>
      </div>
    </div>
  );
}

// ── Hover-to-read-more fanned deck ──────────────────────────────────────────
function DeckCard({
  pr,
  variant,
  hovered,
  setHovered,
  index,
}: {
  pr: { n: string; title: string; body: string };
  variant: 'left' | 'mid' | 'right';
  hovered: number | null;
  setHovered: (v: number | null) => void;
  index: number;
}) {
  const t = useT();
  const title = t(`about.principles.${pr.n}.title`);
  const body = t(`about.principles.${pr.n}.body`);
  const isHov = hovered === index;
  const mid = variant === 'mid';
  const baseY = mid ? 82 : 94;
  const y = isHov ? baseY - 20 : baseY;
  const layout =
    variant === 'left'
      ? 'w-1/3 h-44 -mr-6 z-10 pr-6 text-left'
      : variant === 'right'
        ? 'w-1/3 h-44 -ml-6 z-10 pl-6 text-right'
        : 'w-2/5 h-48 z-20 text-center';

  return (
    <div
      onMouseEnter={() => setHovered(index)}
      style={{
        transform: `translateY(${y}px)`,
        boxShadow: isHov ? ACCENT_SHADOW : CARD_SHADOW,
        borderColor: isHov ? 'rgba(59,130,246,0.5)' : 'rgba(228,228,231,0.1)',
        zIndex: isHov ? 30 : undefined,
      }}
      className={`group/card relative flex flex-col justify-start overflow-hidden rounded-t-xl border border-b-0 bg-card p-4 transition-[transform,box-shadow,border-color] duration-300 ${layout}`}
    >
      <div
        className="absolute inset-x-1/4 top-0 h-px transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.5), transparent)',
          opacity: isHov ? 1 : 0,
        }}
      />
      <div className="relative z-10">
        <span
          className={`block uppercase text-foreground ${
            mid ? 'mb-1 text-[12px] font-black leading-none tracking-tight' : 'text-[10px] font-bold leading-tight opacity-90'
          }`}
        >
          {title}
        </span>
        <span
          className="mt-2 block text-[10px] leading-snug text-muted transition-all duration-300"
          style={
            isHov
              ? { opacity: 1 }
              : {
                  opacity: 0.5,
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 15%, transparent 75%)',
                  maskImage: 'linear-gradient(to bottom, black 0%, black 15%, transparent 75%)',
                }
          }
        >
          {body}
        </span>
      </div>
    </div>
  );
}

function PrinciplesCard({ className = '' }: { className?: string }) {
  const t = useT();
  const [hovered, setHovered] = useState<number | null>(null);
  const variants = ['left', 'mid', 'right'] as const;
  return (
    <div
      className={`group relative hidden h-32 overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-card to-card-border backdrop-blur-md transition-colors duration-300 hover:border-accent/60 md:block md:h-full ${className}`}
      onMouseLeave={() => setHovered(null)}
    >
      {/* hover hint */}
      <div
        className={`pointer-events-none absolute left-0 right-0 top-4 z-30 hidden justify-center transition-opacity delay-100 duration-300 md:flex ${
          hovered !== null ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="rounded-full border border-accent/10 bg-card/50 px-3 py-1 font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-accent/60 backdrop-blur-sm">
          {t('about.principles.hint')}
        </span>
      </div>
      {/* dotted texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      />
      {/* desktop deck */}
      <div className="relative z-10 hidden h-full w-full items-end justify-center overflow-hidden rounded-2xl px-2 md:flex">
        {principles.map((pr, i) => (
          <DeckCard key={pr.n} pr={pr} variant={variants[i] ?? 'mid'} hovered={hovered} setHovered={setHovered} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── Mobile-only: each principle as its own small card, side by side ──────────
// Same solid bg-card as the desktop deck's individual cards (the gradient
// belongs to the outer deck container, not each card), and the middle one
// is taller — same "raised centre card" shape as the desktop fan.
function PrincipleMiniCard({
  pr,
  raised = false,
  className = '',
}: {
  pr: (typeof principles)[number];
  raised?: boolean;
  className?: string;
}) {
  const t = useT();
  return (
    <div
      className={`rounded-xl border border-card-border bg-card p-3 backdrop-blur-md ${raised ? 'min-h-[132px]' : 'min-h-[112px]'} ${className}`}
    >
      <h3 className="text-[10px] font-bold uppercase leading-tight text-foreground">{t(`about.principles.${pr.n}.title`)}</h3>
      <p className="mt-1 text-[9px] leading-tight text-muted opacity-70">{t(`about.principles.${pr.n}.body`)}</p>
    </div>
  );
}

// ── Mindset — auto-rotating photo coverflow carousel ─────────────────────────
// Drop images into src/assets/mindset/ — they are picked up automatically here.
const mindsetModules = import.meta.glob('../assets/mindset/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function fileLabel(path: string) {
  const stem = (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
  const clean = stem.replace(/^\d+[-_\s]*/, '').replace(/[-_]+/g, ' ').trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : '';
}

// Slug from the filename (leading number stripped) used to look up a translated
// caption, e.g. "01-passione.jpg" → "passione" → i18n key about.mindset.photo.passione.
function fileKey(path: string) {
  const stem = (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
  return stem.replace(/^\d+[-_\s]*/, '').replace(/[-_\s]+/g, '-').toLowerCase();
}

// Per-photo crop framing (object-position) overrides, keyed by fileKey.
// Default is 'center'; tweak here when a photo's subject sits off-centre.
const PHOTO_POSITION: Record<string, string> = {
  school: '30% center',
};

const mindsetPhotos = Object.keys(mindsetModules)
  .sort()
  .map((k) => ({
    src: mindsetModules[k],
    key: fileKey(k),
    fallback: fileLabel(k),
    position: PHOTO_POSITION[fileKey(k)] ?? 'center',
  }));

function Mindset({
  className = '',
  showIntro = true,
  showCarousel = true,
}: {
  className?: string;
  // On mobile the reference layout splits this card in two (intro text card +
  // carousel card, in different grid cells); desktop keeps them fused.
  showIntro?: boolean;
  showCarousel?: boolean;
}) {
  const t = useT();
  const reduced = useReducedMotion();
  const photos = mindsetPhotos;
  const count = photos.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = (dir: number) => setActive((a) => (a + dir + count) % count);

  // Auto-advance every 3.5s; pause on hover and when reduced-motion is set.
  useEffect(() => {
    if (reduced || paused || count <= 1 || !showCarousel) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), 3500);
    return () => window.clearInterval(id);
  }, [reduced, paused, count, showCarousel]);

  const slots =
    count > 0
      ? [
          { side: 'left' as const, i: (active - 1 + count) % count },
          { side: 'center' as const, i: active },
          { side: 'right' as const, i: (active + 1) % count },
        ]
      : [];

  return (
    <div
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-card to-card-border backdrop-blur-sm transition-colors duration-300 hover:border-accent/60 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {showIntro && (
        <div className="z-20 flex shrink-0 flex-col gap-2 p-4 pb-2 md:p-5 md:pb-0">
          <div>
            <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">{t('about.mindset.title')}</h3>
            <div className="h-0.5 w-8 rounded-full bg-accent/50" />
          </div>
          <p className="text-base leading-relaxed text-muted">
            <strong className="text-foreground/90">{t('about.mindset.line1.strong')}</strong>{t('about.mindset.line1.rest')}
          </p>
        </div>
      )}

      {showCarousel && (
      <>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-3 md:py-4" style={{ perspective: 1000 }}>
        <div className="relative flex h-full min-h-[150px] w-full items-center justify-center">
          {slots.map(({ side, i }) => {
            const center = side === 'center';
            const photo = photos[i];
            // Translated caption; falls back to the filename-derived label when
            // no i18n entry exists for this photo yet.
            const captionKey = `about.mindset.photo.${photo.key}`;
            const translated = t(captionKey);
            const label = translated === captionKey ? photo.fallback : translated;
            const transform =
              side === 'left'
                ? 'translateX(-52%) rotateY(22deg)'
                : side === 'right'
                  ? 'translateX(52%) rotateY(-22deg)'
                  : 'none';
            return (
              <div
                key={side}
                className={`aspect-[3/4] overflow-hidden rounded-xl border transition-all duration-500 md:rounded-2xl ${
                  center
                    ? 'relative w-[55%] border-2 border-accent/30 shadow-2xl md:w-[50%]'
                    : 'absolute w-[45%] border-card-border/50 shadow-lg md:w-[42%]'
                }`}
                style={{ transform, zIndex: center ? 10 : 1, opacity: center ? 1 : 0.5, filter: center ? 'none' : 'blur(1px) grayscale(30%)' }}
              >
                <img src={photo.src} alt={label || 'Mindset'} loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: photo.position }} />
                {center && label && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-8">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white md:text-xs">{label}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* prev / next controls */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-1 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-card-border bg-card/80 text-foreground/80 backdrop-blur transition-colors hover:border-accent/60 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-card-border bg-card/80 text-foreground/80 backdrop-blur transition-colors hover:border-accent/60 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* dots */}
      {count > 1 && (
        <div className="z-20 flex shrink-0 items-center justify-center gap-1.5 pb-2">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-accent' : 'w-1.5 bg-card-border hover:bg-muted'}`}
            />
          ))}
        </div>
      )}

      <div className="z-20 hidden shrink-0 border-t border-card-border/30 p-3 pt-0 md:block md:p-3.5 md:pt-0">
        <p className="text-base leading-relaxed text-muted">
          <strong className="text-foreground/90">{t('about.mindset.line2.strong')}</strong>{t('about.mindset.line2.rest')}
        </p>
      </div>
      </>
      )}
    </div>
  );
}

// ── Mobile-only: the Hero memoji video, reused to fill the gap left under
// Craft in the mobile bento (matches the reference's bottom-left photo tile).
function AvatarCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-card-border bg-black ${className}`}>
      <video
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/avatar-poster.webp"
        aria-label={`${profile.name} avatar`}
      >
        <source src="/avatar.webm" type="video/webm" />
        <source src="/avatar.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

// ── Portrait ────────────────────────────────────────────────────────────────
function Portrait({ className = '' }: { className?: string }) {
  const t = useT();
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-card-border bg-black ${className}`}
    >
      <img
        src="/portrait.webp"
        alt={t('about.portrait.label')}
        loading="lazy"
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}

function Location({ className = '' }: { className?: string }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-card-border bg-card backdrop-blur-sm transition-colors duration-300 hover:border-accent/60 ${className}`}
    >
      {/* Real map of Switzerland with Lugano/Ticino marked */}
      <img
        src={luganoMap}
        alt="Map of Switzerland with Lugano marked"
        loading="lazy"
        className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: '50% 62%' }}
      />
      {/* scanning beam that sweeps across the map */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[15] w-[2px] animate-scan motion-reduce:hidden"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(96,165,250,0.9) 50%, transparent)',
          boxShadow: '0 0 8px 1px rgba(59,130,246,0.55)',
        }}
      />
      {/* legibility gradient so the label stays readable over the map */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to top, var(--card), rgba(24,24,27,0.7) 42%, transparent)' }}
      />
      {/* label — city / coordinates / timezone */}
      <div className="absolute bottom-0 left-0 z-20 flex w-full flex-col justify-end p-3">
        <span className="mb-1 block font-sans text-[22px] font-bold uppercase leading-[0.95] tracking-tighter text-foreground sm:text-[26px] md:whitespace-nowrap md:text-[30px]">
          Italy,<br />Switzerland
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[15px] leading-none tracking-tight text-muted opacity-80">46.0037° N, 8.9511° E</span>
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-bold leading-none text-accent">-</span>
            <span className="font-mono text-[15px] uppercase leading-none tracking-tight text-accent opacity-90">GMT+2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Craft — title + description + horizontal tech marquee ────────────────────
const craftStack: { name: string; Icon: IconType; color: string }[] = [
  { name: 'React', Icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', Icon: SiNextdotjs, color: '#ffffff' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
  { name: 'Python', Icon: SiPython, color: '#3776AB' },
  { name: 'FastAPI', Icon: SiFastapi, color: '#009688' },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#339933' },
  { name: 'Tailwind', Icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'Docker', Icon: SiDocker, color: '#2496ED' },
  { name: 'Gemini', Icon: SiGooglegemini, color: '#8E75B2' },
  { name: 'PostgreSQL', Icon: SiPostgresql, color: '#4169E1' },
];

function Craft({ className = '' }: { className?: string }) {
  const t = useT();
  const reduced = useReducedMotion();
  const row = [...craftStack, ...craftStack];
  return (
    <div
      className={`group flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-card to-card-border backdrop-blur-sm transition-colors duration-300 hover:border-accent/60 ${className}`}
    >
      <div className="flex flex-col gap-4 p-6 pb-0">
        <div>
          <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">{t('about.craft.title')}</h3>
          <div className="h-0.5 w-12 rounded-full bg-accent/60" />
        </div>
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-muted">
            {t('about.craft.line1.pre')}<strong className="font-semibold text-foreground">{t('about.craft.line1.strong')}</strong>{t('about.craft.line1.post')}
          </p>
          <p className="text-base leading-relaxed text-muted">
            {t('about.craft.line2')}
          </p>
        </div>
      </div>

      {/* tech marquee — coloured brand logos beside each name, scrolling */}
      <div className="relative my-auto w-full border-y border-card-border/50 bg-card-border/30 py-3.5">
        <div className="absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-card to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent" />
        <div className="flex select-none overflow-hidden">
          <motion.div
            className="flex shrink-0 items-center gap-7 whitespace-nowrap pr-7"
            animate={reduced ? undefined : { x: ['0%', '-50%'] }}
            transition={reduced ? undefined : { duration: 18, ease: 'linear', repeat: Infinity }}
          >
            {row.map((s, i) => {
              const Icon = s.Icon;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 font-mono text-[13px] font-medium uppercase tracking-wide text-muted opacity-90 transition-opacity group-hover:opacity-100"
                >
                  <Icon size={20} color={s.color} className="shrink-0" />
                  {s.name}
                </span>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* availability */}
      <div className="p-6 pt-0">
        <div className="mt-4 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium leading-tight text-foreground opacity-80">
            {t('about.craft.availability')}
          </span>
        </div>
      </div>
    </div>
  );
}

export function About() {
  const t = useT();
  return (
    <section id="about" className="mx-auto max-w-5xl px-4 pb-32 pt-0" style={{ scrollMarginTop: 120 }}>
      <Reveal>
        {/* Mobile uses a 6-col grid (halves = span-3, thirds = span-2) so the
            bento reads: [Name|Portrait] / [3 principle cards] / [Craft|Location]
            / [Craft(cont.)|Mindset intro] / [Avatar|Mindset carousel] — a plain
            sparse auto-flow, just from DOM order + spans, no explicit
            positioning needed. Desktop keeps its original explicit 3-col grid. */}
        <div className="grid grid-cols-6 gap-3 md:grid-cols-3 md:grid-rows-[9rem_auto_9rem]">
          <NameCard className="col-span-3 md:col-span-1 md:row-span-1 md:col-start-1 md:row-start-1" />
          <Portrait className="aspect-square col-span-3 md:aspect-square md:col-span-1 md:h-full md:w-full md:col-start-2 md:row-start-2" />

          <PrinciplesCard className="md:col-span-2 md:col-start-2 md:row-start-1" />
          {/* Same hint pill as the desktop deck's "hover to read more" badge —
              on desktop it floats absolutely, overlapping the top edge of the
              card deck underneath. Match that here with a negative bottom
              margin so it overlaps the 3 principle cards the same way. */}
          <div className="relative z-10 -mb-3 md:hidden col-span-6 flex justify-center">
            <span className="rounded-full border border-accent/10 bg-card/50 px-3 py-1 font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-accent/60 backdrop-blur-sm">
              {t('about.principles.hint')}
            </span>
          </div>
          <div className="md:hidden col-span-6 flex items-end gap-3">
            {principles.map((pr, i) => (
              <PrincipleMiniCard key={pr.n} pr={pr} raised={i === 1} className="flex-1" />
            ))}
          </div>

          <Mindset className="hidden md:flex col-span-1 row-span-2 md:col-start-1 md:row-start-2" />

          <Craft className="col-span-3 row-span-2 md:col-span-1 md:row-span-2 md:col-start-3 md:row-start-2" />
          <Location className="aspect-square col-span-3 md:aspect-square md:col-span-1 md:h-full md:w-full md:col-start-2 md:row-start-3" />

          <Mindset showCarousel={false} className="md:hidden col-span-3" />
          <AvatarCard className="md:hidden col-span-3 aspect-square" />
          <Mindset showIntro={false} className="md:hidden col-span-3" />
        </div>
      </Reveal>
    </section>
  );
}
