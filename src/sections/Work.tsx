import { motion, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/Reveal';
import { projects, type Project } from '@/data/content';
import { ArrowUpRight } from 'lucide-react';
import { useT } from '@/i18n';

// Per-project gradient for the panel (matches the reference's coloured cards).
const GRADIENTS = [
  'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', // amber → orange
  'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)', // electric → sky
  'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)', // electric → neon
];

// A single iPhone-style frame with dynamic island — used inside the phone
// showcase mockup. The screen aspect is 9:19.5 (modern iPhone display).
function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] border-[5px] border-black bg-black shadow-2xl shadow-black/60 ring-1 ring-white/10">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="block h-full w-full object-cover"
      />
      {/* dynamic island */}
      <div className="pointer-events-none absolute left-1/2 top-2 h-3 w-14 -translate-x-1/2 rounded-full bg-black/95" />
    </div>
  );
}

// Three-phone showcase: two devices angled behind, one centred in front.
function PhoneShowcase({
  images,
  alt,
}: {
  images: [string, string, string]; // [left, centre, right]
  alt: string;
}) {
  const [left, centre, right] = images;
  // Fixed viewport height matched to the macOS-window mockup; phones are taller
  // than the frame and anchored to the top, so the bottom is cropped (never
  // squashed) to keep every project card the same size.
  return (
    <div className="relative mx-auto flex h-[340px] w-full max-w-[440px] justify-center overflow-hidden">
      {/* back-left phone */}
      <div
        className="absolute left-[8%] top-6 aspect-[9/19.5] h-[290px] -rotate-[8deg]"
        style={{ transformOrigin: 'top right' }}
      >
        <PhoneFrame src={left} alt={`${alt} — screen 1`} />
      </div>
      {/* back-right phone */}
      <div
        className="absolute right-[8%] top-6 aspect-[9/19.5] h-[290px] rotate-[8deg]"
        style={{ transformOrigin: 'top left' }}
      >
        <PhoneFrame src={right} alt={`${alt} — screen 3`} />
      </div>
      {/* front-centre phone */}
      <div className="relative z-10 aspect-[9/19.5] h-[340px]">
        <PhoneFrame src={centre} alt={`${alt} — main`} />
      </div>
    </div>
  );
}

// Ordered screens per project — [left-back, centre-front, right-back].
const PHONE_SHOWCASES: Record<string, [string, string, string]> = {
  'kcal-tracker': ['/kcal-2.webp', '/kcal-1.webp', '/kcal-4.webp'],
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const t = useT();
  const reduced = useReducedMotion();
  const num = String(index + 1).padStart(2, '0');
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const category = project.kind === 'client' ? t('work.category.client') : t('work.category.build');
  const blurbKey = `work.${project.slug}.blurb`;
  const blurb = t(blurbKey);

  return (
    <Reveal delay={index * 0.06} className="h-full">
      <article className="group flex h-full flex-col">
        {/* header: number — dash — category */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-semibold text-muted">{num}</span>
          <span className="h-px w-8 bg-card-border" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {category}
          </span>
        </div>

        {/* title */}
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {project.name}
        </h3>

        {/* gradient panel with description + windowed screenshot */}
        <motion.div
          whileHover={reduced ? undefined : { y: -6 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="mt-4 flex flex-1 flex-col overflow-hidden rounded-2xl p-4 sm:p-5"
          style={{ background: gradient }}
        >
          <p className="max-w-2xl text-base font-medium leading-snug text-white sm:text-lg">
            {blurb === blurbKey ? project.blurb : blurb}
          </p>

          {/* Mockup: PWA/mobile projects get a three-phone showcase, everything
              else gets the macOS-style window (client sites, dashboards, etc).
              Pinned to the bottom so both cards' mockups align regardless of
              blurb length. */}
          {PHONE_SHOWCASES[project.slug] ? (
            <div className="mt-auto pt-4 sm:pt-5">
              <PhoneShowcase images={PHONE_SHOWCASES[project.slug]} alt={project.name} />
            </div>
          ) : (
            <div className="mt-auto pt-4 sm:pt-5">
              <div className="overflow-hidden rounded-xl border border-black/20 bg-[#1c1c1e] shadow-2xl shadow-black/40">
                <div className="flex items-center gap-2 bg-[#2c2c2e] px-4 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                {project.image ? (
                  <img
                    src={project.image}
                    alt={`${project.name} — ${project.tagline}`}
                    loading="lazy"
                    className="block h-[300px] w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center font-mono text-[11px] uppercase tracking-widest text-muted">
                    Image here
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* tech chips */}
        <ul className="mt-5 flex flex-wrap items-center gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-lg border border-card-border bg-card px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted"
            >
              {tag}
            </li>
          ))}
          {project.link && (
            <li>
              <a
                href={project.link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-foreground transition-colors hover:border-accent/60"
              >
                {t('work.link.visit')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          )}
        </ul>
      </article>
    </Reveal>
  );
}

export function Work() {
  const t = useT();
  return (
    <section id="work" className="relative overflow-hidden px-4 pb-36 pt-8" style={{ scrollMarginTop: 120 }}>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{t('work.eyebrow')}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tightest text-foreground sm:text-5xl md:text-6xl">
            {t('work.title')}
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            {t('work.subtitle')}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
