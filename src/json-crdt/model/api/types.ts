import type * as types from '../../types';
import type * as nodes from './nodes';

// prettier-ignore
export type JsonNodeApi<N> = N extends types.ConNode<any>
  ? nodes.ConstApi<N>
  : N extends types.RootLww<any>
    ? nodes.ValueApi<N>
    : N extends types.ValueLww<any>
      ? nodes.ValueApi<N>
      : N extends types.StringRga
        ? nodes.StringApi
        : N extends types.BinaryRga
          ? nodes.BinaryApi
          : N extends types.ArrayRga<any>
            ? nodes.ArrayApi<N>
            : N extends types.ObjectLww<any>
              ? nodes.ObjectApi<N>
              : N extends types.ArrayLww<any>
                ? nodes.VectorApi<N>
                : never;
