import { Reveal } from '@/components/Reveal';
import { profile } from '@/data/content';
import { GithubCalendar } from '@/components/ui/retro-space-shooter-git-hub-calendar';
import { ArrowUpRight, Mail } from 'lucide-react';
import { useT } from '@/i18n';

// Pull the GitHub handle out of the socials list, e.g. "@clackes" -> "clackes".
const githubHandle =
  profile.socials
    .find((s) => s.label === 'GitHub')
    ?.handle.replace('@', '') ?? 'clackes';

// Dark palette so the calendar reads correctly on the near-black background.
const CAL_THEME = {
  level0: '#18181b',
  level1: '#0e4429',
  level2: '#006d32',
  level3: '#26a641',
  level4: '#39d353',
};

export function Footer() {
  const t = useT();
  const year = 2026; // static: Date-free build
  return (
    <footer id="footer" className="relative z-0 bg-background px-4 pb-14 pt-24 sm:pt-28">
      {/* Soft top fade — blends the dot pattern above into the solid footer
          without a hard seam, so the transition reads as intentional. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 -translate-y-full"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(10,10,15,0.6) 55%, var(--background) 100%)',
        }}
      />
      <div className="mx-auto max-w-5xl">
        {/* GitHub contributions calendar (flip "Game Mode" for the retro shooter) */}
        <Reveal>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{t('footer.contributions')}</p>
            <p className="font-mono text-[11px] text-muted">{t('footer.gameMode')}</p>
          </div>
          <div className="overflow-x-auto">
            <GithubCalendar
              username={githubHandle}
              theme={CAL_THEME}
              cellSize={13}
              cellGap={3}
            />
          </div>
        </Reveal>

        {/* Compact contact strip — email + socials, so the anchor #contact lands here */}
        <div
          id="contact"
          className="mt-12 flex flex-col items-center gap-5 border-t border-card-border pt-10 sm:flex-row sm:items-center sm:justify-between"
          style={{ scrollMarginTop: 120 }}
        >
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/60"
          >
            <Mail className="h-4 w-4 text-accent" />
            {profile.email}
          </a>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs">
            {profile.socials
              .filter((s) => s.label !== 'Email')
              .map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 uppercase tracking-widest text-muted transition-colors hover:text-foreground"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
          </ul>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-card-border pt-8 sm:flex-row">
          <a href="#home" className="text-lg font-bold tracking-tight text-foreground">
            {profile.name}
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted">
            <a href="#about" className="hover:text-foreground">{t('footer.nav.about')}</a>
            <a href="#skills" className="hover:text-foreground">{t('footer.nav.skills')}</a>
            <a href="#work" className="hover:text-foreground">{t('footer.nav.work')}</a>
          </nav>

          <p className="font-mono text-[11px] text-muted">
            © {year} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
