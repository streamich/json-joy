import * as React from 'react';
import {context} from './context';
import {CursorState} from './state';
import type {PeritextSurfaceState} from '../../state';

export interface RenderPeritextProps {
  ctx: PeritextSurfaceState;
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({ctx, children}) => {
  const state = React.useMemo(() => new CursorState(ctx), [ctx]);
  React.useEffect(() => state.start(), [state]);

  return <context.Provider value={state}>{children}</context.Provider>;
};
