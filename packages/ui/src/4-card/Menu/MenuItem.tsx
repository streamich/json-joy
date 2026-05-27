import * as React from 'react';
import {lightTheme, rule} from 'nano-theme';
import {Link} from 'react-router-lite';
import {useStyles} from '../../styles/context';

const baseCls = rule({
  ...lightTheme.font.display.mid,
  fz: '14px',
  // ...lightTheme.font.ui1.mid,
  // fz: '15px',
  col: 'var(--colTxt)',
  d: 'flex',
  w: '100%',
  bxz: 'border-box',
  alignItems: 'center',
  bdrad: '8px',
  bd: 0,
  pd: '10px 10px',
  bg: 'none',
  cur: 'pointer',
  mr: 0,
  out: 0,
  td: 'none',
  '&:hover': {
    td: 'none',
    col: 'var(--colTxtSharp)',
    bg: 'var(--colBgHover)',
  },
  '&+&': {
    mrt: '2px',
  },
});

const activeChildClass = rule({
  bg: 'var(--colBgActiveDim)',
});

const activeBlockClass = rule({
  cur: 'default',
  col: 'var(--colTxtActiveSharp)',
  bg: 'var(--colBgActive)',
  '&:hover': {
    col: 'var(--colTxtActiveHover)',
    bg: 'var(--colBgActive)',
  },
});

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
  const styles = useStyles();
  // const link = styles.col.get('link', 'solid-1');
  // const link = styles.accent.fg.pct(0, .2, -.2, -.06) + '';
  // const link = styles.link.fg.pct(0, 0, 0) + '';
  // const baseCls = baseClass({
  //   '&:hover': {
  //     col: styles.light ? '#000' : '#fff',
  //   },
  // });
  const activeParentCls = activeChild ? ' ' + activeChildClass : '';
  const activeBlockCls = active ? ' ' + activeBlockClass : '';

  let element = children;

  if (hasMore && !activeChild) {
    element = (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {children}
        <div style={{marginLeft: 8, color: styles.g(0, 0.5)}}>...</div>
      </div>
    );
  }

  return (
    <Link
      a={!!to}
      to={to}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={baseCls + activeParentCls + activeBlockCls}
    >
      {element}
    </Link>
  );
};
