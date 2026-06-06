import {getCurrentScope, onScopeDispose, shallowRef, type ShallowRef} from 'vue';
import {ArrApi, ArrNode, ObjApi, ObjNode, ValNode, VecApi, VecNode} from 'json-joy/lib/json-crdt';
import type {JsonNode, Model} from 'json-joy/lib/json-crdt';

// Optional high-level sugar on top of the composables: a single reactive `state`
// proxy you read/write like a plain object — purpose-built for Vue `v-model`
// two-way binding, which the low-level composables serve awkwardly. It uses the
// same per-node `onNodeChange('self')` subscription the composables use for
// reactivity, and dispatches writes through json-joy's existing node verbs
// (`ObjApi.set`/`del`, `ArrApi.ins`/`upd`/`del`/`merge`, `VecApi.set`). No
// additions to json-joy core. When you need precise control (in-place text ops,
// `merge` vs `set`, explicit event granularity), drop down to the composables.

type AnyFn = (...args: any[]) => unknown;

/**
 * The minimal node-API surface this binding uses. json-joy's concrete `NodeApi`
 * subclasses don't structurally unify (their `.s`/`.$` proxy getters differ), so
 * we adapt at one boundary cast to this narrow interface instead of using `any`.
 */
interface CrdtNode {
  readonly node: JsonNode;
  readonly api: {wrap(node: JsonNode): CrdtNode};
  in(path: string | number, noThrow: true): CrdtNode | undefined;
  view(): unknown;
  onNodeChange(kind: 'self' | 'child' | 'subtree', listener: () => void): () => void;
}

export interface CollaborativeDoc<T> {
  /**
   * A fine-grained reactive view of the CRDT document. Read it in templates
   * (including `v-model`) and mutate it with plain assignment / array methods —
   * every change records a CRDT operation, and remote changes re-render only the
   * parts that changed.
   */
  readonly state: T;
  /** Tear down all per-node subscriptions. Called automatically when invoked
   *  inside a Vue effect scope (component `setup`). */
  dispose(): void;
}

// Resolve through `val`/root register layers to the underlying node. Editing an
// object key fires `onNodeChange('self')` on the OBJ node, not the `val` wrapping
// it, so we track the resolved container — otherwise remote edits to that
// container's keys wouldn't re-render.
function resolve(api: CrdtNode): CrdtNode {
  let node = api;
  while (node.node instanceof ValNode) node = node.api.wrap(node.node.node());
  return node;
}

const isContainer = (api: CrdtNode): boolean => {
  const node: JsonNode = resolve(api).node;
  return node instanceof ObjNode || node instanceof ArrNode || node instanceof VecNode;
};

// Write a single property through the concrete node verb, mirroring plain
// object/array assignment semantics. `api` is an already-resolved container.
function writeKey(api: CrdtNode, key: string, value: unknown): void {
  const node = api.node;
  if (node instanceof ObjNode) {
    (api as unknown as ObjApi).set({[key]: value});
  } else if (node instanceof VecNode) {
    const index = Number(key);
    if (!Number.isNaN(index)) (api as unknown as VecApi).set([[index, value]]);
  } else if (node instanceof ArrNode) {
    const arr = api as unknown as ArrApi;
    const len = arr.length();
    if (key === 'length') {
      const next = Number(value);
      if (!Number.isNaN(next) && next >= 0 && next < len) arr.del(next, len - next);
      return;
    }
    const index = Number(key);
    if (Number.isNaN(index) || index < 0) return;
    if (index < len) arr.upd(index, value);
    else if (index === len) arr.push(value);
    else throw new Error('OUT_OF_BOUNDS');
  }
}

// Delete a single property through the concrete node verb. `api` is resolved.
function deleteKey(api: CrdtNode, key: string): void {
  const node = api.node;
  if (node instanceof ObjNode) {
    (api as unknown as ObjApi).del([key]);
  } else if (node instanceof ArrNode) {
    const arr = api as unknown as ArrApi;
    const index = Number(key);
    if (!Number.isNaN(index) && index >= 0 && index < arr.length()) arr.del(index, 1);
  }
  // `vec` is fixed-length: deletes are no-ops, matching the read-proxy.
}

/**
 * Bind a json-joy {@link Model} to a single fine-grained Vue reactive object.
 *
 * The CRDT model stays the source of truth. Reading a node subscribes the
 * current Vue effect to it (per-node `onNodeChange('self')`, the same primitive
 * the composables use); writing dispatches the matching node verb; applying a
 * remote patch (`model.applyPatch(...)`) surfaces through the same signals —
 * re-rendering only what changed. Built entirely on json-joy's existing public
 * API and on this package's composables.
 *
 * ```ts
 * const {state} = collaborate<Board>(model);
 * state.title = 'Hello';                 // <input v-model="state.title">
 * state.notes.push({by, text});
 * state.notes[0].text = 'edited';        // deep, in place
 * ```
 *
 * Transport is out of scope: publish local ops via `model.api.onLocalChange` /
 * `model.api.flush()` and feed remote patches to `model.applyPatch(...)`.
 */
export function collaborate<T extends object>(model: Model<JsonNode>): CollaborativeDoc<T> {
  const unsubs: Array<() => void> = [];

  // One Vue signal per CRDT node, bumped when that node's own value changes.
  const signals = new Map<JsonNode, ShallowRef<number>>();
  function track(api: CrdtNode): void {
    let signal = signals.get(api.node);
    if (!signal) {
      const created = shallowRef(0);
      signals.set(api.node, created);
      unsubs.push(api.onNodeChange('self', () => (created.value += 1)));
      signal = created;
    }
    void signal.value; // register dependency with the current Vue effect
  }

  // Stable proxy per node (so reads / v-model identities are consistent).
  const proxies = new Map<JsonNode, object>();
  function proxyFor(rawApi: CrdtNode): unknown {
    const api = resolve(rawApi);
    const cached = proxies.get(api.node);
    if (cached) return cached;
    const isArr = api.node instanceof ArrNode;

    // Materialize the array's elements as a plain array whose entries are the
    // child *proxies* (containers) or raw leaf values, so read-only array methods
    // (`map`, `at`, iteration, …) stay live and deeply mutable.
    const materialize = (): unknown[] => {
      const arr = api as unknown as ArrApi;
      const length = arr.length();
      const out = new Array<unknown>(length);
      for (let i = 0; i < length; i++) {
        const child = api.in(i, true);
        out[i] = child && isContainer(child) ? proxyFor(child) : child?.view();
      }
      return out;
    };

    // Mutating array methods, expressed via the existing `arr` verbs.
    const mutators: Record<string, AnyFn> = isArr
      ? (() => {
          const arr = api as unknown as ArrApi;
          const view = () => api.view() as unknown[];
          return {
            push: (...items: unknown[]) => {
              if (items.length) arr.push(...items);
              return arr.length();
            },
            pop: () => {
              const len = arr.length();
              if (!len) return undefined;
              const value = view()[len - 1];
              arr.del(len - 1, 1);
              return value;
            },
            shift: () => {
              if (!arr.length()) return undefined;
              const value = view()[0];
              arr.del(0, 1);
              return value;
            },
            unshift: (...items: unknown[]) => {
              if (items.length) arr.ins(0, items);
              return arr.length();
            },
            splice: (start: number, deleteCount?: number, ...items: unknown[]) => {
              const len = arr.length();
              const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
              const count = deleteCount === undefined ? len - from : Math.max(0, Math.min(deleteCount, len - from));
              const removed = view().slice(from, from + count);
              if (count) arr.del(from, count);
              if (items.length) arr.ins(from, items);
              return removed;
            },
            reverse: () => {
              arr.merge(view().slice().reverse());
              return proxy;
            },
            sort: (compareFn?: (a: unknown, b: unknown) => number) => {
              arr.merge(view().slice().sort(compareFn));
              return proxy;
            },
            fill: (value: unknown, start?: number, end?: number) => {
              arr.merge(view().slice().fill(value, start, end));
              return proxy;
            },
          };
        })()
      : {};

    const proxy: object = new Proxy(isArr ? [] : {}, {
      get(_target, key) {
        if (typeof key === 'symbol') {
          if (isArr) {
            track(api);
            return (materialize() as unknown as Record<PropertyKey, unknown>)[key];
          }
          return undefined;
        }
        if (isArr) {
          if (key === 'length') {
            track(api);
            return (api as unknown as ArrApi).length();
          }
          if (key in mutators) return mutators[key];
        }
        const child = api.in(key, true);
        if (child && isContainer(child)) {
          // Container children keep a stable node identity across their own
          // edits, so depend on the child directly — a sibling change to this
          // parent must not re-render readers of this child.
          track(child);
          return proxyFor(child);
        }
        // Leaf reads (and array read methods / numeric leaf indices): editing a
        // scalar replaces its value node and fires `onNodeChange('self')` on THIS
        // container, so that's the right dependency.
        track(api);
        if (isArr) {
          const elements = materialize();
          const value = (elements as unknown as Record<PropertyKey, unknown>)[key];
          return typeof value === 'function' ? (value as AnyFn).bind(elements) : value;
        }
        return (api.view() as Record<PropertyKey, unknown>)[key];
      },
      set(_target, key, value) {
        if (typeof key !== 'symbol') writeKey(api, key, value);
        return true;
      },
      deleteProperty(_target, key) {
        if (typeof key !== 'symbol') deleteKey(api, key);
        return true;
      },
      has(_target, key) {
        if (typeof key === 'symbol') return false;
        return key in (api.view() as object);
      },
      ownKeys() {
        return Reflect.ownKeys(api.view() as object);
      },
      getOwnPropertyDescriptor(_target, key) {
        // For arrays, delegate to the real view array so `length` keeps its
        // non-configurable descriptor (required to satisfy the Proxy invariant
        // against the array target); numeric indices report as plain enumerable.
        if (isArr) return Reflect.getOwnPropertyDescriptor(api.view() as object, key);
        if (typeof key === 'symbol') return undefined;
        if (key in (api.view() as object)) return {enumerable: true, configurable: true};
        return undefined;
      },
    });
    proxies.set(api.node, proxy);
    return proxy;
  }

  const state = proxyFor(model.api as unknown as CrdtNode) as T;
  const dispose = (): void => {
    for (const unsub of unsubs) unsub();
    unsubs.length = 0;
    signals.clear();
    proxies.clear();
  };

  if (getCurrentScope()) onScopeDispose(dispose);

  return {state, dispose};
}
