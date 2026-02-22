import walkNodesUp from './walkNodesUp';
import type {Flat} from 'mdast-flat/lib/types';

const rootDepth = (ast: Flat, idx: number) => {
  let count = 0;
  walkNodesUp(ast, idx, (node) => {
    if (node.type === 'root') count++;
  });
  return count;
};

export default rootDepth;
