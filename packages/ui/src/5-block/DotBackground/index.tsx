import * as React from 'react';
import {rule} from 'nano-theme';

const SIZE = 16;
const SETTLE_DIST_SQ = 0.04;
const SETTLE_VEL_SQ = 0.0025;
const TWO_PI = Math.PI * 2;

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

const BLOBS: readonly BlobConfig[] = [
  {radius: 144, stiffness: 0.06, damping: 0.62, wander: 32, rollMin: 450, rollMax: 850},
  {radius: 105, stiffness: 0.1, damping: 0.66, wander: 56, rollMin: 500, rollMax: 950},
  {radius: 44, stiffness: 0.03, damping: 0.7, wander: 84, rollMin: 550, rollMax: 1050},
];

const BLOB_COUNT = BLOBS.length;
const ROLL_SPAN: readonly number[] = BLOBS.map((b) => b.rollMax - b.rollMin);
const VAR_X: readonly string[] = BLOBS.map((_, i) => `--b${i}x`);
const VAR_Y: readonly string[] = BLOBS.map((_, i) => `--b${i}y`);

interface BlobState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  nextRoll: number;
  writtenX: number;
  writtenY: number;
}

const createBlobs = (): BlobState[] => {
  const arr = new Array<BlobState>(BLOB_COUNT);
  for (let i = 0; i < BLOB_COUNT; i++) {
    arr[i] = {
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      ox: 0,
      oy: 0,
      nextRoll: 0,
      writtenX: NaN,
      writtenY: NaN,
    };
  }
  return arr;
};

export interface DotBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const DotBackground: React.FC<DotBackgroundProps> = ({className, children}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const stateRef = React.useRef({
    targetX: -9999,
    targetY: -9999,
    blobs: createBlobs(),
    active: false,
    rafId: 0,
    initialized: false,
  });

  const tick = React.useCallback(() => {
    const s = stateRef.current;
    const el = ref.current;
    if (!el) {
      s.rafId = 0;
      return;
    }
    const style = el.style;
    const blobs = s.blobs;
    const targetX = s.targetX;
    const targetY = s.targetY;
    const active = s.active;
    const now = performance.now();
    let allSettled = true;
    for (let i = 0; i < BLOB_COUNT; i++) {
      const cfg = BLOBS[i];
      const blob = blobs[i];
      if (active && now >= blob.nextRoll) {
        const angle = Math.random() * TWO_PI;
        const dist = Math.random() * cfg.wander;
        blob.ox = Math.cos(angle) * dist;
        blob.oy = Math.sin(angle) * dist;
        blob.nextRoll = now + cfg.rollMin + Math.random() * ROLL_SPAN[i];
      }
      const tx = targetX + blob.ox;
      const ty = targetY + blob.oy;
      const dx = tx - blob.x;
      const dy = ty - blob.y;
      let vx = (blob.vx + dx * cfg.stiffness) * cfg.damping;
      let vy = (blob.vy + dy * cfg.stiffness) * cfg.damping;
      let x = blob.x + vx;
      let y = blob.y + vy;
      if (dx * dx + dy * dy > SETTLE_DIST_SQ || vx * vx + vy * vy > SETTLE_VEL_SQ) {
        allSettled = false;
      } else {
        x = tx;
        y = ty;
        vx = 0;
        vy = 0;
      }
      blob.x = x;
      blob.y = y;
      blob.vx = vx;
      blob.vy = vy;
      if (x !== blob.writtenX) {
        style.setProperty(VAR_X[i], x + 'px');
        blob.writtenX = x;
      }
      if (y !== blob.writtenY) {
        style.setProperty(VAR_Y[i], y + 'px');
        blob.writtenY = y;
      }
    }
    s.rafId = active || !allSettled ? requestAnimationFrame(tick) : 0;
  }, []);

  const ensureTicking = React.useCallback(() => {
    const s = stateRef.current;
    if (s.rafId === 0) s.rafId = requestAnimationFrame(tick);
  }, [tick]);

  const updateTarget = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = stateRef.current;
    const tx = e.clientX - rect.left;
    const ty = e.clientY - rect.top;
    s.targetX = tx;
    s.targetY = ty;
    if (!s.initialized) {
      const now = performance.now();
      const blobs = s.blobs;
      for (let i = 0; i < BLOB_COUNT; i++) {
        const blob = blobs[i];
        blob.x = tx;
        blob.y = ty;
        blob.vx = 0;
        blob.vy = 0;
        blob.ox = 0;
        blob.oy = 0;
        blob.nextRoll = now + Math.random() * BLOBS[i].rollMax;
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
      if (s.rafId !== 0) {
        cancelAnimationFrame(s.rafId);
        s.rafId = 0;
      }
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
