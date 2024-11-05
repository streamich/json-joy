import * as React from 'react';
import {Chrome} from './Chrome';
import {context} from './context';
import type {PeritextSurfaceContextValue, PeritextViewProps} from '../../react';

export interface RenderPeritextProps extends PeritextViewProps {
  ctx?: PeritextSurfaceContextValue;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({ctx, children}) => {
  return (
    <context.Provider value={{ctx}}>
      <Chrome>
        {children}
      </Chrome>
    </context.Provider>
  );
};
