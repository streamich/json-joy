import * as React from 'react';
import {rule} from 'nano-theme';
import {useDebugCtx} from '../context';

const consoleClass = rule({
  bg: '#fafafa',
  fz: '8px',
  pad: '8px 16px',
  bxz: 'border-box',
});

export interface ConsoleProps {}

export const Console: React.FC<ConsoleProps> = () => {
  const {ctx} = useDebugCtx();

  if (!ctx) return null;

  return (
    <div className={consoleClass}>
      {!!ctx && <pre>{ctx.dom + ''}</pre>}
      <pre>{ctx.peritext.editor + ''}</pre>
      <pre>{ctx.peritext + ''}</pre>
    </div>
  );
};
