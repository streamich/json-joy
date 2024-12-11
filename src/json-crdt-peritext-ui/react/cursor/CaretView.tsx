// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {usePeritext} from '../context';
import {Caret} from './Caret';

export interface CaretViewProps {
  italic?: boolean;
}

export const CaretView: React.FC<CaretViewProps> = (props) => {
  const {plugins} = usePeritext();

  let children: React.ReactNode = <Caret />;
  for (const map of plugins) children = map.caret?.(props, children) ?? children;
  return children;
};
