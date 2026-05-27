import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {
  buildWave,
  buildScallop,
  PRESETS,
  UNIT,
  type Shape,
  type Generated,
  type DoodleDir,
  type DoodlePreset,
} from './shapes';

export type {DoodleDir, DoodlePreset} from './shapes';
export {DoodleRect, DoodleBend} from './tiles';

const shapeCls = drule({
  trs: 'fill .2s ease, opacity .2s ease',
});

const shapeHoverCls = drule({
  trs: 'fill .2s ease, opacity .2s ease',
  'svg:hover &': {
    fill: 'var(--ddl-on)',
    opacity: 1,
  },
});

export type DoodleVariant = 'line' | 'small' | 'blog';

export interface DoodleProps {
  preset?: DoodlePreset;
  pattern?: 'wave' | 'scallop';
  /** Number of periods in the generated ribbon. */
  segments?: number;
  /** Flow direction of the `wave` pattern. Ignored for `scallop`. */
  dir?: DoodleDir;
  /** Sizing / use-case preset, sets sensible defaults. */
  variant?: DoodleVariant;
  /** Rendered width in px, height keeps the doodle's aspect ratio. */
  size?: number;
  /** Render dimmed (greyscale, lowered opacity) as a subtle decoration. */
  dim?: boolean;
  /** When dimmed, restore full brand color on hover. */
  brightenOnHover?: boolean;
  /** Force the brightened (full-color, full-opacity) state without hover. */
  bright?: boolean;
  /** Opacity used when `dim` (default 0.5). */
  dimOpacity?: number;
  /** Accessible label, when omitted the doodle is purely decorative. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

const segmentsFor = (v: DoodleVariant): number => (v === 'small' ? 1 : v === 'blog' ? 3 : 6);
const sizeFor = (v: DoodleVariant, preset?: DoodlePreset): number => {
  if (preset === 'arch') return 240;
  if (preset === 'mini') return 64;
  return v === 'small' ? 56 : v === 'blog' ? 240 : 300;
};

export const Doodle: React.FC<DoodleProps> = ({
  preset,
  pattern = 'wave',
  segments,
  dir,
  variant = 'line',
  size,
  dim,
  brightenOnHover,
  bright,
  dimOpacity = 0.5,
  title,
  className,
  style,
}) => {
  const styles = useStyles();

  const cols = React.useMemo(() => styles.brand.map((b) => '' + b.fg), [styles]);
  const greys = React.useMemo(() => [styles.g(0.78), styles.g(0.7)], [styles]);

  const direction: DoodleDir = dir ?? (variant === 'blog' ? 'diagonal' : 'horizontal');
  const count = segments ?? segmentsFor(variant);

  const built: Generated = preset
    ? {groups: [{tx: 0, ty: 0, shapes: PRESETS[preset].shapes}], vb: PRESETS[preset].vb}
    : pattern === 'scallop'
      ? buildScallop(count)
      : buildWave(direction, count);
  const {groups, vb} = built;
  const vx = built.vx ?? 0;
  const vy = built.vy ?? 0;

  const w = size ?? sizeFor(variant, preset);
  const h = (w * vb.h) / vb.w;

  const base = brightenOnHover ? shapeHoverCls : shapeCls;

  const renderShape = (s: Shape, key: React.Key) => {
    const brightCol = cols[s.c];
    const lit = bright || !dim;
    const fill = lit ? brightCol : greys[s.c % 2];
    const cls = base({fill, opacity: lit ? 1 : dimOpacity});
    const shapeStyle = {['--ddl-on' as any]: brightCol} as React.CSSProperties;
    return s.t === 'r' ? (
      <rect key={key} className={cls} style={shapeStyle} x={s.x} y={s.y} width={s.w} height={s.h} />
    ) : (
      <path key={key} className={cls} style={shapeStyle} d={s.d} />
    );
  };

  return (
    <svg
      width={w}
      height={h}
      viewBox={`${vx} ${vy} ${vb.w} ${vb.h}`}
      fill="none"
      className={className}
      style={style}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {groups.map((g, gi) => {
        const transform = g.flip
          ? `translate(${g.tx + UNIT.w} ${g.ty}) scale(-1 1)`
          : g.tx || g.ty
            ? `translate(${g.tx} ${g.ty})`
            : undefined;
        return (
          <g key={gi} transform={transform}>
            {g.shapes.map((s, si) => renderShape(s, si))}
          </g>
        );
      })}
    </svg>
  );
};

export default Doodle;
