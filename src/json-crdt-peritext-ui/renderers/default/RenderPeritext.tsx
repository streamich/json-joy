import * as React from 'react';
import {Chrome} from './Chrome';
import type {PeritextSurfaceContextValue, PeritextViewProps} from '../../react';

export interface RenderPeritextProps extends PeritextViewProps {
  ctx?: PeritextSurfaceContextValue;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({children}) => {
  return (
    <Chrome>
      {children}
    </Chrome>
  );
};
