import * as React from 'react';
import {theme, rule, useRule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.ui1.mid,
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

export type PillColor = 'neutral' | 'positive' | 'negative' | 'warning' | 'blue' | 'accent' | string;

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
  color === 'positive' ||
  color === 'negative' ||
  color === 'warning' ||
  color === 'blue' ||
  color === 'accent';

const resolveBase = (color: PillColor): string => {
  if (isSemantic(color)) {
    if (color === 'neutral') return theme.g(0.4);
    return theme.color.sem[color][0];
  }
  return color;
};

export const Pill: React.FC<PillProps> = ({color = 'neutral', solid, small, className, style, onClick, children}) => {
  const base = resolveBase(color);

  const dynamicClass = useRule((t) => {
    if (solid) {
      return {
        bg: base,
        col: t.isLight ? '#fff' : t.g(0.04),
      };
    }
    return {
      bg: color === 'neutral' ? t.g(0, 0.06) : `${base}1f`,
      col: color === 'neutral' ? t.g(0.25) : base,
    };
  });

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: presentational pill; click is non-essential and not focusable by default
    <span
      className={blockClass + (small ? smallClass : '') + dynamicClass + (className ? ` ${className}` : '')}
      style={style}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
