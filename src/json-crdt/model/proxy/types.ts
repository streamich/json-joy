import type {JsonNodeApi} from '../api/types';
import type {JsonNode, JsonNodeView} from '../../types';
import type {ConNode} from '../../types/con/Const';
import type {ArrayLww} from '../../types/lww-array/ArrayLww';
import type {ObjectLww} from '../../types/lww-object/ObjectLww';
import type {RootLww} from '../../types/lww-root/RootLww';
import type {ValueLww} from '../../types/lww-value/ValueLww';
import type {ArrayRga} from '../../types/rga-array/ArrayRga';
import type {BinaryRga} from '../../types/rga-binary/BinaryRga';
import type {StringRga} from '../../types/rga-string/StringRga';

export interface ProxyNode<N extends JsonNode = JsonNode> {
  toApi(): JsonNodeApi<N>;
}

export type ProxyNodeConst<N extends ConNode<any>> = ProxyNode<N>;
export type ProxyNodeVal<N extends ValueLww<any>> = ProxyNode<N> & {val: JsonNodeToProxyNode<ReturnType<N['child']>>};
export type ProxyNodeVec<N extends ArrayLww<any>> = ProxyNode<N> & {
  [K in keyof JsonNodeView<N>]: JsonNodeToProxyNode<JsonNodeView<N>[K]>;
};
export type ProxyNodeObj<N extends ObjectLww<any>> = ProxyNode<N> & {
  [K in keyof JsonNodeView<N>]: JsonNodeToProxyNode<(N extends ObjectLww<infer M> ? M : never)[K]>;
};
export type ProxyNodeStr = ProxyNode<StringRga>;
export type ProxyNodeBin = ProxyNode<BinaryRga>;
export type ProxyNodeArr<N extends ArrayRga<any>> = ProxyNode<N> &
  Record<number, JsonNodeToProxyNode<N extends ArrayRga<infer E> ? E : never>>;

// prettier-ignore
export type JsonNodeToProxyNode<N> = N extends ConNode<any>
  ? ProxyNodeConst<N>
  : N extends RootLww<any>
    ? ProxyNodeVal<N>
    : N extends ValueLww<any>
      ? ProxyNodeVal<N>
      : N extends StringRga
        ? ProxyNodeStr
        : N extends BinaryRga
          ? ProxyNodeBin
          : N extends ArrayRga<any>
            ? ProxyNodeArr<N>
            : N extends ObjectLww<any>
              ? ProxyNodeObj<N>
              : N extends ArrayLww<any>
                ? ProxyNodeVec<N>
                : never;
