import type {PeritextNode, PeritextApi, QuillDeltaNode, QuillDeltaApi, ProseMirrorNode, ProseMirrorApi} from '../../../json-crdt-extensions';
import type * as types from '../../nodes';
import type * as nodes from './nodes';

// prettier-ignore
export type JsonNodeApi<N> = N extends types.ConNode<any>
  ? nodes.ConApi<N>
  : N extends types.RootNode<any>
    ? nodes.ValApi<N>
    : N extends types.ValNode<any>
      ? nodes.ValApi<N>
      : N extends types.StrNode
        ? nodes.StrApi
        : N extends types.BinNode
          ? nodes.BinApi
          : N extends types.ArrNode<any>
            ? nodes.ArrApi<N>
            : N extends types.ObjNode<any>
              ? nodes.ObjApi<N>
              : N extends types.VecNode<any>
                ? nodes.VecApi<N>
                : N extends PeritextNode
                  ? PeritextApi
                  : N extends QuillDeltaNode
                    ? QuillDeltaApi
                    : N extends ProseMirrorNode
                      ? ProseMirrorApi
                      : never;
