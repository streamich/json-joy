import {sort} from '@jsonjoy.com/util/lib/sort/insertion';
import {ArrNode, BinNode, ConNode, type JsonNode, ObjNode, StrNode, ValNode, VecNode} from '../json-crdt';
import {hash} from './hash';
import {structHash} from './structHash';

/**
 * Constructs a structural hash of the view of the node.
 *
 * Produces a *structural hash* of a JSON CRDT node. Works the same as
 * `structHash, but uses the `JsonNode` interface instead of a generic value.
 *
 * @todo PERF: instead of constructing a "str" and "bin" view, iterate over
 *     the RGA chunks and hash them directly.
 */
export const structHashCrdt = (node?: JsonNode): string => {
  if (node instanceof ConNode) return structHash(node.val);
  else if (node instanceof ValNode) return structHashCrdt(node.node());
  else if (node instanceof StrNode) return hash(node.view()).toString(36);
  else if (node instanceof ObjNode) {
    let res = '{';
    const keys = Array.from(node.keys.keys());
    sort(keys);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const value = node.get(key);
      res += hash(key).toString(36) + ':' + structHashCrdt(value) + ',';
    }
    return res + '}';
  } else if (node instanceof ArrNode || node instanceof VecNode) {
    let res = '[';
    node.children((child) => {
      res += structHashCrdt(child) + ',';
    });
    return res + ']';
  } else if (node instanceof BinNode) return hash(node.view()).toString(36);
  return 'U';
};
