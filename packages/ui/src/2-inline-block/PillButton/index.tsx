import * as React from 'react';
import {makeRule} from 'nano-theme';
import {Link, type LinkProps} from '../../1-inline/Link';

const useBlockClass = makeRule((t) => ({
  ...t.font.ui2.bold,
  fz: '17.6px',
  col: t.g(0.4),
  pd: '9px 18px 8px',
  mr: '0 2px',
  bdrad: '16px',
  bg: 'transparent',
  bd: 0,
  svg: {
    fill: t.g(0.4),
  },
  '&:hover': {
    col: t.g(0),
    svg: {
      fill: t.g(0),
    },
  },
}));

const useActiveClass = makeRule((t) => ({
  col: t.color.sem.blue[0],
  bg: 'rgba(0,128,255,.04)',
  svg: {
    fill: t.blue(1),
  },
  '&:hover': {
    col: t.blue(1),
    svg: {
      fill: t.blue(1),
    },
  },
}));

export interface PillButtonProps extends LinkProps {
  active?: boolean;
  children?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({active, children, ...rest}) => {
  const blockClass = useBlockClass();
  const activeClass = useActiveClass();
  return (
    <Link className={blockClass + (active ? activeClass : '')} {...rest}>
      {children}
    </Link>
  );
};
