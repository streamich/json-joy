import * as React from 'react';
import {usePeritext} from '../context';
import {Caret} from './Caret';
import type {Cursor} from 'json-joy/lib/json-crdt-extensions/peritext/editor/Cursor';

export interface FocusViewProps {
  left?: boolean;
  italic?: boolean;
  cursor: Cursor<string>;
}

export const FocusView: React.FC<FocusViewProps> = (props) => {
  const {plugins} = usePeritext();

  let children: React.ReactNode = <Caret />;
  for (const plugin of plugins) children = plugin.focus?.(props, children) ?? children;
  return children;
};
