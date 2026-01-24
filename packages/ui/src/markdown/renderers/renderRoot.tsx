import type {RenderNode} from '../types';

const renderRoot: RenderNode = (renderers, flat, idx, props, state) => {
  return renderers.children(renderers, flat, idx, props, state);
};

export default renderRoot;
