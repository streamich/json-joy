import * as React from 'react';
import {rule, theme, useTheme} from 'nano-theme';

const keyClass = rule({
  ...theme.font.mono,
  mar: '0 .1em',
  pad: '.3em .7em',
  bg: theme.g(0, 0.2),
  bdt: `1px solid ${theme.g(0, 0.3)}`,
  bdb: `1px solid ${theme.g(0, 0.0)}`,
  bdr: `1px solid ${theme.g(0, 0.1)}`,
  bdrad: '.25em',
  lh: '1em',
  fz: '.7em',
  whiteSpace: 'nowrap',
  boxShadow: '0 0 .125em rgba(0,0,0,.5),0 .065em .19em rgba(0,0,0,.5),.065em 0 .125em rgba(0,0,0,.2)',
  col: '#fff',
});

interface Props {
  children?: React.ReactNode;
}

const Key: React.FC<Props> = ({children}) => {
  const theme = useTheme();

  const style: React.CSSProperties = {};

  if (!theme.isLight) {
    style.boxShadow = `0 0 0 1px ${theme.g(0.1, 0.16)}`;
  }

  return (
    <kbd className={keyClass} style={style}>
      {children}
    </kbd>
  );
};

export default Key;
