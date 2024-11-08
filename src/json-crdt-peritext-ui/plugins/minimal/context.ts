import * as React from 'react';
import type {PeritextSurfaceContextValue} from '../../react';

export interface DebugRenderersContextValue {
  ctx?: PeritextSurfaceContextValue;
}

export const context = React.createContext<DebugRenderersContextValue>({});

export const useDefaultCtx = () => React.useContext(context);
