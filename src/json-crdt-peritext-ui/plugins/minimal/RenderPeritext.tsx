// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Chrome} from './Chrome';
import {context, type MinimalPluginContextValue} from './context';
import {ValueSyncStore} from '../../../util/events/sync-store';
import type {PeritextSurfaceContextValue, PeritextViewProps} from '../../react';

export interface RenderPeritextProps extends PeritextViewProps {
  ctx?: PeritextSurfaceContextValue;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({ctx, children}) => {
  const value: MinimalPluginContextValue = React.useMemo(() => ({
    ctx,
    score: new ValueSyncStore(0),
  }), [ctx]);
  React.useEffect(() => {
    const dom = ctx?.dom;
    if (!dom || !value) return;
    let lastNow: number = 0;
    const listener = () => {
      const now = Date.now();
      value.score.next(now - lastNow > 1000 ? 1 : value.score.value + 1);
      lastNow = now;
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
