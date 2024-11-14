import * as React from 'react';
import {context, type CursorPluginContextValue} from './context';
import {ValueSyncStore} from '../../../util/events/sync-store';
import type {ChangeDetail} from '../../events/types';
import type {PeritextSurfaceContextValue, PeritextViewProps} from '../../react';
import type {CursorPlugin} from './CursorPlugin';

export interface RenderPeritextProps extends PeritextViewProps {
  ctx?: PeritextSurfaceContextValue;
  plugin: CursorPlugin;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({ctx, plugin, children}) => {
  // biome-ignore lint: explicit dependency handling
  const value: CursorPluginContextValue = React.useMemo(
    () => ({
      ctx,
      plugin,
      score: new ValueSyncStore(0),
      scoreDelta: new ValueSyncStore(0),
      lastVisScore: new ValueSyncStore(0),
    }),
    [ctx],
  );

  React.useEffect(() => {
    const dom = ctx?.dom;
    if (!dom || !value) return;
    let lastNow: number = 0;
    const listener = (event: CustomEvent<ChangeDetail>) => {
      const now = Date.now();
      const timeDiff = now - lastNow;
      let delta = 0;
      switch (event.detail.ev?.type) {
        case 'delete':
        case 'insert':
        case 'format':
        case 'marker': {
          delta = timeDiff < 30 ? 10 : timeDiff < 70 ? 5 : timeDiff < 150 ? 2 : timeDiff <= 1000 ? 1 : -1;
          break;
        }
        default: {
          delta = timeDiff <= 1000 ? 0 : -1;
          break;
        }
      }
      if (delta) value.score.next(delta >= 0 ? value.score.value + delta : 0);
      value.scoreDelta.next(delta);
      lastNow = now;
    };
    dom.et.addEventListener('change', listener);
    return () => {
      dom.et.removeEventListener('change', listener);
    };
  }, [ctx?.dom, value]);

  return <context.Provider value={value}>{children}</context.Provider>;
};
