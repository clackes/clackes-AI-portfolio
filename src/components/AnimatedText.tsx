import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useT } from '@/i18n';

export type Segment = { text: string; className?: string };

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Aizen-style heading: each word slides up from behind a clip mask,
 * staggered left-to-right. Accepts colored segments for two-tone headlines.
 * A single useInView observer on the wrapper drives every word.
 */
export function AnimatedWords({
  segments,
  className = '',
  stagger = 0.045,
  baseDelay = 0,
  once = true,
}: {
  segments: Segment[];
  className?: string;
  stagger?: number;
  baseDelay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: '-60px' });
  const reduced = useReducedMotion();
  const t = useT();
  let i = -1;
  return (
    <span ref={ref} className={className}>
      {segments.map((seg, si) =>
        t(seg.text)
          .split(' ')
          .map((word, wi) => {
          i += 1;
          const delay = baseDelay + i * stagger;
          return (
            <span
              key={`${si}-${wi}`}
              className="inline-block overflow-hidden align-bottom"
              style={{ clipPath: 'inset(-20% 0 -20% 0)' }}
            >
              <motion.span
                className={`inline-block ${seg.className ?? ''}`}
                initial={reduced ? false : { y: '115%' }}
                animate={inView ? { y: 0 } : undefined}
                transition={reduced ? { duration: 0 } : { duration: 0.75, delay, ease }}
              >
                {word}
                {' '}
              </motion.span>
            </span>
          );
        }),
      )}
    </span>
  );
}

/** Simple masked single-line reveal for short labels / paragraphs. */
export function MaskReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  return (
    <span
      ref={ref}
      className="inline-block overflow-hidden align-bottom"
      style={{ clipPath: 'inset(-20% 0 -20% 0)' }}
    >
      <motion.span
        className={`inline-block ${className ?? ''}`}
        initial={reduced ? false : { y: '115%' }}
        animate={inView ? { y: 0 } : undefined}
        transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}
