import * as React from 'react';
import {usePeritext} from '../context';
import {Caret} from './Caret';
import type {Cursor} from 'json-joy/lib/json-crdt-extensions/peritext/editor/Cursor';
import type {Point} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Point';
import type {Inline} from 'json-joy/lib/json-crdt-extensions';

export interface CaretViewProps {
  italic?: boolean;
  point: Point<string>;
  cursor: Cursor<string>;

  /** Inline text slice followed after the cursor. */
  fwd?: Inline<string>;

  /** Inline text slice followed before the cursor. */
  bwd?: Inline<string>;
}

export const CaretView: React.FC<CaretViewProps> = (props) => {
  const {plugins} = usePeritext();

  let children: React.ReactNode = <Caret />;
  for (const plugin of plugins) children = plugin.caret?.(props, children) ?? children;
  return children;
};
