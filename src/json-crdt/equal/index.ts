import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {ArrNode, BinNode, ConNode, JsonNode, ObjNode, StrNode, ValNode, VecNode} from '../nodes';

/**
 * Deeply checks if two JSON nodes have the same schema and values. Does not
 * verify that the CRDT metadata (like timestamps) are the same, only that
 * the structure and values are equal.
 *
 * @param a The first JSON CRDT node.
 * @param b The second JSON CRDT node.
 * @returns True if the schemas and values are equal, false otherwise.
 */
export const equalSchema = <A extends JsonNode<any>>(a: A, b: unknown): b is A => {
  if (a === b) return true;
  if (a instanceof ConNode) return b instanceof ConNode && deepEqual(a.val, b.val);
  else if (a instanceof ValNode) return b instanceof ValNode && equalSchema(a.node(), b.node());
  else if (a instanceof StrNode) return b instanceof StrNode && a.length() === b.length() && a.view() === b.view();
  else if (a instanceof ObjNode) {
    if (!(b instanceof ObjNode)) return false;
    const keys1 = a.keys;
    const keys2 = b.keys;
    const length1 = keys1.size;
    const length2 = keys2.size;
    if (length1 !== length2) return false;
    for (const key of keys1.keys()) {
      if (!keys2.has(key)) return false;
      if (!equalSchema(a.get(key), b.get(key))) return false;
    }
    return true;
  } else if (a instanceof ArrNode) {
    if (!(b instanceof ArrNode)) return false;
    const length = a.length();
    if (length !== b.length()) return false;
    for (let i = 0; i < length; i++) if (!equalSchema(a.getNode(i)!, b.getNode(i))) return false;
    return true;
  } else if (a instanceof VecNode) {
    if (!(b instanceof VecNode)) return false;
    const length = a.length();
    if (length !== b.length()) return false;
    for (let i = 0; i < length; i++) if (!equalSchema(a.get(i), b.get(i))) return false;
    return true;
  } else if (a instanceof BinNode)
    return b instanceof BinNode && a.length() === b.length() && deepEqual(a.view(), b.view());
  return false;
};
