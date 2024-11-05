import {rule} from 'nano-theme';
import * as React from 'react';
import {TopToolbar} from '../TopToolbar';

const blockClass = rule({
  bg: 'white',
  bxz: 'border-box',
  bdrad: '16px',
  pad: '24px 32px',
  bxsh: '0 1px 8px #00000005, 0 1px 4px #00000008, 0 4px 10px #0000000a',
});

export interface ChromeProps {
  children: React.ReactNode;
}

export const Chrome: React.FC<ChromeProps> = ({children}) => {
  return (
    <div className={blockClass}>
      <TopToolbar />
      {children}
    </div>
  );
};