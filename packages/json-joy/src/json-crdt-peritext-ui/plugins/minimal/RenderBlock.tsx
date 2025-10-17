import * as React from 'react';
import type {BlockViewProps} from '../../web/react/BlockView';
import {CommonSliceType} from '../../../json-crdt-extensions';

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
