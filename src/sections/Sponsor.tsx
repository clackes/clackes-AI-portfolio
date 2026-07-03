import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowLeft, ExternalLink } from 'lucide-react';
import { SiGithub, SiPaypal } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { useT } from '@/i18n';
import { navigate } from '@/lib/nav';
import { Navbar } from '@/sections/Navbar';

type SponsorItem = { label: string; descKey: string; href: string; Icon: IconType; color: string };

const items: SponsorItem[] = [
  {
    label: 'GitHub Sponsors',
    descKey: 'sponsor.github.desc',
    href: 'https://github.com/sponsors/clackes',
    Icon: SiGithub,
    color: '#EA4AAA',
  },
  {
    label: 'PayPal',
    descKey: 'sponsor.paypal.desc',
    href: 'https://www.paypal.me/AlbertoVerganiclk',
    Icon: SiPaypal,
    color: '#0070BA',
  },
];

export function Sponsor() {
  const t = useT();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* faint dotted texture, like the reference */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '22px 22px', color: '#ffffff' }}
      />

      <main className="relative mx-auto max-w-2xl px-4 pb-24 pt-28 md:pt-36">
        {/* back link */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('links.back')}
        </button>

        {/* header */}
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#EA4AAA' }}>
            {t('sponsor.eyebrow')}
          </p>
          <h1 className="mt-3 flex items-center justify-center gap-3 text-5xl font-bold tracking-tightest text-foreground sm:text-6xl">
            {t('sponsor.title.pre')}
            <span style={{ color: '#EA4AAA' }}>{t('sponsor.title.accent')}</span>
            <Heart className="hidden h-10 w-10 shrink-0 fill-current sm:block" style={{ color: '#EA4AAA' }} />
          </h1>
          <p className="mt-4 text-muted">{t('sponsor.subtitle')}</p>
        </div>

        {/* sponsor rows */}
        <div className="mx-auto mt-12 flex flex-col gap-4">
          {items.map((item, i) => {
            const Icon = item.Icon;
            return (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center justify-between rounded-2xl border border-card-border bg-card/40 px-5 py-5 transition-all duration-300 hover:bg-card/70"
                style={{ boxShadow: '0 0 0 0 transparent', '--accent': item.color } as CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 18px 40px -18px ${item.color}80`)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 0 0 transparent')}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors"
                    style={{ borderColor: `${item.color}55`, backgroundColor: `${item.color}1a`, color: item.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-xl font-bold text-foreground transition-colors group-hover:text-[var(--accent)]">
                      {item.label}
                    </span>
                    <span className="text-sm text-muted">{t(item.descKey)}</span>
                  </span>
                </div>
                <ExternalLink className="h-5 w-5 shrink-0 text-muted transition-colors group-hover:text-foreground" />
              </motion.a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
