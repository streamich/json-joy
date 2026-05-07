import * as React from 'react';
import {rule} from 'nano-theme';

const SIZE = 16;
const SETTLE_DIST = 0.2;
const SETTLE_VEL = 0.05;

const blobMask = (radius: number, idx: number) =>
  `radial-gradient(circle ${radius}px at ` +
  `var(--b${idx}x, -9999px) var(--b${idx}y, -9999px), ` +
  `#000 0%, transparent 70%)`;

const mask = [blobMask(130, 0), blobMask(105, 1), blobMask(85, 2)].join(', ');

const dotClass = rule({
  pos: 'relative',
  bgi: 'radial-gradient(circle, rgba(127,127,127,.1) 1px, transparent 1px)',
  bgs: `${SIZE}px ${SIZE}px`,
  '&::before': {
    content: '""',
    pos: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    bgi: 'radial-gradient(circle, rgba(127,127,127,.55) 1px, transparent 1px)',
    bgs: `${SIZE}px ${SIZE}px`,
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: 'add',
    WebkitMaskComposite: 'source-over',
    opacity: 'var(--dot-opacity, 0)',
    transition: 'opacity 300ms ease',
  },
});

interface BlobConfig {
  radius: number;
  stiffness: number;
  damping: number;
  wander: number;
  rollMin: number;
  rollMax: number;
}

const BLOBS: BlobConfig[] = [
  {radius: 144, stiffness: 0.06, damping: 0.62, wander: 32, rollMin: 450, rollMax: 850},
  {radius: 105, stiffness: 0.1, damping: 0.66, wander: 56, rollMin: 500, rollMax: 950},
  {radius: 44, stiffness: 0.03, damping: 0.7, wander: 84, rollMin: 550, rollMax: 1050},
];

interface BlobState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  nextRoll: number;
}

export interface DotBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const DotBackground: React.FC<DotBackgroundProps> = ({className, children}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const stateRef = React.useRef({
    targetX: -9999,
    targetY: -9999,
    blobs: BLOBS.map<BlobState>(() => ({x: -9999, y: -9999, vx: 0, vy: 0, ox: 0, oy: 0, nextRoll: 0})),
    active: false,
    rafId: null as number | null,
    initialized: false,
  });

  const tick = React.useCallback(() => {
    const s = stateRef.current;
    const el = ref.current;
    if (!el) {
      s.rafId = null;
      return;
    }

    const now = performance.now();
    let allSettled = true;
    for (let i = 0; i < BLOBS.length; i++) {
      const cfg = BLOBS[i];
      const blob = s.blobs[i];
      if (s.active && now >= blob.nextRoll) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = Math.random() * cfg.wander;
        blob.ox = Math.cos(angle) * dist;
        blob.oy = Math.sin(angle) * dist;
        blob.nextRoll = now + cfg.rollMin + Math.random() * (cfg.rollMax - cfg.rollMin);
      }
      const tx = s.targetX + blob.ox;
      const ty = s.targetY + blob.oy;
      const dx = tx - blob.x;
      const dy = ty - blob.y;
      blob.vx = (blob.vx + dx * cfg.stiffness) * cfg.damping;
      blob.vy = (blob.vy + dy * cfg.stiffness) * cfg.damping;
      blob.x += blob.vx;
      blob.y += blob.vy;
      if (Math.hypot(dx, dy) > SETTLE_DIST || Math.hypot(blob.vx, blob.vy) > SETTLE_VEL) {
        allSettled = false;
      } else {
        blob.x = tx;
        blob.y = ty;
        blob.vx = 0;
        blob.vy = 0;
      }
      el.style.setProperty(`--b${i}x`, `${blob.x}px`);
      el.style.setProperty(`--b${i}y`, `${blob.y}px`);
    }

    if (s.active || !allSettled) {
      s.rafId = requestAnimationFrame(tick);
    } else {
      s.rafId = null;
    }
  }, []);

  const ensureTicking = React.useCallback(() => {
    const s = stateRef.current;
    if (s.rafId === null) s.rafId = requestAnimationFrame(tick);
  }, [tick]);

  const updateTarget = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = stateRef.current;
    s.targetX = e.clientX - rect.left;
    s.targetY = e.clientY - rect.top;
    if (!s.initialized) {
      const now = performance.now();
      for (let i = 0; i < s.blobs.length; i++) {
        const blob = s.blobs[i];
        const cfg = BLOBS[i];
        blob.x = s.targetX;
        blob.y = s.targetY;
        blob.vx = 0;
        blob.vy = 0;
        blob.ox = 0;
        blob.oy = 0;
        blob.nextRoll = now + Math.random() * cfg.rollMax;
      }
      s.initialized = true;
    }
  }, []);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateTarget(e);
      ensureTicking();
    },
    [updateTarget, ensureTicking],
  );

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateTarget(e);
      stateRef.current.active = true;
      ref.current?.style.setProperty('--dot-opacity', '1');
      ensureTicking();
    },
    [updateTarget, ensureTicking],
  );

  const handleMouseLeave = React.useCallback(() => {
    stateRef.current.active = false;
    ref.current?.style.setProperty('--dot-opacity', '0');
  }, []);

  React.useEffect(() => {
    return () => {
      const s = stateRef.current;
      if (s.rafId !== null) cancelAnimationFrame(s.rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `${dotClass} ${className}` : dotClass}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};
