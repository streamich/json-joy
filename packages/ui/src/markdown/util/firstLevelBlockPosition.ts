import type {Flat} from 'mdast-flat/lib/types';

const firstLevelBlockPosition = (ast: Flat, nodeIdx: number) => {
  const root = ast.nodes[0];
  if (!root.children) return -1;
  return root.children.indexOf(nodeIdx);
};

export default firstLevelBlockPosition;
