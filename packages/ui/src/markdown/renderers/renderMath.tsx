import * as React from 'react';
import type {RenderNode} from '../types';
import KatexBlock from '../block/katex/lazy';

const renderMath: RenderNode = (renderers, flat, idx) => {
  const node = flat.nodes[idx];

  return <KatexBlock idx={idx} source={node.value ?? ''} renderError={() => <div>error</div>} />;
};

export default renderMath;
