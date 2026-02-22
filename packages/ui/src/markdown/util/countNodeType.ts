import type {Flat} from 'mdast-flat/lib/types';

export const countNodeType = (ast: Flat, type: string) => {
  let cnt = 0;
  for (const node of ast.nodes) if (node.type === type) cnt++;
  return cnt;
};
