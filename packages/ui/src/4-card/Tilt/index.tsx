import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  d: 'inline-block',
  willChange: 'transform',
  trs: 'transform .22s cubic-bezier(.2,1,.4,1)',
});

export interface TiltProps {
  /** Maximum tilt in degrees (per axis). Default: 8. */
  max?: number;
  /** Perspective in pixels. Larger means subtler tilt. Default: 700. */
  perspective?: number;
  /** Scale factor while active. Default: 1. (1.02 for a slight pop.) */
  scale?: number;
  /** Reverse direction (push away from cursor instead of toward). Default: false. */
  reverse?: boolean;
  /** Track the cursor outside the element bounds, in pixels. */
  reach?: number;
  /** Disable the effect. */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

export const Tilt: React.FC<TiltProps> = ({
  max = 8,
  perspective = 700,
  scale = 1,
  reverse,
  reach = 0,
  disabled,
  className,
  style,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const apply = React.useCallback(
    (rx: number, ry: number, s: number) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
    },
    [perspective],
  );

  const compute = React.useCallback(
    (cx: number, cy: number, rect: DOMRect) => {
      const px = (cx - rect.left) / rect.width - 0.5;
      const py = (cy - rect.top) / rect.height - 0.5;
      const sign = reverse ? -1 : 1;
      const rx = clamp(sign * -py * 2 * max, -max, max);
      const ry = clamp(sign * px * 2 * max, -max, max);
      return {rx, ry};
    },
    [reverse, max],
  );

  React.useEffect(() => {
    if (!reach || disabled) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const within =
        x >= rect.left - reach && x <= rect.right + reach && y >= rect.top - reach && y <= rect.bottom + reach;
      if (within) {
        const {rx, ry} = compute(x, y, rect);
        apply(rx, ry, scale);
      } else {
        apply(0, 0, 1);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reach, disabled, scale, apply, compute]);

  const onMove = reach
    ? undefined
    : (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const {rx, ry} = compute(e.clientX, e.clientY, rect);
        apply(rx, ry, scale);
      };

  const onLeave = reach ? undefined : () => apply(0, 0, 1);

  return (
    <div
      ref={ref}
      className={blockClass + (className ? ' ' + className : '')}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};
