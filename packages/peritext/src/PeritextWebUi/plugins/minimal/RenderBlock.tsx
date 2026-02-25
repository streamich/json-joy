import * as React from 'react';
import {CommonSliceType} from 'json-joy/lib/json-crdt-extensions';
import type {BlockViewProps} from '../../react/BlockView';

export interface RenderBlockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = ({block, children}) => {
  const tag = block.tag();
  switch (tag) {
    case '':
      return children;
    case CommonSliceType.blockquote: {
      return <blockquote>{children}</blockquote>;
    }
    default: {
      return <div style={{padding: '16px 0'}}>{children}</div>;
    }
  }
};
