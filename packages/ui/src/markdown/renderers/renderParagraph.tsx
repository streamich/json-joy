import * as React from 'react';
import type {RenderNode} from '../types';
import isFirstLevelBlockElement from '../util/isFirstLevelBlockElement';
import UrlBlock from '../block/Url';
import Paragraph from '../block/Paragraph';
import renderImage from './renderImage';

const renderParagraph: RenderNode = (renderers, ast, idx, props, state) => {
  const node = ast.nodes[idx];

  if (!node.children) return null;

  const isSingleChild = node.children.length === 1;

  if (isSingleChild) {
    const child = ast.nodes[node.children[0]];
    const isImage = child.type === 'image' || child.type === 'imageReference';
    if (isImage) {
      return renderImage(renderers, ast, child.idx, props, state);
    }
  }

  const isFirstLevelBlock = isFirstLevelBlockElement(node, ast);

  const renderParagraph = () => {
    return <Paragraph idx={idx}>{renderers.children(renderers, ast, idx, props, state)}</Paragraph>;
  };

  const isSingleInlineLinkParagraph = isSingleChild && ast.nodes[node.children[0]].type === 'inlineLink';
  if (isFirstLevelBlock && isSingleInlineLinkParagraph) {
    const url = ast.nodes[node.children[0]].value;
    return <UrlBlock idx={idx} url={url} renderVoid={renderParagraph} />;
  }

  return renderParagraph();
};

export default renderParagraph;
