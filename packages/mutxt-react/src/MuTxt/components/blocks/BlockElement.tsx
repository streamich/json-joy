import * as React from 'react';
import type {RenderElementProps} from 'slate-react';
import type {CustomElement} from '../../types';
import {ParagraphElement} from './ParagraphElement';
import {HeadingElement} from './HeadingElement';
import {BlockquoteElement} from './BlockquoteElement';
import {CalloutElement} from './callout/CalloutElement';
import {CodeBlock} from './code-block/CodeBlock';
import {PreformattedElement} from './PreformattedElement';
import {EmbedElement} from './EmbedElement';
import {HrElement} from './hr/HrElement';
import {ListContainerElement, ListItemElement} from './ListElement';
import {TwoColumnsElement} from './TwoColumnsElement';
import {FileElement} from './file/FileElement';
import {TocElement} from './toc/TocElement';
import {MathElement} from './math/MathElement';
import {MathInlineElement} from './math/MathInlineElement';

export interface BlockElementProps extends RenderElementProps {
  element: CustomElement;
}

export const BlockElement: React.FC<BlockElementProps> = (props) => {
  switch (props.element.type) {
    case 'columns':
      return <TwoColumnsElement {...(props as RenderElementProps & {element: any})} />;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
    case 'title':
    case 'subtitle':
      return <HeadingElement {...(props as RenderElementProps & {element: any})} />;
    case 'blockquote':
      return <BlockquoteElement {...(props as RenderElementProps & {element: any})} />;
    case 'callout':
      return <CalloutElement {...(props as RenderElementProps & {element: any})} />;
    case 'code-block':
      return <CodeBlock {...(props as RenderElementProps & {element: any})} />;
    case 'pre':
      return <PreformattedElement {...(props as RenderElementProps & {element: any})} />;
    case 'embed':
      return <EmbedElement {...(props as RenderElementProps & {element: any})} />;
    case 'hr':
      return <HrElement {...(props as RenderElementProps & {element: any})} />;
    case 'file':
      return <FileElement {...(props as RenderElementProps & {element: any})} />;
    case 'toc':
      return <TocElement {...(props as RenderElementProps & {element: any})} />;
    case 'math':
      return <MathElement {...(props as RenderElementProps & {element: any})} />;
    case 'math-inline':
      return <MathInlineElement {...(props as RenderElementProps & {element: any})} />;
    case 'ul':
    case 'ol':
    case 'checklist':
    case 'stepper':
      return <ListContainerElement {...(props as RenderElementProps & {element: any})} />;
    case 'li':
      return <ListItemElement {...(props as RenderElementProps & {element: any})} />;
    default:
      return <ParagraphElement {...(props as RenderElementProps & {element: any})} />;
  }
};
