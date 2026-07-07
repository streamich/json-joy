import * as React from 'react';
import type {Value} from 'thingies/lib/sync';
import type {PeritextSurfaceState} from '../../web/state';
import type {DebugState} from './state';

export interface DebugRenderersContextValue {
  state: DebugState;
  flags: {
    dom: Value<boolean>;
    editor: Value<boolean>;
    peritext: Value<boolean>;
    model: Value<boolean>;
  };
  ctx: PeritextSurfaceState;
}

export const context = React.createContext<DebugRenderersContextValue>(null!);

export const useDebugCtx = () => React.useContext(context);
