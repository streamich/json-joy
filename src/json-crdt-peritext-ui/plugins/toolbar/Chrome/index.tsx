// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {TopToolbar} from '../TopToolbar';
import {useToolbarPlugin} from '../context';

const blockClass = rule({
  bg: 'white',
  bxz: 'border-box',
  bdrad: '16px',
  pad: '24px 32px',
  bxsh: '0 1px 8px #00000008,0 1px 4px #0000000a,0 4px 10px #0000000f',
  '&:hover': {
    bxsh: '0 1px 8px #00000008,0 1px 4px #0000000a,0 4px 10px #0000000f,0 0 3px #0000001f',
  },
});

export interface ChromeProps {
  children: React.ReactNode;
}

export const Chrome: React.FC<ChromeProps> = ({children}) => {
  const ctx = useToolbarPlugin();

  return (
    <div className={blockClass}>
      {!!ctx && <TopToolbar ctx={ctx.surface} />}
      {children}
    </div>
  );
};
