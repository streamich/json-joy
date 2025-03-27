// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule, theme} from 'nano-theme';

const labelClass = rule({
  ...theme.font.mono.bold,
  d: 'flex',
  
  fz: '9px',
  pd: '0 4px',
  mr: '-1px',
  bdrad: '10px',
  bg: 'rgba(0,0,0)',
  lh: '14px',
  h: '14px',
  col: 'white',
  bd: '1px solid #fff',
});

const labelSecondClass = rule({
  ...theme.font.mono.bold,
  d: 'inline-block',
  fz: '8px',
  mr: '2px -2px 2px 4px',
  pd: '0 4px',
  bdrad: '10px',
  bg: 'rgba(255,255,255)',
  lh: '10px',
  h: '10px',
  col: '#000',
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
