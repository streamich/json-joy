import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {HslColor} from '../../styles/color/HslColor';
import {Border} from '../Border';

export interface GradientBlob {
  /** Radial gradient size, e.g. "60% 55%". Default "60% 55%". */
  size?: string;
  /** Center position, e.g. "18% 100%". */
  at: string;
  /** Which palette color the blob uses. Default "primary". */
  color?: 'primary' | 'secondary' | 'tertiary';
  /** Transparent stop, e.g. "72%". Default "72%". */
  stop?: string;
}

export interface GradientSurfaceProps {
  /** Base color (any CSS color). Other stops default to analogous hues of it. */
  color?: string;
  /** Second color; defaults to an analogous hue of `color` (cooler, no muddy mix). */
  secondary?: string;
  /** Third color; defaults to a wider analogous hue of `color`. */
  tertiary?: string;
  /** Radial blobs forming the gradient. */
  blobs?: GradientBlob[];
  /** Add a vertical wash lifting the color from the bottom edge. Default true. */
  bottomWash?: boolean;
  /** Corner radius in px. Default 20. */
  radius?: number;
  /** Corner radius in px on hover. Animates from `radius` when set. */
  hoverRadius?: number;
  /** Minimum height in px. */
  minHeight?: number;
  /** Show the cursor-following Border glow. Default true. */
  border?: boolean;
  /** Border glow color; defaults to a faint version of `color`. */
  glowColor?: string;
  /** Border glow radius in px. Default 220. */
  glowRadius?: number;
  /** Border glow trailing delay in ms. Default 120. */
  glowDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const hoverMarker = 'jjGradientSurfaceHover';

const surfaceCls = rule({
  pos: 'relative',
  isolation: 'isolate',
  d: 'flex',
  flexDirection: 'column',
  ov: 'hidden',
  [`&:hover .${hoverMarker}`]: {opacity: 1},
});

const overlayCls = rule({
  pos: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  bdrad: 'inherit',
  opacity: 0,
  trs: 'opacity .4s ease',
});

const contentCls = rule({
  pos: 'relative',
  zIndex: 1,
  flex: '1 1 auto',
  d: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const frameCls = drule({trs: 'border-radius .25s ease'});

const defaultBlobs: GradientBlob[] = [
  {at: '18% 100%'},
  {at: '88% 108%', color: 'secondary'},
  {size: '75% 60%', at: '50% -12%', color: 'tertiary', stop: '65%'},
];

/**
 * A rounded surface with a layered feature-color gradient: a faint steady-state
 * background that cross-fades to a richer one on hover, plus a cursor-following
 * {@link Border} glow. Customize the look via `color`/`secondary`/`tertiary` and `blobs`.
 */
export const GradientSurface: React.FC<GradientSurfaceProps> = ({
  color,
  secondary,
  tertiary,
  blobs = defaultBlobs,
  bottomWash = true,
  radius = 20,
  hoverRadius,
  minHeight,
  border = true,
  glowColor,
  glowRadius = 220,
  glowDelay = 120,
  className,
  style,
  children,
}) => {
  const pri = HslColor.from(color ?? '') ?? new HslColor(0, 0, 0.6);
  const sec = (secondary ? HslColor.from(secondary) : undefined) ?? pri.analogous(1 / 6);
  const tert = (tertiary ? HslColor.from(tertiary) : undefined) ?? pri.analogous(1 / 3);
  const pick = (w?: 'primary' | 'secondary' | 'tertiary') => (w === 'tertiary' ? tert : w === 'secondary' ? sec : pri);
  const desat = -0.5;
  const build = (alpha: number, lift: number, baseL: number, wash: string): string => {
    const parts = blobs.map(
      (b) =>
        `radial-gradient(${b.size ?? '60% 55%'} at ${b.at}, ${pick(b.color).pct(0, desat, lift, alpha)}, transparent ${b.stop ?? '72%'})`,
    );
    if (bottomWash) parts.push(`linear-gradient(to top, ${pri.pct(0, desat, lift, alpha)}, transparent ${wash})`);
    parts.push(`linear-gradient(${pri.pct(0, desat, baseL)}, ${pri.pct(0, desat, baseL)})`);
    return parts.join(', ');
  };
  const subtleBg = build(-0.95, 0.5, 0.99, '85%');
  const fullBg = build(-0.87, 0.42, 0.985, '88%');
  const glow = glowColor ?? pri.pct(0, 0, 0, -0.45).toString();
  const ambient = pri.pct(0, -0.3, 0, -0.82).toString();
  const radiusClass = frameCls({
    borderRadius: radius + 'px',
    ...(hoverRadius !== undefined ? {'&:hover': {borderRadius: hoverRadius + 'px'}} : {}),
  });

  return (
    <div
      className={surfaceCls + ' ' + radiusClass + (className ? ' ' + className : '')}
      style={{minHeight, background: subtleBg, ...style}}
    >
      <div className={`${overlayCls} ${hoverMarker}`} style={{background: fullBg}} />
      <div className={contentCls}>{children}</div>
      {border && (
        <Border
          reach={8}
          // thickness={1.5}
          radius={glowRadius}
          delay={glowDelay}
          color={glow}
          ambientColor={ambient}
          style={{position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: 'inherit'}}
        />
      )}
    </div>
  );
};
