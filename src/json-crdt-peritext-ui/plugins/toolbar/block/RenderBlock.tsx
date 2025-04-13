// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {LeafBlockFrame} from './LeafBlockFrame';
import type {BlockViewProps} from '../../../web/react/BlockView';

export interface RenderBlockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const {block, children} = props;

  let element: React.ReactNode = children;

  if (block.isLeaf()) {
    element = <LeafBlockFrame {...props}>{children}</LeafBlockFrame>;
  }

  return element;
};
