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
  const node = ast.nodes[idx];
  const type = node.type;

  if (type === 'heading') return <HeadingPlaceholder />;

  if (type === 'paragraph') {
    const isSingleImageParagraph = node.children.length === 1 && ast.nodes[node.children[0]].type === 'image';
    if (isSingleImageParagraph) return <ImagePlaceholder />;
    return <ParagraphPlaceholder />;
  }

  if (type === 'table') {
    return <TablePlaceholder columns={(node as any).align.length} />;
  }

  return <ParagraphPlaceholder />;
};

export default Placeholder;
