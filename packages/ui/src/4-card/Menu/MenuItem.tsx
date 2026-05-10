import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {Link} from 'react-router-lite';
import {useStyles} from '../../styles/context';

const baseClass = drule({
  ...lightTheme.font.ui1.mid,
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

const activeChildClass = drule({});
const activeBlockClass = drule({
  cur: 'default',
  bg: 'rgba(0,128,255,.04)',
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
  const link = styles.col.get('link', 'solid-1');
  const baseCls = baseClass({
    col: styles.g(0, 0.9),
    '&:hover': {
      bg: styles.g(0.96),
      col: styles.light ? '#000' : '#fff',
    },
  });
  const activeChildCls = activeChild ? ' ' + activeChildClass({bg: styles.g(0, 0.01)}) : '';
  const activeBlockCls = active ? ' ' + activeBlockClass({col: link}) : '';

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
      className={baseCls + activeChildCls + activeBlockCls}
    >
      {element}
    </Link>
  );
};
