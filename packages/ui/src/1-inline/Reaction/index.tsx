import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';

const mono = fonts.get('mono', 'mid');

const blockClass = drule({
  d: 'inline-flex',
  ai: 'center',
  gap: '5px',
  bxz: 'border-box',
  pd: '2px 9px',
  fz: '12px',
  lh: '17px',
  bd: '1px solid transparent',
  bdrad: '999px',
  cur: 'pointer',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
  userSelect: 'none',
  trs: 'background .14s, border-color .14s',
});

const emojiClass = rule({
  fz: '13px',
  lh: '13px',
});

const countClass = rule({
  ...mono,
  fz: '11px',
  fontVariantNumeric: 'tabular-nums',
});

export interface ReactionProps {
  emoji: React.ReactNode;
  count?: number;
  /** The current user has reacted — pill is filled in the accent color. */
  active?: boolean;
  onToggle?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A single *reaction* pill — an emoji with an optional count. `active` (the
 * current user reacted) fills it with a soft accent tint and accent border;
 * controlled via `onToggle`.
 */
export const Reaction: React.FC<ReactionProps> = ({emoji, count, active, onToggle, className, style}) => {
  const styles = useStyles();
  const accent = styles.accent + '';
  const dyn = active
    ? {bg: styles.accent.softTint(0.14), bd: `1px solid ${styles.accent.softTint(0.5)}`, col: accent}
    : {
        bg: styles.g(0, 0.05),
        bd: '1px solid transparent',
        col: styles.g(0.3),
        '&:hover': {bg: styles.g(0, 0.09)},
      };
  return (
    <button
      type="button"
      aria-pressed={active}
      className={blockClass(dyn) + (className ? ' ' + className : '')}
      style={style}
      onClick={onToggle}
    >
      <span className={emojiClass}>{emoji}</span>
      {count !== undefined && count !== null && <span className={countClass}>{count}</span>}
    </button>
  );
};
