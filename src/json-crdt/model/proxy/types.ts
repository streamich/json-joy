import type {StringApi, ObjectApi, ValueApi, ArrayApi, BinaryApi, TupleApi, ConstApi} from '../api/nodes';

export interface ModelProxyNode<V, N> {
  toView(): V;
  toNode(): N;
}

// prettier-ignore
export type ViewToProxy<V> = V extends string
  ? ModelProxyStrNode
  : V extends Uint8Array
    ? ModelProxyBinNode
    : V extends number
      ? ModelProxyValNode<number>
      : V extends boolean
        ? ModelProxyValNode<boolean>
        : V extends null
          ? ModelProxyValNode<null>
            : V extends undefined
              ? ModelProxyValNode<undefined>
              : V extends Array<infer T>
                ? T[] extends V
                  ? ModelProxyArrNode<T>
                  : ModelProxyVecNode<V>
                : ModelProxyObjNode<V>;

// prettier-ignore
export type ObjectKeyToProxy<V> = V extends number
  ? ModelProxyConstNode<number>
  : V extends boolean
    ? ModelProxyConstNode<boolean>
    : V extends null
      ? ModelProxyConstNode<null>
      : V extends undefined
        ? ModelProxyConstNode<undefined>
        : ViewToProxy<V>;

export type ModelProxyConstNode<V> = ModelProxyNode<V, ConstApi>;
export type ModelProxyValNode<V> = ModelProxyNode<V, ValueApi>;
export type ModelProxyVecNode<V extends unknown[]> = ModelProxyNode<V, TupleApi<V>> & {[K in keyof V]: ViewToProxy<V[K]>};
export type ModelProxyObjNode<V> = ModelProxyNode<V, ObjectApi> & {[K in keyof V]: ObjectKeyToProxy<V[K]>};
export type ModelProxyStrNode = ModelProxyNode<string, StringApi>;
export type ModelProxyBinNode = ModelProxyNode<Uint8Array, BinaryApi>;
export type ModelProxyArrNode<V> = ModelProxyNode<V[], ArrayApi<V>> & Record<number, ViewToProxy<V>>;
