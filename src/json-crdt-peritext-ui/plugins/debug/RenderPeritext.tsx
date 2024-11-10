import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {context} from './context';
import {Button} from '../minimal/Button';
import {Console} from './Console';
import type {PeritextSurfaceContextValue, PeritextViewProps} from '../../react';

const blockClass = rule({
  pos: 'relative',
});

const btnClass = drule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pos: 'absolute',
  t: '-16px',
  r: 0,
  pd: '2px',
  bdrad: '8px',
  bxsh: '0 1px 8px #00000008,0 1px 4px #0000000a,0 4px 10px #0000000f',
});

const childrenDebugClass = rule({
  out: '1px dotted black !important',
});

const dumpClass = rule({
  bg: '#fafafa',
  fz: '8px',
  pad: '8px 16px',
  bxz: 'border-box',
});

export interface RenderPeritextProps extends PeritextViewProps {
  enabled?: boolean;
  children?: React.ReactNode;
  ctx?: PeritextSurfaceContextValue;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({
  enabled: enabledProp = true,
  peritext,
  ctx,
  children,
}) => {
  const theme = useTheme();
  const [enabled, setEnabled] = React.useState(enabledProp);

  return (
    <context.Provider value={{enabled, ctx}}>
      <div className={blockClass}>
        <div className={btnClass({
          bg: theme.bg,
        })}>
          <Button active={enabled} onClick={() => setEnabled((x) => !x)}>
            Debug
          </Button>
        </div>
        <div className={enabled ? childrenDebugClass : undefined}>{children}</div>
        {enabled && <Console />}
      </div>
    </context.Provider>
  );
};
