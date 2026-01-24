import type {RenderNode} from '../types';

const renderPortal: RenderNode = (renderers, flat, idx, props, state) => {
  const node = flat.nodes[idx] as any;
  return renderers.root(renderers, flat, node.children[0], props, state);
};

export default renderPortal;
