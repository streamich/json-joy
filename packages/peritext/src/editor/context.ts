import * as React from 'react';
import type {EditorState} from './state';
import type {PeritextSurfaceState} from '../web/state';

export interface ToolbarPluginContextValue {
  surface: PeritextSurfaceState;
  toolbar: EditorState;
}

export const context = React.createContext<ToolbarPluginContextValue>(null!);
export const useToolbarPlugin = () => React.useContext(context);
