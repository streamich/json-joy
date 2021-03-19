import {ICrdtOperation} from './operations/types';

/**
 * Each JsonNode represents a structural unit of a JSON document. It is like an
 * AST node, where each node has one of the following types: "object",
 * "array", "string", "number", "boolean", and "null".
 */
export interface JsonNode {
  /**
   * Returns JavaScript plain object which represents the value of this JSON node.
   */
  toJson(): unknown;
}

export interface CrdtType extends ICrdtOperation, JsonNode {
  insert(operation: ICrdtOperation): void;
  merge(type: CrdtType): void;
}
