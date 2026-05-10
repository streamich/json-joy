import * as React from 'react';
import {drule, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  pos: 'relative',
});

const spotlightClass = drule({
  pos: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  bdrad: 'inherit',
  op: 0,
  trs: 'opacity 280ms ease',
});

export interface SpotlightProps {
  /** Radius of the spotlight in pixels. Default: 240. */
  radius?: number;
  /** Color of the spotlight. Defaults to a soft theme grey. */
  color?: string;
  /** Maximum opacity when the cursor is within range. 0..1, default 1. */
  intensity?: number;
  /** Falloff stop (0..1) where the gradient reaches transparent. Default: 0.7. */
  falloff?: number;
  /** Border-radius of the wrapper, also used to clip the spotlight layer. */
  borderRadius?: number | string;
  /**
   * Track the cursor outside the element bounds, in pixels. When > 0, attaches
   * a window-level mousemove listener and stays lit while the cursor is within
   * `rect + reach` on each side. Default: 0 (track inside the element only).
   */
  reach?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  radius = 240,
  color,
  intensity = 1,
  falloff = 0.7,
  borderRadius,
  reach = 0,
  className,
  style,
  children,
}) => {
  const styles = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);
  const layerRef = React.useRef<HTMLDivElement>(null);
  const c = color ?? styles.g(0.95, 0.18);

  React.useEffect(() => {
    if (!reach) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      const layer = layerRef.current;
      if (!el || !layer) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const within =
        x >= -reach && x <= rect.width + reach && y >= -reach && y <= rect.height + reach;
      layer.style.setProperty('--mx', x + 'px');
      layer.style.setProperty('--my', y + 'px');
      layer.style.opacity = within ? String(intensity) : '0';
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reach, intensity]);

  const onMove = reach
    ? undefined
    : (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        const layer = layerRef.current;
        if (!el || !layer) return;
        const rect = el.getBoundingClientRect();
        layer.style.setProperty('--mx', e.clientX - rect.left + 'px');
        layer.style.setProperty('--my', e.clientY - rect.top + 'px');
      };
  const onEnter = reach
    ? undefined
    : () => {
        if (layerRef.current) layerRef.current.style.opacity = String(intensity);
      };
  const onLeave = reach
    ? undefined
    : () => {
        if (layerRef.current) layerRef.current.style.opacity = '0';
      };

  React.useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.style.background = `radial-gradient(circle ${radius}px at var(--mx, -9999px) var(--my, -9999px), ${c}, transparent ${falloff * 100}%)`;
  }, [radius, c, falloff]);

  return (
    <div
      ref={ref}
      className={blockClass + (className ? ' ' + className : '')}
      style={{borderRadius, ...style}}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div ref={layerRef} className={String(spotlightClass)} />
      {children}
    </div>
  );
};
