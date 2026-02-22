import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {Link, type LinkProps} from '../../1-inline/Link';

const blockClass = rule({
  ...theme.font.ui2.bold,
  fz: '17.6px',
  col: theme.g(0.4),
  pd: '9px 18px 8px',
  mr: '0 2px',
  bdrad: '16px',
  bg: 'transparent',
  bd: 0,
  svg: {
    fill: theme.g(0.4),
  },
  '&:hover': {
    col: theme.g(0),
    svg: {
      fill: theme.g(0),
    },
  },
});

const activeClass = rule({
  col: theme.color.sem.blue[0],
  bg: 'rgba(0,128,255,.04)',
  svg: {
    fill: theme.blue,
  },
  '&:hover': {
    col: theme.blue,
    svg: {
      fill: theme.blue,
    },
  },
});

export interface PillButtonProps extends LinkProps {
  active?: boolean;
  children?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({active, children, ...rest}) => {
  return (
    <Link className={blockClass + (active ? activeClass : '')} {...rest}>
      {children}
    </Link>
  );
};
