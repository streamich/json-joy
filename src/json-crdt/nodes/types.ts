import type {nodes as builder} from '../../json-crdt-patch';
import type * as nodes from './nodes';
import type {Identifiable} from '../../json-crdt-patch/types';

/**
 * Each JsonNode represents a structural unit of a JSON document. It is like an
 * AST node, where each node has one of the following types: "object",
 * "array", "string", "number", "boolean", and "null".
 *
 * "make" operations result into JSON nodes, for example, "make object" operation
 * create a new "object" JSON node, "make number" operation creates a number
 * JSON node, etc.
 */
export interface JsonNode<View = unknown> extends Identifiable {
  /**
   * Returns a POJO object which represents the "view" of this JSON node model.
   */
  view(): View;

  /**
   * Returns a list of immediate child nodes.
   */
  children(callback: (node: JsonNode) => void): void;

  /**
   * Returns its child (if not a container node), if any.
   */
  child?(): JsonNode | undefined;

  /**
   * Returns itself if the node is a container node. Or asks its child (if any)
   * to return a container node. A *container node* is one that holds other
   * multiple other nodes which can be addressed. For example, an object and
   * an array are container nodes, as they hold other nodes.
   */
  container(): JsonNode | undefined;

  /**
   * A singleton cache, instance which provides public API for this node.
   */
  api: undefined | unknown; // JsonNodeApi<this>;
}

export type JsonNodeView<N> = N extends JsonNode<infer V> ? V : {[K in keyof N]: JsonNodeView<N[K]>};

// prettier-ignore
export type BuilderNodeToJsonNode<S> = S extends builder.str<infer T>
  ? nodes.StringRga<T>
  : S extends builder.bin
    ? nodes.BinaryRga
    : S extends builder.con<infer T>
      ? nodes.ConNode<T>
      : S extends builder.val<infer T>
        ? nodes.ValNode<BuilderNodeToJsonNode<T>>
        : S extends builder.vec<infer T>
          ? nodes.VecNode<{[K in keyof T]: BuilderNodeToJsonNode<T[K]>}>
          : S extends builder.obj<infer T>
            ? nodes.ObjNode<{[K in keyof T]: BuilderNodeToJsonNode<T[K]>}>
            : S extends builder.arr<infer T>
              ? nodes.ArrayRga<BuilderNodeToJsonNode<T>>
              : JsonNode;
