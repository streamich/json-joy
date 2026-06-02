import type {JsonNodeApi} from './types';
import type * as nodes from '../../nodes';
import type {PeritextNode, QuillDeltaNode} from '../../../json-crdt-extensions';
import type {VecNodeExtensionData} from '../../schema/types';
import type {PathStep} from '@jsonjoy.com/json-pointer';
import type {NodeApi} from '..';

export interface ProxyNode<N extends nodes.JsonNode = nodes.JsonNode> {
  $: JsonNodeApi<N>;
}

/**
 * `WProxyNode` is the *writable* counterpart of `view()`: it mirrors the
 * plain-JSON view of the document, but reading and writing it records CRDT
 * operations. It is shaped exactly like the data — there are no node handles in
 * the type, so it edits like a plain object/array:
 *
 * ```ts
 * model.w.title = 'Hello';              // ObjApi.set({title: 'Hello'})
 * model.w.tracks.push(track);           // ArrApi.push(track)
 * model.w.tracks[0].name = 'opening';   // deep field edit on element 0
 * model.w.config = {fps: 30};           // whole-object assignment
 * ```
 *
 * This is the read/write sibling of the two existing proxies: `view()` is a
 * detached read-only snapshot, `.s` is the node proxy that exposes every
 * handle (`$`, `ins`/`del`, …) for manual control, and `.w` is the ergonomic
 * plain read/write layer. When you need a node handle from inside a `.w` edit,
 * reach for `.s` (e.g. `model.s.title.$.ins(5, '!')` for in-place string ops).
 *
 * Notes:
 * - `val` nodes are transparent — `.w` resolves through them to the inner value.
 * - Leaf nodes (`con`/`str`/`bin`) read back as their raw value; `str` widens to
 *   `string` and `bin` to `Uint8Array` so reassignment type-checks.
 * - Deleting a (non-optional) declared key still needs the usual TS cast, since
 *   `delete` is only allowed on optional properties.
 */
// prettier-ignore
export type WProxyNode<N> =
  N extends nodes.ConNode<infer V>
    ? V
    : N extends nodes.RootNode<infer M>
      ? WProxyNode<M>
      : N extends nodes.ValNode<infer T>
        ? WProxyNode<T>
        : N extends nodes.StrNode
          ? string
          : N extends nodes.BinNode
            ? Uint8Array
            : N extends nodes.ArrNode<infer E>
              ? WProxyNodeArr<E>
              : N extends nodes.ObjNode<infer M>
                ? WProxyNodeObj<M>
                : N extends nodes.VecNode<any>
                  ? WProxyNodeVec<N>
                  : unknown;

export type WProxyNodeObj<M extends Record<string, nodes.JsonNode>> = {
  -readonly [K in keyof M]: WProxyNode<M[K]>;
};

/**
 * `arr` nodes read and mutate like an ordinary array: indexing, `length`,
 * iteration, and the standard methods (`map`/`filter`/`forEach`/…) all work,
 * and the mutating methods (`push`/`pop`/`shift`/`unshift`/`splice`/`sort`/
 * `reverse`/`fill`) record CRDT operations. Indexing and the element-returning
 * methods (`arr[i]`, `at`, `find`, iteration, …) yield each element's writable
 * proxy, so nested containers stay deeply navigable and mutable.
 */
export type WProxyNodeArr<E extends nodes.JsonNode> = WProxyNode<E>[];

export type WProxyNodeVec<N extends nodes.VecNode<any>> = {
  -readonly [K in keyof nodes.JsonNodeView<N>]: JsonNodeToWProxyElement<N, K>;
};

// Helper: element type of a `vec` tuple at key `K`, as a writable proxy node.
type JsonNodeToWProxyElement<N extends nodes.VecNode<any>, K> =
  N extends nodes.VecNode<infer T>
    ? K extends keyof T
      ? T[K] extends nodes.JsonNode
        ? WProxyNode<T[K]>
        : unknown
      : unknown
    : unknown;

export type ProxyNodeCon<N extends nodes.ConNode<any>> = ProxyNode<N>;
export type ProxyNodeVal<N extends nodes.ValNode<any>> = ProxyNode<N> & {
  _: JsonNodeToProxyNode<ReturnType<N['child']>>;
};
export type ProxyNodeVec<N extends nodes.VecNode<any>> = ProxyNode<N> & {
  [K in keyof nodes.JsonNodeView<N>]: JsonNodeToProxyNode<nodes.JsonNodeView<N>[K]>;
} & {
  /** @todo Rename to `asExt()`. */
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
export type JsonNodeToProxyNode<N> =
  N extends nodes.ConNode<any>
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
export type ProxyPathUserEndMethod<M extends ProxyPathEndMethod<any[], any>> =
  M extends ProxyPathEndMethod<infer Args, infer Return> ? (...args: Args) => Return : never;
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
