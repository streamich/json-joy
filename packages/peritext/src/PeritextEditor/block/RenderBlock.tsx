import * as React from 'react';
import {LeafBlockFrame} from './LeafBlockFrame';
import {CommonSliceType} from 'json-joy/lib/json-crdt-extensions';
import {Blockquote} from './blocks/Blockquote';
import {Codeblock} from './blocks/Codeblock';
import type {BlockViewProps} from '../../PeritextWebUi/react/BlockView';

export interface RenderBlockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const {block, children} = props;

  let element: React.ReactNode = children;

  const tag = block.tag();

  switch (tag) {
    case '':
      break;
    case CommonSliceType.p:
      element = <p>{element}</p>;
      break;
    case CommonSliceType.codeblock:
      element = <Codeblock {...props} />;
      break;
    case CommonSliceType.blockquote:
      element = <Blockquote {...props} />;
      break;
    case CommonSliceType.h1:
      element = <h1>{element}</h1>;
      break;
    case CommonSliceType.h2:
      element = <h2>{element}</h2>;
      break;
    case CommonSliceType.h3:
      element = <h3>{element}</h3>;
      break;
    case CommonSliceType.h4:
      element = <h4>{element}</h4>;
      break;
    case CommonSliceType.h5:
      element = <h5>{element}</h5>;
      break;
    case CommonSliceType.h6:
      element = <h6>{element}</h6>;
      break;
    case CommonSliceType.title:
      element = <h1>{element}</h1>;
      break;
    case CommonSliceType.subtitle:
      element = <h2>{element}</h2>;
      break;
  }

  if (block.isLeaf()) {
    element = <LeafBlockFrame {...props}>{children}</LeafBlockFrame>;
  }

  return element;
};
