import * as React from 'react';
import {rule, lightTheme as theme, useRule, useTheme} from 'nano-theme';
import {Link} from '@jsonjoy.com/ui/lib/1-inline/Link';

export const blockClass = rule({
  ...theme.font.ui1.mid,
  fz: '14px',
  cur: 'pointer',
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
  fill?: boolean;
  size?: number;
  width?: 'auto' | number | string;
  height?: number | string;
  round?: boolean;
  title?: string;
  positive?: boolean;
  noOutline?: boolean;
  transparent?: boolean;
  compact?: boolean;
  spacious?: boolean;
  radius?: number | string;
  onClick?: React.MouseEventHandler;
}

export const BasicButton: React.FC<BasicButtonProps> = ({
  to,
  border,
  fill,
  size = 24,
  width = size,
  height = size,
  round,
  title,
  positive,
  noOutline,
  transparent,
  onClick,
  children,
  compact,
  spacious,
  radius,
  className = '',
  ...rest
}) => {
  const theme = useTheme();
  const {isLight} = theme;
  const bgFactor = isLight ? 1 : 1.1;

  const dynamicBlockClass = useRule(({g}) => ({
    // col: g(0.2),
    // svg: {
    // fill: g(0.5),
    // col: g(0.5),
    // },
    '&:hover': {
      // col: g(0.2),
      bg: g(0, 0.08 * bgFactor),
    },
    '&:active': {
      bg: g(0, 0.16 * bgFactor),
    },
  }));

  const fillBlockClass = useRule(({g}) => ({
    bg: transparent ? 'transparent' : g(0, 0.04 * bgFactor),
    '&:hover': {
      bg: g(0, 0.08 * bgFactor),
    },
    '&:active': {
      bg: g(0, 0.16 * bgFactor),
    },
  }));

  const borderClass = useRule(({g}) => ({
    bd: `1px solid ${g(0, 0.16 * bgFactor)}`,
    boxShadow: `0 0 2px ${g(0, 0.04 * bgFactor)}`,
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
  }

  if (noOutline) {
    style.boxShadow = 'none';
  }

  if (radius !== undefined) {
    style.borderRadius = radius;
  }

  return (
    <Link
      {...rest}
      a={!!to}
      className={
        className + blockClass + dynamicBlockClass + (border ? borderClass : '') + (fill ? fillBlockClass : '')
      }
      style={style}
      title={title}
      onClick={to ? undefined : onClick}
      onDragStart={handleDragStart}
      to={to}
      data-testid="BasicButton"
    >
      {children}
    </Link>
  );
};
