import { motion } from 'motion/react';
import { Github, Linkedin, Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { profile } from '@/data/content';
import { useT } from '@/i18n';
import { navigate } from '@/lib/nav';
import { Navbar } from '@/sections/Navbar';

const BLUE = '#3b82f6';

type LinkItem = { label: string; href: string; Icon: LucideIcon; external: boolean };

const socialHref = (label: string) => profile.socials.find((s) => s.label === label)?.href ?? '#';

const items: LinkItem[] = [
  { label: 'GitHub', href: socialHref('GitHub'), Icon: Github, external: true },
  { label: 'LinkedIn', href: socialHref('LinkedIn'), Icon: Linkedin, external: true },
  { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail, external: false },
];

export function Links() {
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
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: BLUE }}>
            {t('links.eyebrow')}
          </p>
          <h1 className="mt-3 text-5xl font-bold tracking-tightest text-foreground sm:text-6xl">
            {t('links.title.pre')}
            <span style={{ color: BLUE }}>{t('links.title.accent')}</span>
          </h1>
          <p className="mt-4 text-muted">{t('links.subtitle')}</p>
        </div>

        {/* link rows */}
        <div className="mx-auto mt-12 flex flex-col gap-4">
          {items.map((item, i) => {
            const Icon = item.Icon;
            return (
              <motion.a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center justify-between rounded-2xl border border-card-border bg-card/40 px-5 py-5 transition-all duration-300 hover:bg-card/70"
                style={{ boxShadow: '0 0 0 0 transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 18px 40px -18px ${BLUE}80`)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 0 0 transparent')}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors"
                    style={{ borderColor: `${BLUE}55`, backgroundColor: `${BLUE}1a`, color: BLUE }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xl font-bold text-foreground transition-colors group-hover:text-[#3b82f6]">
                    {item.label}
                  </span>
                </div>
                <ExternalLink className="h-5 w-5 text-muted transition-colors group-hover:text-foreground" />
              </motion.a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
