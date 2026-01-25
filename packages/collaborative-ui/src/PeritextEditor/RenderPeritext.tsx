import * as React from 'react';
import {Chrome} from './Chrome';
import {context, type ToolbarPluginContextValue} from './context';
import {ToolbarState} from './state';
import type {PeritextSurfaceState} from '../PeritextWebUi/state';
import type {ToolbarPluginOpts} from './ToolbarPlugin';

export interface RenderPeritextProps {
  surface: PeritextSurfaceState;
  children: React.ReactNode;
  opts: ToolbarPluginOpts;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({surface, opts, children}) => {
  const value: ToolbarPluginContextValue = React.useMemo(
    () => ({surface, toolbar: new ToolbarState(surface, opts)}),
    [surface, opts],
  );
  const toolbar = value.toolbar;

  React.useLayoutEffect(() => toolbar.start(), [toolbar]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
