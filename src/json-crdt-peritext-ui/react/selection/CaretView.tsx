import type * as React from 'react';
import {usePeritext} from '../context';
import {Caret} from './Caret';

export interface CaretViewProps {
  italic?: boolean;
}

export const CaretView: React.FC<CaretViewProps> = (props) => {
  const {renderers} = usePeritext();

  let children: React.ReactNode = <Caret />;
  for (const map of renderers) children = map.caret?.(props, children) ?? children;
  return children;
};
