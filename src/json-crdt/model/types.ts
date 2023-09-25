import type * as nodes from './api/nodes';

export interface ProxyNode<V, N> {
  toView(): V;
  toNode(): N;
}

export type ProxyNodeConst<View> = ProxyNode<View, nodes.ConstApi<View>>;
export type ProxyNodeString = ProxyNode<string, nodes.StringApi>;
export type ProxyNodeBinary = ProxyNode<Uint8Array, nodes.BinaryApi>;
export type ProxyNodeValue<Value extends ProxyNode<any, any>> = ProxyNode<
  ViewOfProxyNode<Value>,
  nodes.ValueApi<ViewOfProxyNode<Value>>
> & {val: Value};
export type ProxyNodeVector<Elements extends ProxyNode<any, any>[]> = ProxyNode<
  ViewOfProxyNode<Elements>,
  nodes.TupleApi<ViewOfProxyNode<Elements>>
> &
  Elements;
export type ProxyNodeObject<Dictionary extends Record<string, ProxyNode<any, any>>> = ProxyNode<
  ViewOfProxyNode<Dictionary>,
  nodes.ObjectApi<ViewOfProxyNode<Dictionary>>
> &
  Dictionary;
export type ProxyNodeArray<Elements extends ProxyNode<any, any>[]> = ProxyNode<
  ViewOfProxyNode<Elements>,
  nodes.ArrayApi<ViewOfProxyNode<Elements>>
> &
  Elements;

export type ViewOfProxyNode<N> = N extends ProxyNode<infer V, any> ? V : {[K in keyof N]: ViewOfProxyNode<N[K]>};

// prettier-ignore
export type ViewToProxyNodeDirect<V> = V extends string
  ? ProxyNodeString
  : V extends Uint8Array
    ? ProxyNodeBinary
    : V extends number
      ? ProxyNodeConst<number>
      : V extends boolean
        ? ProxyNodeConst<boolean>
        : V extends null
          ? ProxyNodeConst<null>
          : V extends undefined
            ? ProxyNodeConst<undefined>
            : V extends [infer E]
              ? ProxyNodeVector<[ViewToProxyNodeDirect<E>]>
              : V extends (infer E)[]
                ? ProxyNodeArray<ViewToProxyNodeValueWrapped<E>[]>
                : V extends Record<string, any>
                  ? ProxyNodeObject<{[K in keyof V]: ViewToProxyNodeDirect<V[K]>}>
                  : never;

// prettier-ignore
export type ViewToProxyNodeValueWrapped<V> = V extends boolean
  ? ProxyNodeValue<ProxyNodeConst<boolean>>
  : V extends number
    ? ProxyNodeValue<ProxyNodeConst<number>>
    : V extends null
      ? ProxyNodeValue<ProxyNodeConst<null>>
      : V extends undefined
        ? ProxyNodeValue<ProxyNodeConst<undefined>>
        : ViewToProxyNodeDirect<V>;
