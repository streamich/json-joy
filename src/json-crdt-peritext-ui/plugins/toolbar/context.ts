import * as React from 'react';
import type {ToolbarState} from './state';
import type {PeritextSurfaceState} from '../../web';

export interface ToolbarPluginContextValue {
  surface: PeritextSurfaceState;
  toolbar: ToolbarState;
}

export const context = React.createContext<ToolbarPluginContextValue>(null!);
export const useToolbarPlugin = () => React.useContext(context);
