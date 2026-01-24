import * as React from 'react';
import type {RenderNode} from '../types';

const renderNode: RenderNode = (renderers, flat, idx, props, state) => {
  const node = flat.nodes[idx];
  const renderer = renderers[node.type as any as keyof typeof renderers] as unknown as RenderNode | undefined;

  if (renderer) {
    try {
      return renderer(renderers, flat, idx, props, state);
    } catch (error) {
      // tslint:disable-next-line
      console.error(error);
      return <span data-node="error">{node.value || '😟'}</span>;
    }
  } else {
    // tslint:disable-next-line
    console.log('no renderer for node:', node.type);
    return <span data-node={node.type}>{node.value || '😃'}</span>;
  }
};

export default renderNode;
