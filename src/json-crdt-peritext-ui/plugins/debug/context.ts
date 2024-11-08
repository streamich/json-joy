import * as React from 'react';

export interface DebugRenderersContextValue {
  enabled: boolean;
}

export const context = React.createContext<DebugRenderersContextValue>({
  enabled: true,
});

export const useDebugCtx = () => React.useContext(context);
