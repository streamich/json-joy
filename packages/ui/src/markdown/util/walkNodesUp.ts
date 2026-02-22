import type {Flat, TNode} from 'mdast-flat/lib/types';

const walkNodesUp = (ast: Flat, idx: number, visitor: (node: TNode) => void) => {
  while (idx) {
    const node = ast.nodes[idx];
    visitor(node);
    idx = node.parent;
  }
  visitor(ast.nodes[0]);
};

export default walkNodesUp;
