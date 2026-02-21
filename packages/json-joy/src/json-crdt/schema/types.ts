import type {ExtensionId} from '../../json-crdt-extensions';
import type {MvalNode} from '../../json-crdt-extensions/mval/MvalNode';
import type {PeritextNode, QuillDeltaNode, ProseMirrorNode} from '../../json-crdt-extensions';
import type {nodes as builder} from '../../json-crdt-patch';
import type {ExtNode} from '../extensions/ExtNode';
import type * as nodes from '../nodes';

// prettier-ignore
export type SchemaToJsonNode<S> =
  S extends builder.str<infer T>
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
                : S extends builder.ext<ExtensionId.peritext, any>
                  ? ExtensionNode<PeritextNode>
                  : S extends builder.ext<ExtensionId.quill, any>
                    ? ExtensionNode<QuillDeltaNode>
                    : S extends builder.ext<ExtensionId.prosemirror, any>
                      ? ExtensionNode<ProseMirrorNode>
                      : S extends builder.ext<ExtensionId.mval, any>
                        ? ExtensionNode<MvalNode>
                        : nodes.JsonNode;

export type ExtensionNode<E extends ExtNode<any>> = nodes.VecNode<ExtensionVecData<E>>;

export type ExtensionVecData<EDataNode extends ExtNode<any, any>> = {__BRAND__: 'ExtVecData'} & [
  header: nodes.ConNode<Uint8Array>,
  data: EDataNode,
];

// prettier-ignore
export type VecNodeExtensionData<N> =
  N extends nodes.VecNode<infer T>
    ? VecNodeExtensionData<T>
    : N extends ExtensionVecData<infer EDataNode>
      ? EDataNode
      : undefined;

// prettier-ignore
export type JsonNodeToSchema<N> =
  N extends nodes.StrNode<infer T>
    ? builder.str<T>
    : N extends nodes.BinNode
      ? builder.bin
      : N extends nodes.ConNode<infer T>
        ? builder.con<T>
        : N extends nodes.ValNode<infer T>
          ? builder.val<JsonNodeToSchema<T>>
          : N extends nodes.VecNode<infer T>
            ? T extends ExtensionVecData<infer EDataNode>
              ? EDataNode extends PeritextNode
                ? builder.ext<ExtensionId.peritext, any>
                : EDataNode extends QuillDeltaNode
                  ? builder.ext<ExtensionId.quill, any>
                  : EDataNode extends ProseMirrorNode
                    ? builder.ext<ExtensionId.prosemirror, any>
                    : EDataNode extends MvalNode
                      ? builder.ext<ExtensionId.mval, any>
                      : builder.ext<number, any>
              : builder.vec<{[K in keyof T]: JsonNodeToSchema<T[K]>}>
            : N extends nodes.ObjNode<infer T>
              ? builder.obj<{[K in keyof T]: JsonNodeToSchema<T[K]>}>
              : N extends nodes.ArrNode<infer T>
                ? builder.arr<JsonNodeToSchema<T>>
                : builder.con<undefined>;
