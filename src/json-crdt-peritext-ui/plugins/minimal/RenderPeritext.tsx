// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Chrome} from './Chrome';
import {context, type MinimalPluginContextValue} from './context';
import {ValueSyncStore} from '../../../util/events/sync-store';
import {ChangeDetail} from '../../events/types';
import type {PeritextSurfaceContextValue, PeritextViewProps} from '../../react';

export interface RenderPeritextProps extends PeritextViewProps {
  ctx?: PeritextSurfaceContextValue;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({ctx, children}) => {
  const value: MinimalPluginContextValue = React.useMemo(() => ({
    ctx,
    score: new ValueSyncStore(0),
    scoreDelta: new ValueSyncStore(0),
    lastVisScore: new ValueSyncStore(0),
  }), [ctx]);
  React.useEffect(() => {
    const dom = ctx?.dom;
    if (!dom || !value) return;
    let lastNow: number = 0;
    const listener = (event: CustomEvent<ChangeDetail>) => {
      switch (event.detail.ev?.type) {
        case 'delete':
        case 'insert':
        case 'format':
        case 'marker':
          const now = Date.now();
          const timeDiff = now - lastNow;
          const delta = timeDiff < 30 ? 10 : timeDiff < 70 ? 5 : timeDiff < 150 ? 2 : timeDiff <= 1000 ? 1 : 0;
          value.score.next(delta ? value.score.value + delta : 0);
          value.scoreDelta.next(delta);
          lastNow = now;
      }
    };
    dom.et.addEventListener('change', listener);
    return () => {
      dom.et.removeEventListener('change', listener);
    };
  }, [ctx?.dom, value]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
