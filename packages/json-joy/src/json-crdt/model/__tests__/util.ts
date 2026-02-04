import type {Model} from '../Model';
import type {JsonNode} from '../../nodes';

/**
 * Recursively walks through all nodes starting from root and asserts that
 * each child node's parent reference points back to its actual parent.
 */
export const assertParents = (model: Model<any>): void => {
  const assertNodeParent = (node: JsonNode, expectedParent: JsonNode | undefined): void => {
    // console.log(node.id);
    expect(node.parent).toBe(expectedParent);
    node.children((child) => assertNodeParent(child, node));
  };
  assertNodeParent(model.root, undefined);
};
