import type {JsonNodeApi} from './types';
import type * as nodes from '../../nodes';
import type {PeritextNode, QuillDeltaNode} from '../../../json-crdt-extensions';
import type {VecNodeExtensionData} from '../../schema/types';
import type {PathStep} from '@jsonjoy.com/json-pointer';
import type {NodeApi} from '..';

export interface ProxyNode<N extends nodes.JsonNode = nodes.JsonNode> {$: JsonNodeApi<N>};

export type ProxyNodeCon<N extends nodes.ConNode<any>> = ProxyNode<N>;
export type ProxyNodeVal<N extends nodes.ValNode<any>> = ProxyNode<N> & {
  _: JsonNodeToProxyNode<ReturnType<N['child']>>;
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

export type JsonNodeToProxyPathNodeEnd<N> = {$?: JsonNodeApi<N>};

// prettier-ignore
export type JsonNodeToProxyPathNode<N> = 0 extends 1 & N
  ? ProxyPathNode<{$?: NodeApi<N extends nodes.JsonNode<unknown> ? N : nodes.JsonNode>}>
  : N extends nodes.ArrNode<infer Element>
    ? JsonNodeToProxyPathNode<Element>[] & JsonNodeToProxyPathNodeEnd<N>
    : N extends nodes.ObjNode<infer Obj>
      ? {[K in keyof Obj]: JsonNodeToProxyPathNode<Obj[K]>} & JsonNodeToProxyPathNodeEnd<N>
      : N extends nodes.VecNode<infer Tuple>
        ? {[K in keyof Tuple]: JsonNodeToProxyPathNode<Tuple[K]>} & JsonNodeToProxyPathNodeEnd<N>
        : N extends nodes.RootNode<infer M>
          ? JsonNodeToProxyPathNode<M>
          : nodes.JsonNode<unknown> extends N
            ? ProxyPathNode<{$?: NodeApi<N extends nodes.JsonNode<unknown> ? N : nodes.JsonNode>}>
            : JsonNodeToProxyPathNodeEnd<N>;

export type ProxyPathEndMethod<Args extends unknown[], Return> = (path: PathStep[], ...args: Args) => Return;
export type ProxyPathUserEndMethod<M extends ProxyPathEndMethod<any[], any>> = M extends ProxyPathEndMethod<
  infer Args,
  infer Return
>
  ? (...args: Args) => Return
  : never;
export type ProxyPathNodeStep<Api, Next> = Api & Record<string | number, Next>;
export type ProxyPathNode<Api> = ProxyPathNodeStep<
  Api,
  ProxyPathNodeStep<
    Api,
    ProxyPathNodeStep<
      Api,
      ProxyPathNodeStep<
        Api,
        ProxyPathNodeStep<Api, ProxyPathNodeStep<Api, ProxyPathNodeStep<Api, ProxyPathNodeStep<Api, any>>>>
      >
    >
  >
>;

export const proxy = <EndMethod extends ProxyPathEndMethod<any[], any>>(
  fn: EndMethod,
  path: PathStep[] = [],
): ProxyPathNode<ProxyPathUserEndMethod<EndMethod>> =>
  new Proxy(() => {}, {
    get: (target, prop, receiver) => (path.push(String(prop)), proxy(fn, path)),
    apply: (target, thisArg, args) => fn(path, ...args),
  }) as any;

export const proxy$ = <EndMethod extends ProxyPathEndMethod<any[], any>, Sentinel extends string>(
  fn: EndMethod,
  sentinel: Sentinel,
  path: PathStep[] = [],
): ProxyPathNode<{[k in Sentinel]: ReturnType<EndMethod>}> =>
  new Proxy(
    {},
    {get: (t, prop, r) => (prop === sentinel ? fn(path) : (path.push(String(prop)), proxy$(fn, sentinel, path)))},
  ) as any;
