import * as React from 'react';
import {useStyles} from '../../styles/context';
import type {Styles} from '../../styles/Styles';
import {Chip} from '../Chip';
import {Donut} from '../Donut';

/** Status semantics, mapped to the design system's `--ok/warn/info/danger` + muted/accent. */
export type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'accent' | 'muted';

/** The leading marker shape. */
export type StatusShape = 'dot' | 'ring' | 'check' | 'dash' | 'donut' | 'none';

export interface StatusPillProps {
  tone?: StatusTone;
  label: React.ReactNode;
  /** Leading glyph. @default 'dot' */
  shape?: StatusShape;
  /** Fill fraction `0` ... `1` for the `donut` shape (e.g. a task's % complete). */
  progress?: number;
  small?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

const toneColor = (styles: Styles, tone: StatusTone): string => {
  switch (tone) {
    case 'success':
      return styles.positive + '';
    case 'warning':
      return styles.warning + '';
    case 'info':
      return styles.info + '';
    case 'danger':
      return styles.negative + '';
    case 'accent':
      return styles.accent + '';
    default:
      return styles.g(0.34); // muted
  }
};

// `ring` (in-progress), `check` (done) and `dash` (cancelled) glyphs, drawn in
// `currentColor` so they inherit the Chip's toned foreground. `dot` is handled by
// the Chip's own `dot` mark; `none` renders no glyph.
const ShapeGlyph: React.FC<{shape: 'ring' | 'check' | 'dash'}> = ({shape}) => {
  if (shape === 'check')
    return (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M2.5 6.5L5 9L9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (shape === 'dash') return <span style={{width: 9, height: 2, borderRadius: 2, background: 'currentColor'}} />;
  // ring
  return (
    <span
      style={{width: 8, height: 8, borderRadius: '50%', border: '2px solid currentColor', boxSizing: 'border-box'}}
    />
  );
};

/**
 * A typed *status* token — a {@link Chip} toned in the status color (a soft tint
 * background + the color as the marker and label), in the Linear style (e.g.
 * `In Progress`, `Done`, `Upcoming`). `shape` picks the marker: filled `dot`,
 * open `ring` for in-progress, `check` for done, `dash` for cancelled, or `none`.
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  tone = 'muted',
  label,
  shape = 'dot',
  progress = 0,
  small,
  className,
  style,
  onClick,
}) => {
  const styles = useStyles();
  const color = toneColor(styles, tone);
  const glyph = shape === 'ring' || shape === 'check' || shape === 'dash';
  const icon = glyph ? (
    <ShapeGlyph shape={shape} />
  ) : shape === 'donut' ? (
    <Donut progress={progress} size={small ? 12 : 14} color={color} />
  ) : undefined;
  return (
    <Chip
      color={color}
      dot={shape === 'dot' ? color : undefined}
      icon={icon}
      small={small}
      onClick={onClick}
      className={className}
      style={style}
    >
      {label}
    </Chip>
  );
};
