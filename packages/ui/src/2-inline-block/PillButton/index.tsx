import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Link, type LinkProps} from '../../1-inline/Link';

const blockClass = drule({
  ...lightTheme.font.ui2.bold,
  fz: '15.6px',
  pd: '6px 12px',
  mr: '0 2px',
  bdrad: '16px',
  bg: 'transparent',
  bd: 0,
  td: 'none',
  trs: 'background .2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
});

const activeClass = drule({});

export interface PillButtonProps extends LinkProps {
  active?: boolean;
  children?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({active, children, ...rest}) => {
  const styles = useStyles();
  // const link = styles.accent.fg + '';
  const link = 'var(--colTxtActive)';
  // const linkBg = styles.accent.fg.pct(0, 0.3, 0.92) + '';
  const linkBg = 'var(--colBgActive)';
  const block = blockClass({
    col: styles.g(0.1, 0.9),
    svg: {fill: styles.g(0.4)},
    '&:hover': {
      td: 'none',
      bg: styles.g(0.12, 0.04),
      col: styles.g(0),
      svg: {fill: styles.g(0)},
    },
  });
  const cls = active
    ? block +
      ' ' +
      activeClass({
        col: link,
        bg: linkBg,
        svg: {fill: link},
        '&:hover': {
          bg: linkBg,
          col: link,
          svg: {fill: link},
          transform: 'scale(1)',
        },
      })
    : block;

  return (
    <Link className={cls} {...rest}>
      {children}
    </Link>
  );
};
