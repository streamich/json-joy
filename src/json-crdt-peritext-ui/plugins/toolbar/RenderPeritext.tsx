import * as React from 'react';
import {Chrome} from './Chrome';
import {context, type DefaultPluginContextValue} from './context';
import type {PeritextSurfaceContextValue, PeritextViewProps} from '../../react';

export interface RenderPeritextProps extends PeritextViewProps {
  ctx?: PeritextSurfaceContextValue;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({ctx, children}) => {
  const value: DefaultPluginContextValue = React.useMemo(() => ({ctx}), [ctx]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
