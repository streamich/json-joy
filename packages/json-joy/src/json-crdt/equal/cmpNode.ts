import {ArrNode, BinNode, ConNode, type JsonNode, ObjNode, StrNode, ValNode, VecNode} from '../nodes';
import {equal} from '../../json-crdt-patch';
import {last2} from 'sonic-forest/lib/util2';
import type {AbstractRga} from '../nodes/rga';

const cmpRga = (a: AbstractRga<any>, b: AbstractRga<any>): boolean => {
  const maxIdChunkA = last2(a.ids);
  const maxIdChunkB = last2(b.ids);
  if (maxIdChunkA && maxIdChunkB && !equal(maxIdChunkA.id, maxIdChunkB.id)) return false;
  return a.length() === b.length() && a.size() === b.size();
};

/**
 * Performs type and metadata shallow check of two JSON CRDT nodes. Compares
 * node type and their metadata (like timestamps). Does not compare the content
 * of the nodes, however if the metadata matches the content is likely the same
 * as well.
 *
 * @param a The first JSON CRDT node.
 * @param b The second JSON CRDT node.
 * @returns True if they are equal, false otherwise.
 */
export const cmpNode = <A extends JsonNode<any>>(a: A, b: unknown): b is A => {
  if (a === b) return true;
  if (a instanceof ConNode) return b instanceof ConNode && equal(a.id, b.id);
  else if (a instanceof ValNode) return b instanceof ValNode && equal(a.id, b.id) && equal(a.val, b.val);
  else if (a instanceof StrNode) {
    if (!(b instanceof StrNode) || !equal(a.id, b.id)) return false;
    return cmpRga(a, b);
  } else if (a instanceof ObjNode) {
    if (!(b instanceof ObjNode) || !equal(a.id, b.id)) return false;
    const keys1 = a.keys;
    const keys2 = b.keys;
    const length1 = keys1.size;
    const length2 = keys2.size;
    if (length1 !== length2) return false;
    for (const key of keys1.keys()) {
      const ts1 = keys1.get(key);
      const ts2 = keys2.get(key);
      if (!ts1 || !ts2 || !equal(ts1, ts2)) return false;
    }
    return true;
  } else if (a instanceof ArrNode) {
    if (!(b instanceof ArrNode) || !equal(a.id, b.id)) return false;
    return cmpRga(a, b);
  } else if (a instanceof VecNode) {
    if (!(b instanceof VecNode) || !equal(a.id, b.id)) return false;
    const elementsA = a.elements;
    const elementsB = b.elements;
    const length = elementsA.length;
    if (length !== elementsB.length) return false;
    for (let i = 0; i < length; i++) {
      const ts1 = elementsA[i];
      const ts2 = elementsB[i];
      if (!ts1) {
        if (ts2) return false;
      } else {
        if (!ts2 || !equal(ts1, ts2)) return false;
      }
    }
    return true;
  } else if (a instanceof BinNode) {
    if (!(b instanceof BinNode) || !equal(a.id, b.id)) return false;
    return cmpRga(a, b);
  }
  return false;
};
