// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {usePeritext} from '../context';
import {Caret} from './Caret';

export interface FocusViewProps {
  left?: boolean;
  italic?: boolean;
}

export const FocusView: React.FC<FocusViewProps> = (props) => {
  const {plugins} = usePeritext();

  let children: React.ReactNode = <Caret />;
  for (const map of plugins) children = map.focus?.(props, children) ?? children;
  return children;
};
