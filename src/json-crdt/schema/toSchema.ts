import {JsonNode, ConNode, ValNode, ObjNode, VecNode, StrNode, BinNode, ArrNode} from "../nodes";
import {NodeBuilder, s} from "../../json-crdt-patch";

/**
 * Converts any JSON CRDT node to a schema representation. The schema can be
 * used to copy the structure of the JSON CRDT node to another document or
 * another location in the same document.
 * 
 * @todo Add type generic.
 * 
 * @param node JSON CRDT node to recursively convert to schema.
 * @returns Schema representation of the JSON CRDT node.
 */
export const toSchema = (node: JsonNode): NodeBuilder => {
  if (node instanceof ConNode) return s.con(node.val);
  if (node instanceof ValNode) return s.val(toSchema(node.node()));
  if (node instanceof ObjNode) {
    const obj: Record<string, NodeBuilder> = {};
    node.nodes((child, key) => obj[key] = toSchema(child));
    return s.obj(obj);
  }
  if (node instanceof VecNode) {
    const arr: NodeBuilder[] = [];
    node.children((child) => arr.push(toSchema(child)));
    return s.vec(...arr);
  }
  if (node instanceof StrNode) return s.str(node.view());
  if (node instanceof BinNode) return s.bin(node.view());
  if (node instanceof ArrNode) {
    const arr: NodeBuilder[] = [];
    node.children((child) => {
      if (child) arr.push(toSchema(child));
    });
    return s.arr(arr);
  }
  return s.con(undefined);
};
