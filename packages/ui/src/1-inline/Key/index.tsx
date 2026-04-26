import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {fonts} from '../../styles';

const keyClass = rule({
  ...fonts.get('mono', 'bold', 0),
  d: 'inline-block',
  mr: '0 .1em',
  pd: '.4em .6em',
  bdrad: '.3em',
  lh: '1em',
  fz: '.75em',
  ws: 'pre',
  va: 'middle',
});

export interface KeyProps {
  children: React.ReactNode;
}

export const Key: React.FC<KeyProps> = ({children}) => {
  const theme = useTheme();

  const style: React.CSSProperties = {
    color: theme.g(0),
    background: theme.g(0.96),
    border: `1px solid ${theme.g(0.8)}`,
    borderBottom: `2px solid ${theme.g(0.6)}`,
    boxShadow: `0 1px 2px ${theme.g(0.2, 0.1)}`,
  };

  return (
    <kbd className={keyClass} style={style}>
      {children}
    </kbd>
  );
};
