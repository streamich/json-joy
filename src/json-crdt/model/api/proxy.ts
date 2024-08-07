import type {JsonNodeApi} from './types';
import type * as nodes from '../../nodes';
import type {PeritextNode, QuillDeltaNode} from '../../../json-crdt-extensions';
import type {VecNodeExtensionData} from '../../schema/types';

export interface ProxyNode<N extends nodes.JsonNode = nodes.JsonNode> {
  toApi(): JsonNodeApi<N>;
  toView(): nodes.JsonNodeView<N>;
}

export type ProxyNodeCon<N extends nodes.ConNode<any>> = ProxyNode<N>;
export type ProxyNodeVal<N extends nodes.ValNode<any>> = ProxyNode<N> & {
  val: JsonNodeToProxyNode<ReturnType<N['child']>>;
};
export type ProxyNodeVec<N extends nodes.VecNode<any>> = ProxyNode<N> & {
  [K in keyof nodes.JsonNodeView<N>]: JsonNodeToProxyNode<nodes.JsonNodeView<N>[K]>;
} & {
  toExt: () => JsonNodeApi<VecNodeExtensionData<N>>;
};
export type ProxyNodeObj<N extends nodes.ObjNode<any>> = ProxyNode<N> & {
  [K in keyof nodes.JsonNodeView<N>]: JsonNodeToProxyNode<(N extends nodes.ObjNode<infer M> ? M : never)[K]>;
};
export type ProxyNodeStr = ProxyNode<nodes.StrNode>;
export type ProxyNodeBin = ProxyNode<nodes.BinNode>;
export type ProxyNodeArr<N extends nodes.ArrNode<any>> = ProxyNode<N> &
  Record<number, JsonNodeToProxyNode<N extends nodes.ArrNode<infer E> ? E : never>>;

// prettier-ignore
export type JsonNodeToProxyNode<N> = N extends nodes.ConNode<any>
  ? ProxyNodeCon<N>
  : N extends nodes.RootNode<any>
    ? ProxyNodeVal<N>
    : N extends nodes.ValNode<any>
      ? ProxyNodeVal<N>
      : N extends nodes.StrNode
        ? ProxyNodeStr
        : N extends nodes.BinNode
          ? ProxyNodeBin
          : N extends nodes.ArrNode<any>
            ? ProxyNodeArr<N>
            : N extends nodes.ObjNode<any>
              ? ProxyNodeObj<N>
              : N extends nodes.VecNode<any>
                ? ProxyNodeVec<N>
                : N extends PeritextNode
                  ? ProxyNode<PeritextNode>
                  : N extends QuillDeltaNode
                    ? ProxyNode<QuillDeltaNode>
                    : never;
