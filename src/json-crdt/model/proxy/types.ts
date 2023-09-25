import type {StringApi, ObjectApi, ValueApi, ArrayApi, BinaryApi, TupleApi, ConstApi} from '../api/nodes';

export interface ModelProxyNode<V, N> {
  toView(): V;
  toNode(): N;
}

// prettier-ignore
export type ToProxyComplexNode<V> = V extends string
  ? ModelProxyStrNode
  : V extends Uint8Array
    ? ModelProxyBinNode
    : V extends Array<infer T>
      ? T[] extends V
        ? ModelProxyArrNode<T>
        : ModelProxyVecNode<V>
      : ModelProxyObjNode<V>;

// prettier-ignore
export type ToProxyPreferConstPrimitives<V> = V extends number
  ? ModelProxyConstNode<number>
  : V extends boolean
    ? ModelProxyConstNode<boolean>
    : V extends null
      ? ModelProxyConstNode<null>
      : V extends undefined
        ? ModelProxyConstNode<undefined>
        : ToProxyComplexNode<V>;

// prettier-ignore
export type ToProxyPreferValPrimitives<V> = V extends number
  ? ModelProxyValNode<number, ModelProxyConstNode<number>>
  : V extends boolean
    ? ModelProxyValNode<boolean, ModelProxyConstNode<boolean>>
    : V extends null
      ? ModelProxyValNode<null, ModelProxyConstNode<null>>
      : V extends undefined
        ? ModelProxyValNode<undefined, ModelProxyConstNode<undefined>>
        : ToProxyComplexNode<V>;

export type ModelProxyConstNode<V> = ModelProxyNode<V, ConstApi<V>>;
export type ModelProxyValNode<V, Child> = ModelProxyNode<V, ValueApi<V>> & {val: Child};
export type ModelProxyVecNode<V extends unknown[]> = ModelProxyNode<V, TupleApi<V>> & {
  [K in keyof V]: ToProxyPreferValPrimitives<V[K]>;
};
export type ModelProxyObjNode<V> = ModelProxyNode<V, ObjectApi> & {[K in keyof V]: ToProxyPreferConstPrimitives<V[K]>};
export type ModelProxyStrNode = ModelProxyNode<string, StringApi>;
export type ModelProxyBinNode = ModelProxyNode<Uint8Array, BinaryApi>;
export type ModelProxyArrNode<V> = ModelProxyNode<V[], ArrayApi<V>> & Record<number, ToProxyPreferValPrimitives<V>>;
