// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {CommonSliceType} from '../../../json-crdt-extensions';
import {Blockquote} from './Blockquote';
import type {BlockViewProps} from '../../web/react/BlockView';

export interface RenderBlockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const {block, children} = props;
  const tag = block.tag();
  switch (tag) {
    case '':
      return children;
    case CommonSliceType.blockquote: {
      return <Blockquote {...props} />;
    }
    default: {
      return <p style={{padding: '16px 0'}}>{children}</p>;
    }
  }
};
