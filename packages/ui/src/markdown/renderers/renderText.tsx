import type {RenderNode, IText} from '../types';

const renderText: RenderNode = (renderers, ast, idx) => {
  const node = ast.nodes[idx] as IText;
  return node.value;
};

export default renderText;
