import * as React from 'react';
import type {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import type {PeritextSurfaceState} from '../../state';
import type {DebugState} from './state';

export interface DebugRenderersContextValue {
  state: DebugState;
  flags: {
    dom: ValueSyncStore<boolean>;
    editor: ValueSyncStore<boolean>;
    peritext: ValueSyncStore<boolean>;
    model: ValueSyncStore<boolean>;
  };
  ctx: PeritextSurfaceState;
}

export const context = React.createContext<DebugRenderersContextValue>(null!);

export const useDebugCtx = () => React.useContext(context);
