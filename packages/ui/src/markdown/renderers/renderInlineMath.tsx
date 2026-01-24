import * as React from 'react';
import type {RenderNode} from '../types';
import KatexInlineLazy from '../components/katex/KatexInline/lazy';

const renderInlineMath: RenderNode = (renderers, flat, idx) => {
  const node = flat.nodes[idx] as any;
  return <KatexInlineLazy fallback={<code>{node.value}</code>} source={node.value} />;
};

export default renderInlineMath;
