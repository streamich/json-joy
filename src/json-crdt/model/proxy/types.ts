import type {StringApi, ObjectApi, ValueApi, ArrayApi, BinaryApi, TupleApi} from '../api/nodes';

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

export type ModelProxyValNode<T> = ModelProxyNode<T, ValueApi>;
export type ModelProxyVecNode<V extends unknown[]> = ModelProxyNode<V, TupleApi<V>> & {[K in keyof V]: ViewToProxy<V[K]>};
export type ModelProxyObjNode<V> = ModelProxyNode<V, ObjectApi> & {[K in keyof V]: ViewToProxy<V[K]>};
export type ModelProxyStrNode = ModelProxyNode<string, StringApi>;
export type ModelProxyBinNode = ModelProxyNode<Uint8Array, BinaryApi>;
export type ModelProxyArrNode<V> = ModelProxyNode<V[], ArrayApi<V>> & Record<number, ViewToProxy<V>>;
