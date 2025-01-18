import * as React from 'react';
import {Chrome} from './Chrome';
import {context, type ToolbarPluginContextValue} from './context';
import {ToolbarState} from './state';
import type {PeritextSurfaceState, PeritextViewProps} from '../../react';

export interface RenderPeritextProps extends PeritextViewProps {
  surface: PeritextSurfaceState;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({surface, children}) => {
  const value: ToolbarPluginContextValue = React.useMemo(
    () => ({surface, toolbar: new ToolbarState(surface)}),
    [surface],
  );
  const toolbar = value.toolbar;

  React.useLayoutEffect(() => toolbar.start(), [toolbar]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
