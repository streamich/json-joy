// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule, theme} from 'nano-theme';

const labelClass = rule({
  ...theme.font.mono.bold,
  fz: '9px',
  pd: '2px 2px 2px 5px',
  bdrad: '8px',
  bg: 'rgba(0,0,0)',
  lh: '8px',
  col: 'white',
  d: 'inline-block',
});

const labelSecondClass = rule({
  ...theme.font.mono.bold,
  fz: '9px',
  mr: '0 0 0 4px',
  pd: '2px 4px',
  bdrad: '8px',
  bg: 'rgba(255,255,255)',
  lh: '8px',
  col: '#000',
  d: 'inline-block',
});

export interface DebugLabelProps {
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export const DebugLabel: React.FC<DebugLabelProps> = ({right, children}) => {
  return (
    <span className={labelClass}>
      {children}
      {!!right && <span className={labelSecondClass}>{right}</span>}
    </span>
  );
};
