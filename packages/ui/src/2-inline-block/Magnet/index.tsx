import * as React from 'react';
import {rule} from 'nano-theme';

const wrapClass = rule({
  d: 'inline-block',
  willChange: 'transform',
});

export interface MagnetProps {
  /** Distance from the element edge at which the pull starts, in pixels. Default: 80. */
  threshold?: number;
  /** Translation strength: fraction of the cursor offset applied. 0..1. Default: 0.25. */
  strength?: number;
  /** Maximum translation cap in pixels (per axis). Default: 24. */
  max?: number;
  /** Spring stiffness (toward target). 0..1. Default: 0.18. */
  stiffness?: number;
  /** Spring damping (velocity decay). 0..1. Default: 0.65. */
  damping?: number;
  /** Disable the effect (passthrough children unchanged). */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Magnet: React.FC<MagnetProps> = ({
  threshold = 80,
  strength = 0.25,
  max = 24,
  stiffness = 0.18,
  damping = 0.65,
  disabled,
  className,
  style,
  children,
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const stateRef = React.useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tx: 0,
    ty: 0,
    rafId: 0,
    written: {x: 0, y: 0},
  });

  React.useEffect(() => {
    if (disabled) return;
    const tick = () => {
      const s = stateRef.current;
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      s.vx = (s.vx + dx * stiffness) * damping;
      s.vy = (s.vy + dy * stiffness) * damping;
      s.x += s.vx;
      s.y += s.vy;
      const settled = Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && Math.abs(s.vx) < 0.05 && Math.abs(s.vy) < 0.05;
      if (settled) {
        s.x = s.tx;
        s.y = s.ty;
        s.vx = 0;
        s.vy = 0;
      }
      const el = ref.current;
      if (el && (s.x !== s.written.x || s.y !== s.written.y)) {
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
        s.written.x = s.x;
        s.written.y = s.y;
      }
      s.rafId = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const overflowX = Math.max(0, Math.abs(dx) - rect.width / 2);
      const overflowY = Math.max(0, Math.abs(dy) - rect.height / 2);
      const edgeDist = Math.hypot(overflowX, overflowY);
      const s = stateRef.current;
      if (edgeDist <= threshold) {
        const tx = dx * strength;
        const ty = dy * strength;
        s.tx = Math.max(-max, Math.min(max, tx));
        s.ty = Math.max(-max, Math.min(max, ty));
      } else {
        s.tx = 0;
        s.ty = 0;
      }
      if (s.rafId === 0) s.rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      const s = stateRef.current;
      if (s.rafId !== 0) {
        cancelAnimationFrame(s.rafId);
        s.rafId = 0;
      }
    };
  }, [threshold, strength, max, stiffness, damping, disabled]);

  return (
    <span ref={ref} className={wrapClass + (className ? ' ' + className : '')} style={style}>
      {children}
    </span>
  );
};
