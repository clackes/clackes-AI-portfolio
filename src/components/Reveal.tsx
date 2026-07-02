import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { profile } from '@/data/content';
import { useT } from '@/i18n';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/** Fade-and-rise on scroll into view — the Aizen section-entry feel. */
export function Reveal({ children, delay = 0, y = 26, className }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Small parenthesized eyebrow label, e.g. ( About ). */
export function Label({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
      ( {typeof children === 'string' ? t(children) : children} )
    </span>
  );
}

/** Heavy italic wordmark used for the brand and footer. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display font-black uppercase italic tracking-tightest text-white ${className}`}
    >
      {profile.brand}
    </span>
  );
}
