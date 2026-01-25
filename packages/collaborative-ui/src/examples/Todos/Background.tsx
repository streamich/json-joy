import * as React from 'react';
import {rule} from 'nano-theme';

const css = {
  input: rule({
    bg: 'rgba(127,127,127,.08)',
    bd: '0',
    w: '100%',
    d: 'block',
    bxz: 'border-box',
    pd: '12px',
    bdrad: '8px',
    '&+&': {
      mart: '8px',
    },
  }),
};

export interface BackgroundProps {
  children: React.ReactNode;
}

export const Background: React.FC<BackgroundProps> = ({children}) => {
  return <div className={css.input}>{children}</div>;
};
