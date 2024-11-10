import * as React from 'react';
import type {PeritextSurfaceContextValue} from '../../react';

export interface DebugRenderersContextValue {
  enabled: boolean;
  ctx?: PeritextSurfaceContextValue;
}

export const context = React.createContext<DebugRenderersContextValue>({
  enabled: true,
});

export const useDebugCtx = () => React.useContext(context);
