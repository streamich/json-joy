import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  pos: 'relative',
});

const borderLayerClass = rule({
  pos: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  bdrad: 'inherit',
  trs: 'opacity 220ms ease',
  mask: 'linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)',
  WebkitMask: 'linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)',
  maskComposite: 'exclude',
  WebkitMaskComposite: 'xor',
});

export interface BorderProps {
  /** Border thickness in pixels. Default: 1. */
  thickness?: number;
  /** Radius of the bright spot in pixels. Default: 160. */
  radius?: number;
  /** Border-radius matching the wrapped content. Number (px) or any CSS length. */
  borderRadius?: number | string;
  /** Color of the bright spot following the cursor. Defaults to a high-contrast theme grey. */
  color?: string;
  /**
   * Color stops of the bright spot, from its center outward. Each entry is a CSS
   * color or a `color position` stop, letting the spot be a multi-color gradient.
   * Overrides `color` when set. Default: a single stop of `color`.
   */
  colors?: string[];
  /** Where the bright spot fades to transparent, as a fraction of its radius (0..1). Default: 0.7. */
  falloff?: number;
  /** Ambient (idle) border color visible when the cursor is away. */
  ambientColor?: string;
  /**
   * Smoothing time for the bright spot to trail the cursor, in milliseconds. 0
   * snaps to the cursor with no lag; higher values let the spot drift behind it.
   * Default: 0.
   */
  delay?: number;
  /** Stretch the proximity area beyond the element bounds, in px. Default: 0. */
  reach?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Border: React.FC<BorderProps> = ({
  thickness = 1,
  radius = 160,
  borderRadius,
  color,
  colors,
  falloff = 0.7,
  ambientColor,
  delay = 0,
  reach = 0,
  className,
  style,
  children,
}) => {
  const styles = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);
  const layerRef = React.useRef<HTMLDivElement>(null);
  const c = color ?? styles.g(0, 0.7);
  const a = ambientColor ?? styles.g(0, 0.12);

  const target = React.useRef({x: -9999, y: -9999, on: false});
  const pos = React.useRef({x: -9999, y: -9999, live: false});
  const raf = React.useRef(0);
  const lastT = React.useRef(0);
  const delayRef = React.useRef(delay);
  delayRef.current = delay;

  const step = React.useCallback((now: number) => {
    const t = target.current;
    const p = pos.current;
    const layer = layerRef.current;
    const d = delayRef.current;
    const dt = lastT.current ? Math.min(now - lastT.current, 64) : 16;
    lastT.current = now;
    if (!p.live) {
      p.x = t.x;
      p.y = t.y;
      p.live = true;
    } else {
      const k = d > 0 ? 1 - Math.exp(-dt / d) : 1;
      p.x += (t.x - p.x) * k;
      p.y += (t.y - p.y) * k;
    }
    if (layer) {
      layer.style.setProperty('--mx', p.x + 'px');
      layer.style.setProperty('--my', p.y + 'px');
      layer.style.opacity = t.on ? '1' : '';
    }
    const moving = Math.abs(t.x - p.x) > 0.25 || Math.abs(t.y - p.y) > 0.25;
    raf.current = moving ? requestAnimationFrame(step) : 0;
  }, []);

  const kick = React.useCallback(() => {
    if (!raf.current) {
      lastT.current = 0;
      raf.current = requestAnimationFrame(step);
    }
  }, [step]);

  React.useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const apply = React.useCallback(
    (x: number, y: number, on: boolean) => {
      if (delayRef.current > 0) {
        const t = target.current;
        t.x = x;
        t.y = y;
        t.on = on;
        kick();
      } else {
        const layer = layerRef.current;
        if (!layer) return;
        layer.style.setProperty('--mx', x + 'px');
        layer.style.setProperty('--my', y + 'px');
        layer.style.opacity = on ? '1' : '';
      }
    },
    [kick],
  );

  React.useEffect(() => {
    if (!reach) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const within = x >= -reach && x <= rect.width + reach && y >= -reach && y <= rect.height + reach;
      apply(x, y, within);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reach, apply]);

  const onMove = reach
    ? undefined
    : (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        apply(e.clientX - rect.left, e.clientY - rect.top, true);
      };

  const stops = colors && colors.length ? colors : [c];
  const layerStyle: React.CSSProperties = {
    padding: thickness,
    background:
      `radial-gradient(circle ${radius}px at var(--mx, -9999px) var(--my, -9999px), ${stops.join(', ')}, transparent ${falloff * 100}%),` +
      `linear-gradient(${a}, ${a})`,
  };

  return (
    <div
      ref={ref}
      className={blockClass + (className ? ' ' + className : '')}
      style={{borderRadius, ...style}}
      onMouseMove={onMove}
    >
      <div ref={layerRef} className={borderLayerClass} style={layerStyle} />
      {children}
    </div>
  );
};
