import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { IconType } from 'react-icons';

export type Skill = { name: string; Icon: IconType; color: string };

type Vec3 = { x: number; y: number; z: number };

// Even distribution of N points on a unit sphere (Fibonacci lattice).
function fibonacciSphere(n: number): Vec3[] {
  const pts: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2; // 1 → -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

const BASE_TILT = -0.32; // resting x-axis tilt, radians

// Raw 3D geometry for a sphere wireframe (meridians + parallels) on the unit
// sphere. Points are projected + split into front/back every frame so the mesh
// rotates in lockstep with the icons and the rear stays visible (drawn fainter).
type WireLine = { pts: Vec3[]; closed: boolean };
function buildWireframe(meridians: number, parallels: number, steps = 96): WireLine[] {
  const lines: WireLine[] = [];
  // Meridians (lines of longitude) — run pole to pole.
  for (let m = 0; m < meridians; m++) {
    const phi = (m / meridians) * Math.PI * 2;
    const pts: Vec3[] = [];
    for (let s = 0; s <= steps; s++) {
      const theta = -Math.PI / 2 + (s / steps) * Math.PI;
      const cr = Math.cos(theta);
      pts.push({ x: cr * Math.cos(phi), y: Math.sin(theta), z: cr * Math.sin(phi) });
    }
    lines.push({ pts, closed: false });
  }
  // Parallels (lines of latitude) — full rings.
  for (let p = 1; p < parallels; p++) {
    const theta = -Math.PI / 2 + (p / parallels) * Math.PI;
    const cr = Math.cos(theta);
    const y = Math.sin(theta);
    const pts: Vec3[] = [];
    for (let s = 0; s <= steps; s++) {
      const phi = (s / steps) * Math.PI * 2;
      pts.push({ x: cr * Math.cos(phi), y, z: cr * Math.sin(phi) });
    }
    lines.push({ pts, closed: true });
  }
  return lines;
}
const AUTO_SPIN = 0.0014; // idle rotation speed around Y (rad/frame)
// Extra rotation added per pixel scrolled, on top of the constant idle spin —
// scrolling down spins it further, scrolling up spins it back.
const SCROLL_SPIN = 0.0005;
const HOVER_SCALE = 1.45; // icon grows this much on hover

// easeOutCubic — makes the assembly feel fast at first, gentle on arrival.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function SkillSphere({ skills, className = '' }: { skills: Skill[]; className?: string }) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dims = useRef({ w: 0, h: 0 });
  // Document-relative top of the container, so scroll-driven progress can be
  // computed from `window.scrollY` (cheap) instead of getBoundingClientRect()
  // on every frame (forces a synchronous layout when interleaved with the
  // style writes below — a classic source of scroll jank).
  const sectionTop = useRef(0);
  // 0 → icons off-screen at their side entry points; 1 → fully seated on the sphere.
  const assembly = useRef(reduced ? 1 : 0);
  // Which icon (if any) is currently hovered, and each icon's eased 0→1
  // "hovered-ness" used to grow + glow it without fighting the per-frame
  // transform writes below (a CSS :hover transition would just get
  // overwritten every frame).
  const hoveredIndex = useRef<number | null>(null);
  const hoverProgress = useRef<number[]>([]);

  const base = useMemo(() => fibonacciSphere(skills.length), [skills.length]);
  if (hoverProgress.current.length !== skills.length) {
    hoverProgress.current = skills.map(() => 0);
  }
  // Redrawn every frame (see below) — the mismatch between smooth per-frame
  // icon motion and a skipped-frame wireframe was the actual source of the
  // "constant lag" feeling, not raw throughput. Too few points per line
  // (steps) made each curve look faceted/segmented once the mesh was bright
  // and the rotation slow enough to actually see the joints — measured no
  // real per-frame cost difference going from 24 to 64 steps, so there was
  // headroom to fix that without touching line count (16x8, unchanged).
  const wire = useMemo(() => buildWireframe(16, 8, 64), []);
  // Two <path>s per line (front + back arcs) — kept stable so the render loop
  // can rewrite their `d` each frame without React re-rendering.
  const wireFrontRefs = useRef<(SVGPathElement | null)[]>([]);
  const wireBackRefs = useRef<(SVGPathElement | null)[]>([]);

  // Deterministic per-icon entry: alternate sides, jitter vertical start position.
  const entries = useMemo(
    () =>
      skills.map((_, i) => {
        const sideSign = i % 2 === 0 ? -1 : 1; // -1 = left edge, +1 = right edge
        // Pseudo-random 0..1 from index — gives a natural spread on Y without RNG.
        const yFrac = (Math.sin(i * 12.9898 + 78.233) * 0.5 + 0.5) * 0.85 + 0.075;
        return { sideSign, yFrac };
      }),
    [skills],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      dims.current = { w: r.width, h: r.height };
      sectionTop.current = r.top + window.scrollY;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Only run the render loop while the sphere is at least close to the
    // viewport — this is a hand-rolled 3D animation (SVG wireframe + 30 DOM
    // nodes recomputed every frame), so keeping it running while the user is
    // scrolling through unrelated sections wastes main-thread time and adds
    // to scroll jank. A generous rootMargin means it's already animating by
    // the time the section is actually on screen.
    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(render);
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);

    // Assembly progress is driven by how far the section has entered the viewport.
    // 0 while the section is still below the fold; 1 once it is comfortably in view.
    // Batched through rAF so a burst of scroll events (fast trackpad/touch
    // momentum) only forces one layout read per frame instead of one each.
    let scrollScheduled = false;
    const updateAssembly = () => {
      scrollScheduled = false;
      if (reduced) {
        assembly.current = 1;
        return;
      }
      const top = sectionTop.current - window.scrollY;
      const vh = window.innerHeight || 1;
      // Start assembling when the section's top crosses ~90% of the viewport,
      // finish when it reaches ~25% — a comfortable ~65% viewport of travel.
      const start = vh * 0.9;
      const end = vh * 0.25;
      const raw = (start - top) / Math.max(1, start - end);
      assembly.current = Math.max(0, Math.min(1, raw));
    };
    const onScroll = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(updateAssembly);
    };
    const onResize = () => {
      measure();
      updateAssembly();
    };
    updateAssembly();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    let raf = 0;
    let angleY = 0; // rotation around vertical axis
    const tilt = BASE_TILT; // fixed — the sphere no longer tilts toward the cursor
    let lastScrollY = window.scrollY;
    let scrollSpin = 0; // eased extra angular velocity from scrolling

    const render = () => {
      const { w, h } = dims.current;
      const radius = Math.min(w, h) * 0.36;
      const cx = w / 2;
      const cy = h / 2;

      // Own idle spin, plus extra spin proportional to how much the page has
      // scrolled since last frame — no more cursor-follow.
      const scrollY = window.scrollY;
      const scrollDelta = reduced ? 0 : scrollY - lastScrollY;
      lastScrollY = scrollY;
      const targetScrollSpin = scrollDelta * SCROLL_SPIN;
      scrollSpin += (targetScrollSpin - scrollSpin) * 0.15;
      angleY += reduced ? 0 : AUTO_SPIN + scrollSpin;

      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const cosA = Math.cos(angleY);
      const sinA = Math.sin(angleY);

      const a = easeOut(assembly.current);
      const inv = 1 - a;

      for (let i = 0; i < base.length; i++) {
        const bp = base[i];
        // rotate around Y
        const x1 = bp.x * cosA + bp.z * sinA;
        const z1 = -bp.x * sinA + bp.z * cosA;
        const y1 = bp.y;
        // tilt around X
        const y2 = y1 * cosT - z1 * sinT;
        const z2 = y1 * sinT + z1 * cosT;
        const x2 = x1;

        const depth = (z2 + 1) / 2; // 0 (back) → 1 (front)
        const scale = 0.55 + depth * 0.65;
        const opacity = 0.14 + depth * 0.86;

        // Sphere seat (destination) in container coordinates.
        const sphereX = cx + x2 * radius;
        const sphereY = cy + y2 * radius;

        // Entry origin — far off to the container's left or right, so the icon
        // enters from outside the viewport. Vertical position is jittered per icon.
        const entry = entries[i];
        const startX = entry.sideSign > 0 ? w * 1.6 : -w * 0.6;
        const startY = h * entry.yFrac;

        const posX = startX + (sphereX - startX) * a;
        const posY = startY + (sphereY - startY) * a;

        // While flying, icons stay crisp + full-colour; ease into depth cues.
        const flyScale = 1.15;
        let finalScale = flyScale * inv + scale * a;
        const finalOpacity = inv * 1 + a * opacity;

        // Ease this icon's hover state — grows + glows smoothly instead of
        // snapping, and doesn't fight the per-frame transform writes the way
        // a CSS :hover transition would.
        const targetHover = hoveredIndex.current === i ? 1 : 0;
        const hp = hoverProgress.current[i] + (targetHover - hoverProgress.current[i]) * 0.18;
        hoverProgress.current[i] = hp;
        finalScale *= 1 + hp * (HOVER_SCALE - 1);

        const node = nodeRefs.current[i];
        if (node) {
          node.style.left = `${posX}px`;
          node.style.top = `${posY}px`;
          // transform + opacity only — no CSS filter(). Even grayscale() alone
          // forced a per-element repaint every frame across 30 nodes and was
          // the single biggest source of worst-case stutter (~150ms spikes).
          // Depth already reads clearly from opacity + scale alone. The one
          // exception is the hover glow below — only the (at most one)
          // hovered icon ever pays that cost.
          node.style.transform = `translate3d(-50%,-50%,0) scale(${finalScale.toFixed(3)})`;
          node.style.opacity = finalOpacity.toFixed(3);
          node.style.zIndex = String(Math.round(depth * 1000) + Math.round(hp * 2000));
          node.style.filter = hp > 0.01 ? `drop-shadow(0 0 ${(hp * 9).toFixed(1)}px ${skills[i].color})` : '';
        }
        const label = labelRefs.current[i];
        if (label) {
          // Only the hovered icon's name shows, and only once assembly has
          // finished — no more names floating over every front-facing icon.
          label.style.opacity = (hp * a).toFixed(2);
        }
      }

      // Rotate the wireframe with the same angleY / tilt as the icons, every
      // frame — any skipped-frame cadence here fell out of step with the
      // icons' smooth per-frame motion and read as constant micro-lag rather
      // than a lighter load. The mesh above is deliberately lighter instead,
      // so full-rate redraw stays cheap. Lives in the overlay SVG's own
      // 200×200 space (radius 99, centre 100,100).
      for (let li = 0; li < wire.length; li++) {
        const line = wire[li];
        const ring = line.closed ? line.pts.concat(line.pts[0]) : line.pts;
        // Array + join instead of repeated string += (cheaper for V8 at this
        // point count). Coordinates keep sub-pixel precision (1 decimal) —
        // rounding to whole viewBox units made points visibly snap between
        // integer positions frame to frame during rotation (the SVG can
        // render up to 640px for a 200-unit viewBox, so 1 unit is several
        // physical pixels), which read as the lines "breaking" into jittery
        // segments rather than sliding smoothly.
        const frontParts: string[] = [];
        const backParts: string[] = [];
        let side: 0 | 1 | -1 = 0; // -1 back, 1 front, 0 uninitialised
        for (let k = 0; k < ring.length; k++) {
          const bp = ring[k];
          const rx = bp.x * cosA + bp.z * sinA;
          const rz = -bp.x * sinA + bp.z * cosA;
          const y2 = bp.y * cosT - rz * sinT;
          const z2 = bp.y * sinT + rz * cosT;
          const sx = (100 + rx * 99).toFixed(1);
          const sy = (100 + y2 * 99).toFixed(1);
          const s: 1 | -1 = z2 >= 0 ? 1 : -1;
          const parts = s === 1 ? frontParts : backParts;
          parts.push(`${s !== side ? 'M' : 'L'}${sx} ${sy}`);
          side = s;
        }
        const fp = wireFrontRefs.current[li];
        const bpath = wireBackRefs.current[li];
        if (fp) fp.setAttribute('d', frontParts.join(''));
        if (bpath) bpath.setAttribute('d', backParts.join(''));
      }

      raf = visible ? requestAnimationFrame(render) : 0;
    };
    // The IntersectionObserver above starts the loop once the sphere is near
    // the viewport; nothing to kick off here.

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [base, entries, reduced, wire]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* opaque blue glow sitting behind the sphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '56%',
          height: '56%',
          maxWidth: 520,
          maxHeight: 520,
          background:
            'radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0.28) 42%, transparent 72%)',
          filter: 'blur(48px)',
        }}
      />
      {/* faint wireframe globe */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        width="72%"
        height="72%"
        viewBox="0 0 200 200"
        style={{ maxWidth: 640, maxHeight: 640, aspectRatio: '1' }}
      >
        <g fill="none">
          {/* rear of the mesh — dimmer than the front, but clearly visible */}
          <g stroke="rgba(96,165,250,0.22)" strokeWidth="0.45">
            {wire.map((_, i) => (
              <path key={`b${i}`} ref={(n) => (wireBackRefs.current[i] = n)} />
            ))}
          </g>
          {/* front of the mesh */}
          <g stroke="rgba(96,165,250,0.45)" strokeWidth="0.55">
            {wire.map((_, i) => (
              <path key={`f${i}`} ref={(n) => (wireFrontRefs.current[i] = n)} />
            ))}
          </g>
          <circle cx="100" cy="100" r="99" stroke="rgba(96,165,250,0.4)" strokeWidth="0.55" />
        </g>
      </svg>

      {skills.map((s, i) => {
        const Icon = s.Icon;
        return (
          <div
            key={s.name}
            ref={(n) => (nodeRefs.current[i] = n)}
            className="pointer-events-auto absolute flex cursor-default flex-col items-center will-change-transform"
            style={{ left: 0, top: 0, opacity: 0 }}
            onPointerEnter={() => {
              hoveredIndex.current = i;
            }}
            onPointerLeave={() => {
              if (hoveredIndex.current === i) hoveredIndex.current = null;
            }}
          >
            <Icon size={30} color={s.color} className="drop-shadow-md" />
            <span
              ref={(n) => (labelRefs.current[i] = n)}
              className="mt-2 whitespace-nowrap rounded-full px-2 py-0.5 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-muted"
              style={{ opacity: 0 }}
            >
              {s.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
