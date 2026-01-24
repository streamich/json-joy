import * as React from 'react';
import {rule, theme, useTheme} from 'nano-theme';
import {fonts} from '../../styles';

const keyClass = rule({
  ...fonts.get('mono', 'bold'),
  mar: '0 .1em',
  pad: '.3em calc(.7em - 2px) .3em .7em',
  bg: theme.g(0.2),
  bdt: `1px solid ${theme.g(0.3)}`,
  bdb: `2px solid ${theme.g(0)}`,
  bdr: `2px solid ${theme.g(0.1)}`,
  bdrad: '.25em',
  lh: '1em',
  fz: '.7em',
  ws: 'nowrap',
  bxsh: '0 0 .125em rgba(0,0,0,.5),0 .065em .19em rgba(0,0,0,.5),.065em 0 .125em rgba(0,0,0,.2)',
  col: '#fff',
});

export interface KeyProps {
  children: React.ReactNode;
}

export const Key: React.FC<KeyProps> = ({children}) => {
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
