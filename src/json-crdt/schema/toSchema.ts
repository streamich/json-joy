import {type JsonNode, ConNode, ValNode, ObjNode, VecNode, StrNode, BinNode, ArrNode} from '../nodes';
import {type NodeBuilder, s} from '../../json-crdt-patch';
import type {JsonNodeToSchema} from './types';

/**
 * Converts any JSON CRDT node to a schema representation. The schema can be
 * used to copy the structure of the JSON CRDT node to another document or
 * another location in the same document.
 *
 * @param node JSON CRDT node to recursively convert to schema.
 * @returns Schema representation of the JSON CRDT node.
 */
export const toSchema = <N extends JsonNode<any>>(node: N): JsonNodeToSchema<N> => {
  if (node instanceof ConNode) return s.con(node.val) as any;
  if (node instanceof ValNode) return s.val(toSchema(node.node())) as any;
  if (node instanceof ObjNode) {
    const obj: Record<string, NodeBuilder> = {};
    node.nodes((child, key) => (obj[key] = toSchema(child)));
    return s.obj(obj) as any;
  }
  if (node instanceof VecNode) {
    const arr: NodeBuilder[] = [];
    node.children((child) => arr.push(toSchema(child)));
    return s.vec(...arr) as any;
  }
  if (node instanceof StrNode) return s.str(node.view()) as any;
  if (node instanceof BinNode) return s.bin(node.view()) as any;
  if (node instanceof ArrNode) {
    const arr: NodeBuilder[] = [];
    node.children((child) => {
      if (child) arr.push(toSchema(child));
    });
    return s.arr(arr) as any;
  }
  return s.con(undefined) as any;
};
