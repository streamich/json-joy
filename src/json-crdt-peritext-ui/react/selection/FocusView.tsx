import * as React from 'react';
import {usePeritext} from '../context';
import {Caret} from './Caret';

export interface FocusViewProps {
  left?: boolean;
}

export const FocusView: React.FC<FocusViewProps> = (props) => {
  const {renderers} = usePeritext();

  let children: React.ReactNode = <Caret />;
  for (const map of renderers) children = map.focus?.(props, children) ?? children;
  return children;
};
