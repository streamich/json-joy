import {equal} from '../../json-crdt-patch';
import {ObjNode, ArrNode, VecNode, RootNode, JsonNode} from '../nodes';
import type {Path} from '@jsonjoy.com/json-pointer';

/**
 * Resolves the path of `node` relative to an ancestor `top` (or root, if not
 * specified) by walking the parent chain. Transparent wrappers ("val" nodes)
 * contribute no step. Returns `undefined` when `node` is not reachable from `top`.
 */
export const pathTo = (node: JsonNode, top?: JsonNode): Path | undefined => {
  if (node === top) return [];
  const parent = node.parent;
  if (!top && parent instanceof RootNode) return [];
  if (!parent) return;
  const path = pathTo(parent, top) as (string | number)[];
  if (!path) return;
  if (parent instanceof ObjNode) {
    const keys = parent.keys;
    for (const [key, id] of keys) {
      if (equal(id, node.id)) {
        path.push(key);
        return path;
      }
    }
  } else if (parent instanceof ArrNode) {
    let j = 0;
    for (let chunk = parent.first(); chunk; chunk = parent.next(chunk)) {
      const data = chunk.data;
      if (!data) continue;
      const length = data.length;
      for (let i = 0; i < length; i++) {
        const id = data[i];
        if (equal(id, node.id)) {
          path.push(i);
          return path;
        }
        j++;
      }
    }
  } else if (parent instanceof VecNode) {
    const elements = parent.elements;
    const length = elements.length;
    for (let i = 0; i < length; i++) {
      const id = elements[i];
      if (id && equal(id, node.id)) {
        path.push(i);
        return path;
      }
    }
  }
  return path;
};
