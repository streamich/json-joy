import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {context} from './context';
import {Button} from '../../components/Button';
import {Console} from './Console';
import {ValueSyncStore} from '../../../util/events/sync-store';
import type {PeritextSurfaceState, PeritextViewProps} from '../../react';
import {useSyncStore} from '../../react/hooks';

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
  enabled?: boolean | ValueSyncStore<boolean>;
  button?: boolean;
  children?: React.ReactNode;
  ctx?: PeritextSurfaceState;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({enabled: enabledProp = false, ctx, button, children}) => {
  const theme = useTheme();
  const enabled = React.useMemo(() => new ValueSyncStore<boolean>(true), []);
  useSyncStore(enabled);
  React.useEffect(() => {
    if (typeof enabledProp === 'boolean') {
      enabled.next(enabledProp);
      return () => {};
    }
    enabled.next(enabledProp.value);
    const unsubscribe = enabledProp.subscribe(() => {
      enabled.next(enabledProp.value);
    });
    return () => unsubscribe();
  }, [enabledProp]);
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
      <div className={blockClass} onKeyDown={(event) => {
        switch (event.key) {
          case 'D': {
            if (event.ctrlKey) {
              event.preventDefault();
              enabled.next(!enabled.getSnapshot());
            }
            break;
          }
        }
      }}>
        {!!button && (
          <div
            className={btnClass({
              bg: theme.bg,
            })}
          >
            <Button small active={enabled.getSnapshot()} onClick={() => enabled.next(!enabled.getSnapshot())}>
              Debug
            </Button>
          </div>
        )}
        <div className={enabled.getSnapshot() ? childrenDebugClass : undefined}>{children}</div>
        {enabled.getSnapshot() && <Console />}
      </div>
    </context.Provider>
  );
};
