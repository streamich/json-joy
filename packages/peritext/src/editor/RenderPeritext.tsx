import * as React from 'react';
import {Chrome} from './components/Chrome';
import {context} from './context';
import {EditorState} from './state';
import type {PeritextSurfaceState} from '../web/state';
import type {EditorPluginOpts} from './EditorPlugin';

export interface RenderPeritextProps {
  surface: PeritextSurfaceState;
  children: React.ReactNode;
  opts: EditorPluginOpts;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({surface, opts, children}) => {
  const value: EditorState = React.useMemo(
    () => new EditorState(surface, opts),
    [surface, opts],
  );

  React.useLayoutEffect(() => value.start(), [value]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
