import * as React from 'react';
import type {PeritextSurfaceContextValue} from '../../react';
import type {ValueSyncStore} from '../../../util/events/sync-store';

export interface MinimalPluginContextValue {
  ctx?: PeritextSurfaceContextValue;
  score: ValueSyncStore<number>;
}

export const context = React.createContext<MinimalPluginContextValue>(null!);

export const usePlugin = () => React.useContext(context);
