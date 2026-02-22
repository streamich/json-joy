import type {TNode, Flat} from 'mdast-flat/lib/types';

/**
 * If parent of a node in the original document is 0, it means this node is a
 * block node at the higher most level (not nested in blockquote or a list).
 *
 * @todo Make this work for merged in documents.
 *
 * @param {TNode} node MDAST-FLAT node.
 */
const isFirstLevelBlockElement = (node: TNode, ast: Flat) => {
  if (node.parent === 0) return true;
  const parent = ast.nodes[node.parent];
  if (parent.type === 'root') return true;
  return false;
};

export default isFirstLevelBlockElement;
