import * as React from 'react';
import {rule} from 'nano-theme';
import {TopToolbar} from './TopToolbar';
import {useToolbarPlugin} from '../context';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';

const blockClass = rule({
  bg: 'white',
  bxz: 'border-box',
  bdrad: '16px',
  mr: '0 auto',
  pd: '24px 32px',
  maxW: '900px',
  // bxsh: '0 1px 8px #00000008,0 1px 4px #0000000a,0 4px 10px #0000000f',
  // '&:hover': {
  //   bxsh: '0 1px 8px #00000008,0 1px 4px #0000000a,0 4px 10px #0000000f,0 0 3px #0000001f',
  // },
});

export interface ChromeProps {
  children: React.ReactNode;
}

export const Chrome: React.FC<ChromeProps> = ({children}) => {
  const styles = useStyles();
  const ctx = useToolbarPlugin();

  const style: React.CSSProperties = {
    border: '1px solid ' + styles.g(0.9),
  };

  return (
    <div className={blockClass} style={style}>
      {!!ctx && <TopToolbar ctx={ctx.surface} />}
      {children}
    </div>
  );
};
