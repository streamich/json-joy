import * as React from 'react';
import {Chrome} from './Chrome';
import {context, type ToolbarPluginContextValue} from './context';
import {ToolbarState} from './state';
import type {PeritextSurfaceState, PeritextViewProps} from '../../react';

export interface RenderPeritextProps extends PeritextViewProps {
  surface?: PeritextSurfaceState;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({surface, children}) => {
  const value: null | ToolbarPluginContextValue = React.useMemo(() => !surface ? null : ({surface, toolbar: new ToolbarState()}), [surface]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
