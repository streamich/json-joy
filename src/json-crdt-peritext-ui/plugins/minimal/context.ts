import * as React from 'react';
import type {PeritextSurfaceState} from '../../web';
import type {ValueSyncStore} from '../../../util/events/sync-store';

export interface MinimalPluginContextValue {
  ctx: PeritextSurfaceState;

  /** Current score. */
  score: ValueSyncStore<number>;

  /** By how much the score changed. */
  scoreDelta: ValueSyncStore<number>;

  /** The last score that was shown to the user. */
  lastVisScore: ValueSyncStore<number>;
}

export const context = React.createContext<MinimalPluginContextValue>(null!);

export const usePlugin = () => React.useContext(context);
