import * as React from 'react';
import type {ValueSyncStore} from '../../../util/events/sync-store';
import type {PeritextSurfaceContextValue} from '../../react';

export interface DebugRenderersContextValue {
  enabled: boolean;
  flags: {
    dom: ValueSyncStore<boolean>;
    editor: ValueSyncStore<boolean>;
    peritext: ValueSyncStore<boolean>;
    model: ValueSyncStore<boolean>;
  };
  ctx?: PeritextSurfaceContextValue;
}

export const context = React.createContext<DebugRenderersContextValue>(null!);

export const useDebugCtx = () => React.useContext(context);
