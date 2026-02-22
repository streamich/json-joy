import * as React from 'react';
import type {RenderNode} from '../types';
import Img from '../block/Img';
import MarkdownBlock from '../util/MarkdownBlock';
import isFirstLevelBlockElement from '../util/isFirstLevelBlockElement';
import MarkdownFullWidthBlock from '../util/MarkdownFullWidthBlock';

const renderImage: RenderNode = (renderers, flat, idx, props) => {
  const node = flat.nodes[idx] as any;
  const parent = flat.nodes[node.parent];

  let {url, title} = node;

  if (node.type === 'imageReference') {
    const definition = flat.nodes[flat.definitions[node.identifier]] as any;
    if (definition) {
      url = definition.url;
      title = definition.title;
    }
  }

  const isOnlyParagraphNode = parent.type === 'paragraph' && parent.children.length === 1;

  if (isOnlyParagraphNode) {
    const element = (
      <MarkdownBlock idx={idx}>
        <Img src={url} title={title} alt={node.alt || title} />
      </MarkdownBlock>
    );
    const doCenterAsTopLevelBlock = props.isFullWidth && isFirstLevelBlockElement(flat.nodes[idx], flat);
    return doCenterAsTopLevelBlock ? <MarkdownFullWidthBlock>{element}</MarkdownFullWidthBlock> : element;
  }

  return <img src={url} title={title} alt={node.alt || title} style={{maxWidth: '100%'}} />;
};

export default renderImage;
