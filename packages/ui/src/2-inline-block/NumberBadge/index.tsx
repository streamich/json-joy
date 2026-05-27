import * as React from 'react';
import {rule, theme} from 'nano-theme';

const sm = '@media only screen and (max-width: 600px)';

const badgeClass = rule({
  ...theme.font.display.black,
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  bxz: 'border-box',
  w: '40px',
  h: '40px',
  bdrad: '11px',
  fz: '16px',
  lh: 1,
  bd: '1px solid',
  trs: 'color .15s, border-color .15s, background .15s, box-shadow .15s',
  [sm]: {w: '34px', h: '34px', bdrad: '9px', fz: '15px'},
});

export interface NumberBadgeProps {
  /** Badge content, typically a 1-based number or a small icon. */
  children?: React.ReactNode;
  /** Colors, shadow, and any overrides. The border uses `currentColor` unless `borderColor` is set. */
  style?: React.CSSProperties;
  className?: string;
}

/**
 * A rounded-square badge holding a number or small icon, in the display
 * black font. Used as the numbered bullet in {@link Stepper} and for numbered
 * value props.
 */
export const NumberBadge: React.FC<NumberBadgeProps> = ({children, style, className}) => (
  <span className={badgeClass + (className ? ' ' + className : '')} style={style}>
    {children}
  </span>
);

export default NumberBadge;
