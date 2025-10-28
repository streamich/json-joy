import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {ArrNode, BinNode, ConNode, type JsonNode, ObjNode, StrNode, ValNode, VecNode} from '../nodes';
import {Model} from '../model';
import type {NodeBuilder} from '../../json-crdt-patch';

/**
 * Deeply checks if two JSON nodes have the same schema and values. Does not
 * verify that the CRDT metadata (like timestamps) are the same, only that
 * the structure and values are equal.
 *
 * @param a The first JSON CRDT node.
 * @param b The second JSON CRDT node.
 * @returns True if the schemas and values are equal, false otherwise.
 */
export const cmp = <A extends JsonNode<any>>(a: A, b: unknown, compareContent: boolean): b is A => {
  if (a === b) return true;
  if (a instanceof ConNode) return b instanceof ConNode && (!compareContent || deepEqual(a.val, b.val));
  else if (a instanceof ValNode) return b instanceof ValNode && cmp(a.node(), b.node(), compareContent);
  else if (a instanceof StrNode)
    return b instanceof StrNode && (!compareContent || (a.length() === b.length() && a.view() === b.view()));
  else if (a instanceof ObjNode) {
    if (!(b instanceof ObjNode)) return false;
    const keys1 = a.keys;
    const keys2 = b.keys;
    const length1 = keys1.size;
    const length2 = keys2.size;
    if (length1 !== length2) return false;
    for (const key of keys1.keys()) {
      if (!keys2.has(key)) return false;
      if (!cmp(a.get(key), b.get(key), compareContent)) return false;
    }
    return true;
  } else if (a instanceof ArrNode) {
    if (!(b instanceof ArrNode)) return false;
    const length = a.length();
    if (length !== b.length()) return false;
    for (let i = 0; i < length; i++) if (!cmp(a.getNode(i)!, b.getNode(i), compareContent)) return false;
    return true;
  } else if (a instanceof VecNode) {
    if (!(b instanceof VecNode)) return false;
    const length = a.length();
    if (length !== b.length()) return false;
    for (let i = 0; i < length; i++) if (!cmp(a.get(i), b.get(i), compareContent)) return false;
    return true;
  } else if (a instanceof BinNode)
    return b instanceof BinNode && (!compareContent || (a.length() === b.length() && deepEqual(a.view(), b.view())));
  return false;
};

export const cmpSchema = (a: NodeBuilder, b: NodeBuilder, compareContent: boolean): boolean => {
  const model1 = Model.create(a);
  const model2 = Model.create(b);
  return cmp(model1.root, model2.root, compareContent);
};
