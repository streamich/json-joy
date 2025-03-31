// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {usePeritext} from '../context';
import {Caret} from './Caret';
import type {Point} from '../../../json-crdt-extensions/peritext/rga/Point';

export interface CaretViewProps {
  italic?: boolean;
  point: Point<string>;
}

export const CaretView: React.FC<CaretViewProps> = (props) => {
  const {plugins} = usePeritext();

  let children: React.ReactNode = <Caret />;
  for (const map of plugins) children = map.caret?.(props, children) ?? children;
  return children;
};
