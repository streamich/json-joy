import * as React from 'react';
import type {PeritextSurfaceState} from '../../web/react';
import type {ValueSyncStore} from '../../../util/events/sync-store';
import type {CursorPlugin} from './CursorPlugin';

export interface CursorPluginContextValue {
  ctx?: PeritextSurfaceState;

  plugin: CursorPlugin;

  /** Current score. */
  score: ValueSyncStore<number>;

  /** By how much the score changed. */
  scoreDelta: ValueSyncStore<number>;

  /** The last score that was shown to the user. */
  lastVisScore: ValueSyncStore<number>;
}

export const context = React.createContext<CursorPluginContextValue>(null!);

export const useCursorPlugin = () => React.useContext(context);
