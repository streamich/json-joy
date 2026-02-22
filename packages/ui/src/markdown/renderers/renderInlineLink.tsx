import * as React from 'react';
import type {RenderNode} from '../types';

const renderInlineLink: RenderNode = (renderers, flat, idx) => {
  const node = flat.nodes[idx];
  const url = node.value;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {url}
    </a>
  );
};

export default renderInlineLink;
