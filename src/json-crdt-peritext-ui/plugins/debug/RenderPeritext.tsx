import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {context} from './context';
import {Button} from '../../components/Button';
import {Console} from './Console';
import {ValueSyncStore} from '../../../util/events/sync-store';
import type {PeritextSurfaceState, PeritextViewProps} from '../../react';

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

export interface RenderPeritextProps extends PeritextViewProps {
  enabled?: boolean;
  children?: React.ReactNode;
  ctx?: PeritextSurfaceState;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({enabled: enabledProp = true, ctx, children}) => {
  const theme = useTheme();
  const [enabled, setEnabled] = React.useState(enabledProp);
  const value = React.useMemo(
    () => ({
      enabled,
      ctx,
      flags: {
        dom: new ValueSyncStore(true),
        editor: new ValueSyncStore(true),
        peritext: new ValueSyncStore(false),
        model: new ValueSyncStore(false),
      },
    }),
    [enabled, ctx],
  );

  return (
    <context.Provider value={value}>
      <div className={blockClass}>
        <div
          className={btnClass({
            bg: theme.bg,
          })}
        >
          <Button small active={enabled} onClick={() => setEnabled((x) => !x)}>
            Debug
          </Button>
        </div>
        <div className={enabled ? childrenDebugClass : undefined}>{children}</div>
        {enabled && <Console />}
      </div>
    </context.Provider>
  );
};
