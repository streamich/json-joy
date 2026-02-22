import * as React from 'react';
import {rule, makeRule, theme} from 'nano-theme';
import {Link} from 'react-router-lite';

const blockClass = rule({
  ...theme.font.ui1.mid,
  fz: '15px',
  d: 'flex',
  w: '100%',
  bxz: 'border-box',
  alignItems: 'center',
  bdrad: '6px',
  bd: 0,
  pad: '10px 8px',
  bg: 'none',
  cur: 'pointer',
  mar: 0,
  out: 0,
  '&+&': {
    mart: '2px',
  },
});

const useBlockClass = makeRule((theme) => ({
  col: theme.g(0, 0.9),
  '&:hover': {
    bg: theme.g(0.96),
    col: '#000',
  },
}));

const useBlockActiveChildClass = makeRule((theme) => ({
  bg: theme.g(0, 0.01),
}));

const useBlockActiveClass = makeRule((theme) => ({
  cur: 'default',
  col: theme.color.sem.blue[0],
  bg: 'rgba(0,128,255,.04)',
}));

export interface Props {
  active?: boolean;
  activeChild?: boolean;
  to?: string;
  hasMore?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  onMouseDown?: () => void;
}

export const MenuItem: React.FC<Props> = ({active, activeChild, to, onClick, onMouseDown, children, hasMore}) => {
  const dynamicBlockClass = useBlockClass();
  const activeChildClass = useBlockActiveChildClass();
  const activeBlockClass = useBlockActiveClass();

  let element = children;

  if (hasMore && !activeChild) {
    element = (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {children}
        <div style={{marginLeft: 8, color: theme.g(0, 0.5)}}>...</div>
      </div>
    );
  }

  return (
    <Link
      a={!!to}
      to={to}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={
        blockClass + dynamicBlockClass + (activeChild ? activeChildClass : '') + (active ? activeBlockClass : '')
      }
    >
      {element}
    </Link>
  );
};
