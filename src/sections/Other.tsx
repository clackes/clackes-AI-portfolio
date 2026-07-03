import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/Reveal';
import { BookOpen, Heart, Link2, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { navigate } from '@/lib/nav';
import { useT } from '@/i18n';

type Card = {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  href: string;
  from: string;
  to: string;
  solid: string;
};

const cards: Card[] = [
  {
    icon: BookOpen,
    titleKey: 'other.guestbook.title',
    descKey: 'other.guestbook.desc',
    href: '/guestbook',
    from: '#8b5cf6',
    to: '#a855f7',
    solid: '#8b5cf6',
  },
  {
    icon: Heart,
    titleKey: 'other.sponsor.title',
    descKey: 'other.sponsor.desc',
    href: '/sponsor',
    from: '#ec4899',
    to: '#ef4444',
    solid: '#ec4899',
  },
  {
    icon: Link2,
    titleKey: 'other.links.title',
    descKey: 'other.links.desc',
    href: '/links',
    from: '#3b82f6',
    to: '#06b6d4',
    solid: '#3b82f6',
  },
];

function ExploreCard({ card, index }: { card: Card; index: number }) {
  const t = useT();
  const reduced = useReducedMotion();
  const [hov, setHov] = useState(false);
  const Icon = card.icon;
  const gradient = `linear-gradient(135deg, ${card.from}, ${card.to})`;
  const internal = card.href.startsWith('/');
  return (
    <motion.a
      href={card.href}
      target={card.href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      onClick={internal ? (e) => { e.preventDefault(); navigate(card.href); } : undefined}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced ? undefined : { y: -6 }}
      style={{
        borderColor: hov ? 'transparent' : undefined,
        boxShadow: hov ? `0 24px 50px -12px ${card.solid}66` : '0 0 0 0 rgba(0,0,0,0)',
      }}
      className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-card-border bg-card px-6 py-10 text-center transition-[box-shadow,border-color] duration-300"
    >
      {/* full-box color fill on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{ background: gradient, opacity: hov ? 1 : 0 }}
      />
      {/* icon tile — gradient border → white on hover */}
      <span
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300"
        style={{ background: hov ? 'rgba(255,255,255,0.25)' : gradient, padding: 1.5 }}
      >
        <span
          className="flex h-full w-full items-center justify-center rounded-[10px] transition-colors duration-300"
          style={{ background: hov ? '#ffffff' : 'var(--card)' }}
        >
          <Icon className="h-6 w-6" style={{ color: card.solid }} strokeWidth={2} />
        </span>
      </span>

      <h3
        className="relative z-10 mt-6 text-2xl font-bold tracking-tight transition-colors duration-300"
        style={
          hov
            ? { color: '#ffffff' }
            : { backgroundImage: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
        }
      >
        {t(card.titleKey)}
      </h3>

      <p
        className="relative z-10 mt-3 max-w-[15rem] text-sm leading-relaxed transition-colors duration-300"
        style={{ color: hov ? 'rgba(255,255,255,0.9)' : 'var(--muted)' }}
      >
        {t(card.descKey)}
      </p>

      <span
        className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-300"
        style={{ color: hov ? '#ffffff' : card.solid }}
      >
        {t('other.explore')}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </motion.a>
  );
}

export function Other() {
  const t = useT();
  return (
    <section id="other" className="relative overflow-hidden px-4 pb-24 pt-8 sm:pb-32" style={{ scrollMarginTop: 120 }}>
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tightest text-foreground sm:text-5xl md:text-6xl">
            {t('other.title.pre')}<span className="gradient-shimmer">{t('other.title.accent')}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            {t('other.subtitle')}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <ExploreCard key={c.titleKey} card={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
