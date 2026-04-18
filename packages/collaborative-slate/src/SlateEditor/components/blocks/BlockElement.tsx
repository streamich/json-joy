import * as React from 'react';
import type {RenderElementProps} from 'slate-react';
import type {CustomElement} from '../../types';
import {ParagraphElement} from './ParagraphElement';
import {HeadingElement} from './HeadingElement';
import {BlockquoteElement} from './BlockquoteElement';
import {CodeBlockElement} from './CodeBlockElement';
import {ListContainerElement, ListItemElement} from './ListElement';

export interface BlockElementProps extends RenderElementProps {
  element: CustomElement;
}

export const BlockElement: React.FC<BlockElementProps> = (props) => {
  switch (props.element.type) {
    case 'heading-one':
    case 'heading-two':
    case 'heading-three':
      return <HeadingElement {...(props as RenderElementProps & {element: any})} />;
    case 'blockquote':
      return <BlockquoteElement {...(props as RenderElementProps & {element: any})} />;
    case 'code-block':
      return <CodeBlockElement {...(props as RenderElementProps & {element: any})} />;
    case 'bulleted-list':
    case 'numbered-list':
      return <ListContainerElement {...(props as RenderElementProps & {element: any})} />;
    case 'list-item':
      return <ListItemElement {...(props as RenderElementProps & {element: any})} />;
    default:
      return <ParagraphElement {...(props as RenderElementProps & {element: any})} />;
  }
};