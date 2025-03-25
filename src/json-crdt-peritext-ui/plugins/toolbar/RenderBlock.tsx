// biome-ignore lint: React is used for JSX
import * as React from 'react';
import type {BlockViewProps} from '../../react/BlockView';

export interface RenderBlockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = ({block, children}) => {
  const tag = block.tag();

  return children;
};
