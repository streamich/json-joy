// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule, theme} from 'nano-theme';

const labelClass = rule({
  ...theme.font.mono.bold,
  d: 'flex',
  ai: 'center',
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
  d: 'flex',
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
  small?: boolean;
  children?: React.ReactNode;
}

export const DebugLabel: React.FC<DebugLabelProps> = ({right, small, children}) => {
  const style = small ? {fontSize: '7px', lineHeight: '10px', height: '10px', padding: '0 2px'} : void 0;

  return (
    <span className={labelClass} style={style}>
      {children}
      {!!right && <span className={labelSecondClass}>{right}</span>}
    </span>
  );
};
