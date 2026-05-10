import * as React from 'react';
import {lightTheme, rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import type {Styles} from '../../styles/Styles';

const blockClass = drule({
  ...lightTheme.font.ui1.mid,
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  gap: '6px',
  bxz: 'border-box',
  pd: '3px 10px',
  fz: '13px',
  lh: '18px',
  whiteSpace: 'nowrap',
  bdrad: '999px',
});

const smallClass = rule({
  pd: '1px 8px',
  fz: '12px',
  lh: '16px',
});

export type PillColor = 'neutral' | 'success' | 'error' | 'warning' | 'link' | 'accent' | string;

export interface PillProps {
  /** Semantic color name or any raw CSS color string. */
  color?: PillColor;
  /** Filled background instead of subtle tint. */
  solid?: boolean;
  /** Smaller size variant. */
  small?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  children?: React.ReactNode;
}

const isSemantic = (color: string): color is Exclude<PillColor, string> =>
  color === 'neutral' ||
  color === 'success' ||
  color === 'error' ||
  color === 'warning' ||
  color === 'link' ||
  color === 'accent';

const resolveBase = (styles: Styles, color: PillColor): string => {
  if (isSemantic(color)) {
    if (color === 'neutral') return styles.g(0.4);
    return styles.col.get(color, 'solid-1');
  }
  return color;
};

export const Pill: React.FC<PillProps> = ({color = 'neutral', solid, small, className, style, onClick, children}) => {
  const styles = useStyles();
  const base = resolveBase(styles, color);

  const dyn = solid
    ? {
        bg: base,
        col: styles.light ? '#fff' : styles.g(0.04),
      }
    : {
        bg: color === 'neutral' ? styles.g(0, 0.06) : `${base}1f`,
        col: color === 'neutral' ? styles.g(0.25) : base,
      };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: presentational pill; click is non-essential and not focusable by default
    <span
      className={blockClass(dyn) + (small ? ' ' + smallClass : '') + (className ? ` ${className}` : '')}
      style={style}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
