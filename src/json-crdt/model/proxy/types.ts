import type {JsonNodeApi} from '../api/types';
import type * as nodes from '../../nodes';

export interface ProxyNode<N extends nodes.JsonNode = nodes.JsonNode> {
  toApi(): JsonNodeApi<N>;
}

export type ProxyNodeCon<N extends nodes.ConNode<any>> = ProxyNode<N>;
export type ProxyNodeVal<N extends nodes.ValNode<any>> = ProxyNode<N> & {
  val: JsonNodeToProxyNode<ReturnType<N['child']>>;
};
export type ProxyNodeVec<N extends nodes.ArrayLww<any>> = ProxyNode<N> & {
  [K in keyof nodes.JsonNodeView<N>]: JsonNodeToProxyNode<nodes.JsonNodeView<N>[K]>;
};
export type ProxyNodeObj<N extends nodes.ObjectLww<any>> = ProxyNode<N> & {
  [K in keyof nodes.JsonNodeView<N>]: JsonNodeToProxyNode<(N extends nodes.ObjectLww<infer M> ? M : never)[K]>;
};
export type ProxyNodeStr = ProxyNode<nodes.StringRga>;
export type ProxyNodeBin = ProxyNode<nodes.BinaryRga>;
export type ProxyNodeArr<N extends nodes.ArrayRga<any>> = ProxyNode<N> &
  Record<number, JsonNodeToProxyNode<N extends nodes.ArrayRga<infer E> ? E : never>>;

// prettier-ignore
export type JsonNodeToProxyNode<N> = N extends nodes.ConNode<any>
  ? ProxyNodeCon<N>
  : N extends nodes.RootLww<any>
    ? ProxyNodeVal<N>
    : N extends nodes.ValNode<any>
      ? ProxyNodeVal<N>
      : N extends nodes.StringRga
        ? ProxyNodeStr
        : N extends nodes.BinaryRga
          ? ProxyNodeBin
          : N extends nodes.ArrayRga<any>
            ? ProxyNodeArr<N>
            : N extends nodes.ObjectLww<any>
              ? ProxyNodeObj<N>
              : N extends nodes.ArrayLww<any>
                ? ProxyNodeVec<N>
                : never;
