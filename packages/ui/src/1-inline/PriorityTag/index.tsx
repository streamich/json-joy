import * as React from 'react';
import {useStyles} from '../../styles/context';
import type {Styles} from '../../styles/Styles';
import {Chip} from '../Chip';
import {Donut} from '../Donut';

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

const clamp = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

export interface PriorityTagProps {
  /** Discrete priority level. Ignored when {@link PriorityTagProps.priority} is set. */
  level?: PriorityLevel;
  /** Opt-in continuous priority on a `0` ... `1` scale. When set, the tag renders a
   * {@link Donut} filled to this fraction (toned by the band it falls into) in
   * place of the discrete directional glyph. */
  priority?: number;
  label?: React.ReactNode;
  /** Render inline without the chip surface (transparent background, no padding). */
  plain?: boolean;
  /** Smaller size variant. */
  small?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Map a continuous 0..1 priority onto the four discrete bands (highest = urgent).
const priorityToLevel = (p: number): PriorityLevel =>
  p >= 0.75 ? 'urgent' : p >= 0.5 ? 'high' : p >= 0.25 ? 'medium' : 'low';

const levelColor = (styles: Styles, level: PriorityLevel): string => {
  switch (level) {
    case 'urgent':
      return styles.negative + '';
    case 'high':
      return styles.warning + '';
    case 'medium':
      return styles.info + '';
    default:
      return styles.g(0.45); // low → muted neutral
  }
};

// A single directional glyph reads the level at a glance — double chevron up for
// urgent, chevron up for high, a dash for medium, chevron down for low. Cleaner
// than a row of ascending signal bars.
const GLYPH: Record<PriorityLevel, string> = {
  urgent: 'M5 13l7-5 7 5M5 18l7-5 7 5',
  high: 'M5 15l7-6 7 6',
  medium: 'M6 12h12',
  low: 'M5 9l7 6 7-6',
};

const PriorityGlyph: React.FC<{level: PriorityLevel}> = ({level}) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={GLYPH[level]} />
  </svg>
);

/**
 * A *priority* token — a {@link Chip} toned in the level color (`urgent` danger,
 * `high` warning, `medium` info, `low` muted) with a directional glyph. `plain`
 * drops the chip surface for inline use (e.g. a property-card value).
 */
export const PriorityTag: React.FC<PriorityTagProps> = ({level, priority, label, plain, small, className, style}) => {
  const styles = useStyles();
  const continuous = typeof priority === 'number';
  const p = continuous ? clamp(priority as number) : 0;
  const effectiveLevel = continuous ? priorityToLevel(p) : (level ?? 'medium');
  const color = levelColor(styles, effectiveLevel);
  return (
    <Chip
      icon={
        continuous ? (
          <Donut progress={p} size={small ? 13 : 15} color={color} />
        ) : (
          <PriorityGlyph level={effectiveLevel} />
        )
      }
      color={color}
      small={small}
      className={className}
      style={plain ? {background: 'transparent', padding: 0, ...style} : style}
    >
      {label}
    </Chip>
  );
};
