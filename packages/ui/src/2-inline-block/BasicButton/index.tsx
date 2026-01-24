import * as React from 'react';
import {rule, lightTheme as theme, useRule} from 'nano-theme';
import {Link} from '../../1-inline/Link';
import {Ripple} from '../../misc/Ripple';
import {useStyles} from '../../styles/context';

export const blockClass = rule({
  ...theme.font.ui1.mid,
  fz: '14px',
  // cur: 'pointer',
  us: 'none',
  trs: 'background .12s ease-in 0s, opacity .12s ease-in 0s',
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  fls: 0,
  bdrad: '3px',
  bg: 'transparent',
  bd: 0,
  mr: 0,
  pd: 0,
  out: 0,
  ov: 'visible',
  '&:hover': {
    bxsh: 'none',
  },
  '&:active': {
    bxsh: 'none',
  },
});

const handleDragStart = (e: React.MouseEvent) => e.preventDefault();

export interface BasicButtonProps extends React.AllHTMLAttributes<any> {
  to?: string;
  border?: boolean;
  skewed?: boolean;
  fill?: boolean;
  size?: number;
  width?: 'auto' | number | string;
  height?: number | string;
  round?: boolean;
  rounder?: boolean;
  roundest?: boolean;
  title?: string;
  positive?: boolean;
  noOutline?: boolean;
  transparent?: boolean;
  compact?: boolean;
  spacious?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onClick?: React.MouseEventHandler;
}

export const BasicButton: React.FC<BasicButtonProps> = ({
  to,
  border,
  skewed,
  fill,
  size = 24,
  width = size,
  height = size,
  round,
  rounder,
  roundest,
  title,
  positive,
  noOutline,
  transparent,
  onClick,
  children,
  compact,
  spacious,
  disabled,
  selected,
  className = '',
  ...rest
}) => {
  const styles = useStyles();
  const g = styles.g;
  const bgFactor = styles.light ? 1 : 1.1;

  const dynamicBlockClass = useRule(() => ({
    col: g(0.2),
    bg: selected ? styles.col.accent(0, 'bg-2') : transparent || !fill ? 'transparent' : g(0, 0.04 * bgFactor),
    // svg: {
    //   fill: g(0.5),
    //   col: g(0.5),
    // },
    '&:hover': {
      col: disabled ? void 0 : g(0.2),
      bg: disabled ? void 0 : g(0, 0.08 * bgFactor),
    },
    '&:active': {
      bg: disabled ? void 0 : g(0, 0.16 * bgFactor),
    },
  }));

  const borderClass = useRule(() => ({
    // bg: g(0, 0.08 * bgFactor),
    bd: `1px solid ${g(0, 0.08 * bgFactor)}`,
    // boxShadow: `0 0 2px ${g(0, 0.04 * bgFactor)}`,
  }));

  const style: React.CSSProperties = {
    height,
  };

  style.width = width;

  if (typeof width !== 'number') {
    if (spacious) {
      style.padding = '8px 16px';
    } else {
      style.paddingLeft = compact ? 8 : 16;
      style.paddingRight = compact ? 8 : 16;
    }
  }

  if (round) {
    style.borderRadius = '50%';
  } else if (skewed) {
    style.borderRadius = '18% / 25%';
  } else if (rounder) {
    style.borderRadius = '6px';
  } else if (roundest) {
    style.borderRadius = '1em';
  }

  if (noOutline) {
    style.boxShadow = 'none';
  }

  if (disabled) {
    style.opacity = 0.7;
  }

  return (
    <Ripple ms={1_500} color={positive ? styles.col.get('success') : styles.g(0, 0.08)} disabled={disabled}>
      <Link
        {...rest}
        a={!!to}
        className={className + blockClass + dynamicBlockClass + (border ? borderClass : '')}
        style={style}
        title={title}
        onClick={to ? undefined : onClick}
        onDragStart={handleDragStart}
        to={to}
        data-testid="BasicButton"
      >
        {children}
      </Link>
    </Ripple>
  );
};

export default BasicButton;
