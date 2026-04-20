import * as React from 'react';
import ParagraphPlaceholder from './ParagraphPlaceholder';
import HeadingPlaceholder from './HeadingPlaceholder';
import ImagePlaceholder from './ImagePlaceholder';
import TablePlaceholder from './TablePlaceholder';
import {context} from '../context';

const {useContext} = React;

export interface Props {
  idx: number;
}

const Placeholder: React.FC<Props> = ({idx}) => {
  const {ast} = useContext(context);
  const node = ast.nodes[idx] as {type: string; children?: number[]; align?: unknown[]};
  const type = node.type;

  if (type === 'heading') return <HeadingPlaceholder />;

  if (type === 'paragraph') {
    const childIds = node.children ?? [];
    const isSingleImageParagraph = childIds.length === 1 && ast.nodes[childIds[0]]?.type === 'image';
    if (isSingleImageParagraph) return <ImagePlaceholder />;
    return <ParagraphPlaceholder />;
  }

  if (type === 'table') {
    return <TablePlaceholder columns={node.align?.length || 0} />;
  }

  return <ParagraphPlaceholder />;
};

export default Placeholder;
