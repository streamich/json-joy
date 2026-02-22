import * as React from 'react';
import {theme, rule, makeRule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.ui1.mid,
  d: 'inline-flex',
  b: 0,
  mar: 0,
  bd: 0,
  justifyContent: 'space-between',
  alignItems: 'center',
  bxz: 'border-box',
  pad: '.3em .5em',
  bdrad: '.7em',
  '&+&': {
    marl: '8px',
  },
});

const useBlockClass = makeRule((theme) => ({
  col: theme.g(0.25),
  bg: theme.g(0.96),
  boxShadow: theme.isLight ? 'none' : `0 0 0 1px ${theme.g(0.1, 0.16)}`,
  '&:hover': {
    col: theme.g(0.25),
    bg: theme.g(0.92),
    boxShadow: theme.isLight ? 'none' : `0 0 0 1px ${theme.g(0.1, 0.24)}`,
  },
}));

export interface LabelProps {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({children}) => {
  const dynamicBlockClass = useBlockClass();

  return <span className={blockClass + dynamicBlockClass}>{children}</span>;
};
