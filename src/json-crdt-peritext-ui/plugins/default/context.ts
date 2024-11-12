import * as React from 'react';
import type {PeritextSurfaceContextValue} from '../../react';

export interface DefaultPluginContextValue {
  ctx?: PeritextSurfaceContextValue;
}

export const context = React.createContext<DefaultPluginContextValue>(null!);

export const useDefaultPlugin = () => React.useContext(context);
