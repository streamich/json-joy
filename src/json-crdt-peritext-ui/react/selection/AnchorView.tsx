// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {usePeritext} from '../context';

// biome-ignore lint: empty interface is expected
export type AnchorViewProps = {};

export const AnchorView: React.FC<AnchorViewProps> = (props) => {
  const {renderers} = usePeritext();

  let children: React.ReactNode = null;
  for (const map of renderers) children = map.anchor?.(props, children) ?? children;
  return children;
};
