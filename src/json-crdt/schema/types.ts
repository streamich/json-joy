import type {nodes as builder} from '../../json-crdt-patch';
import type * as nodes from '../nodes';

// prettier-ignore
export type SchemaToJsonNode<S> = S extends builder.str<infer T>
  ? nodes.StrNode<T>
  : S extends builder.bin
    ? nodes.BinNode
    : S extends builder.con<infer T>
      ? nodes.ConNode<T>
      : S extends builder.val<infer T>
        ? nodes.ValNode<SchemaToJsonNode<T>>
        : S extends builder.vec<infer T>
          ? nodes.VecNode<{[K in keyof T]: SchemaToJsonNode<T[K]>}>
          : S extends builder.obj<infer T>
            ? nodes.ObjNode<{[K in keyof T]: SchemaToJsonNode<T[K]>}>
            : S extends builder.arr<infer T>
              ? nodes.ArrNode<SchemaToJsonNode<T>>
              : nodes.JsonNode;

// prettier-ignore
export type JsonNodeToSchema<N> = N extends nodes.StrNode<infer T>
  ? builder.str<T>
  : N extends nodes.BinNode
    ? builder.bin
    : N extends nodes.ConNode<infer T>
      ? builder.con<T>
      : N extends nodes.ValNode<infer T>
        ? builder.val<JsonNodeToSchema<T>>
        : N extends nodes.VecNode<infer T>
          ? builder.vec<{[K in keyof T]: JsonNodeToSchema<T[K]>}>
          : N extends nodes.ObjNode<infer T>
            ? builder.obj<{[K in keyof T]: JsonNodeToSchema<T[K]>}>
            : N extends nodes.ArrNode<infer T>
              ? builder.arr<JsonNodeToSchema<T>>
              : builder.con<undefined>;
