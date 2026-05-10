import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Link, type LinkProps} from '../../1-inline/Link';

const blockClass = drule({
  ...lightTheme.font.ui2.bold,
  fz: '17.6px',
  pd: '9px 18px 8px',
  mr: '0 2px',
  bdrad: '16px',
  bg: 'transparent',
  bd: 0,
});

const activeClass = drule({});

export interface PillButtonProps extends LinkProps {
  active?: boolean;
  children?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({active, children, ...rest}) => {
  const styles = useStyles();
  const link = styles.col.get('link', 'solid-1');
  const block = blockClass({
    col: styles.g(0.4),
    svg: {fill: styles.g(0.4)},
    '&:hover': {
      col: styles.g(0),
      svg: {fill: styles.g(0)},
    },
  });
  const cls = active
    ? block +
      ' ' +
      activeClass({
        col: link,
        bg: 'rgba(0,128,255,.04)',
        svg: {fill: link},
        '&:hover': {
          col: link,
          svg: {fill: link},
        },
      })
    : block;
  return (
    <Link className={cls} {...rest}>
      {children}
    </Link>
  );
};
