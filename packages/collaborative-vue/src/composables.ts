import {computed, getCurrentScope, onScopeDispose, shallowRef, triggerRef, type ComputedRef, type ShallowRef} from 'vue';
import {useCtxModelStrict, useCtxNodeStrict} from './context';
import type {ArrApi, JsonNodeView, Model, ObjApi, StrApi} from 'json-joy/lib/json-crdt';
import type {ChangeEvent} from 'json-joy/lib/json-crdt/model/api/events';
import type {ApiPath} from 'json-joy/lib/json-crdt/model/api/types';
import type {CrdtNodeApi} from './types';

type ChangeKind = 'self' | 'child' | 'subtree';

// Register a subscription teardown with the current effect scope (component
// `setup()` or `effectScope()`), if there is one. Outside a scope the caller
// owns cleanup — we skip silently rather than emit Vue's "no active scope" warning.
const autoDispose = (unsubscribe: () => void): void => {
  if (getCurrentScope()) onScopeDispose(unsubscribe);
};

/**
 * A `shallowRef` recomputed on every matching node change. `compute()` runs once
 * up front and again after each change event; when its result is identical to
 * the previous one (e.g. a stable node handle or a structurally-unchanged view),
 * the ref is still *force-triggered* so dependents re-evaluate — matching React,
 * where the component re-renders on every subscribed change. Granularity is
 * controlled by `event` (`'self'` | `'child'` | `'subtree'`).
 */
const trackedRef = <T>(node: CrdtNodeApi, event: ChangeKind, compute: () => T): Readonly<ShallowRef<T>> => {
  const ref = shallowRef<T>(compute());
  const unsubscribe = node.onNodeChange(event, () => {
    const next = compute();
    if (Object.is(next, ref.value)) triggerRef(ref);
    else ref.value = next as ShallowRef<T>['value'];
  });
  autoDispose(unsubscribe);
  return ref;
};

// --------------------------------------------------------------- Model hooks

/**
 * Subscribe to a model's *tick* and return it as a ref. Re-renders on every
 * model change, even ones that don't affect the view.
 */
export const useModelTick = <M extends Model<any>>(
  model: M = useCtxModelStrict() as M,
): Readonly<ShallowRef<number>> => {
  const tick = shallowRef(model.tick);
  const unsubscribe = model.api.subscribe(() => {
    tick.value = model.tick;
  });
  autoDispose(unsubscribe);
  return tick;
};

/**
 * Subscribe to a model's view and return it as a ref. Re-renders only when the
 * view *identity* changes: json-joy preserves the same view object across
 * no-op changes (e.g. `{foo: 'bar'}` → `{foo: 'bar'}`), so the ref does not
 * trigger in that case.
 */
export const useModelView = <M extends Model<any>>(
  model: M = useCtxModelStrict() as M,
): Readonly<ShallowRef<JsonNodeView<M['root']>>> => {
  const api = model.api;
  const view = shallowRef(api.getSnapshot());
  const unsubscribe = api.subscribe(() => {
    view.value = api.getSnapshot();
  });
  autoDispose(unsubscribe);
  return view as Readonly<ShallowRef<JsonNodeView<M['root']>>>;
};

/**
 * Derive a reactive value from a model with a selector. Recomputes on every
 * model tick.
 */
export const useModel = <M extends Model<any>, R = unknown>(
  selector: (model: M) => R,
  model: M = useCtxModelStrict() as M,
): ComputedRef<R> => {
  const tick = useModelTick(model);
  return computed(() => {
    void tick.value;
    return selector(model);
  });
};

/**
 * Safe variant of {@link useModel}: returns `undefined` when the selector throws
 * (e.g. while reading a part of the document that does not exist yet).
 */
export const useModelTry = <M extends Model<any>, R = unknown>(
  selector: (model: M) => R,
  model: M = useCtxModelStrict() as M,
): ComputedRef<R | undefined> => {
  const tick = useModelTick(model);
  return computed(() => {
    void tick.value;
    try {
      return selector(model);
    } catch {
      return undefined;
    }
  });
};

// ---------------------------------------------------------------- Node hooks

/**
 * Subscribe to change events on a node and return the unsubscribe function for
 * manual lifecycle control. Prefer {@link useNodeEffect} for automatic cleanup.
 *
 * @param event `'self'` (the node itself), `'child'` (direct children), or
 *   `'subtree'` (the node or any descendant).
 */
export const useNodeEvents = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: ChangeKind,
  listener: (event: ChangeEvent) => void,
  node: N = useCtxNodeStrict() as N,
): (() => void) => node.onNodeChange(event, listener);

/** Like {@link useNodeEvents}, but unsubscribes automatically on scope dispose. */
export const useNodeEffect = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: ChangeKind,
  listener: (event: ChangeEvent) => void,
  node?: N,
): void => {
  autoDispose(useNodeEvents(event, listener, node));
};

/**
 * Re-renders on the given node change and returns a ref holding the latest
 * `ChangeEvent` (or `undefined` before the first change).
 */
export const useNodeChange = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: ChangeKind,
  node?: N,
): Readonly<ShallowRef<ChangeEvent | undefined>> => {
  const change = shallowRef<ChangeEvent>();
  useNodeEffect(
    event,
    (e) => {
      change.value = e;
    },
    node,
  );
  return change;
};

/**
 * Subscribe to a node and return it as a ref that re-triggers on every matching
 * change (the node handle identity is stable, so dependents are force-notified).
 */
export const useNode = <N extends CrdtNodeApi = CrdtNodeApi>(
  node: N = useCtxNodeStrict() as N,
  event: ChangeKind = 'subtree',
): Readonly<ShallowRef<N>> => trackedRef(node, event, () => node) as Readonly<ShallowRef<N>>;

/**
 * Subscribe to a node and return a ref holding its view, recomputed on every
 * matching change.
 */
export const useNodeView = <N extends CrdtNodeApi = CrdtNodeApi>(
  node: N = useCtxNodeStrict() as N,
  event: ChangeKind = 'subtree',
): Readonly<ShallowRef<ReturnType<N['view']>>> =>
  trackedRef(node, event, () => node.view() as ReturnType<N['view']>);

// ---------------------------------------------------------------- Path hooks

const resolvePath = (node: CrdtNodeApi, path: ApiPath): CrdtNodeApi | undefined => {
  try {
    return node.in(path) as CrdtNodeApi;
  } catch {
    return undefined;
  }
};

/**
 * Resolve a nested node by path, as a ref that re-triggers on every matching
 * change to the parent (or context) node. Holds `undefined` when the path does
 * not resolve.
 */
export const usePath = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath,
  node: N = useCtxNodeStrict() as N,
  event: ChangeKind = 'subtree',
): Readonly<ShallowRef<CrdtNodeApi | undefined>> => trackedRef(node, event, () => resolvePath(node, path));

/** Like {@link usePath}, but holds the resolved node's view instead of the node. */
export const usePathView = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath,
  node: N = useCtxNodeStrict() as N,
  event: ChangeKind = 'subtree',
): Readonly<ShallowRef<unknown>> => trackedRef(node, event, () => resolvePath(node, path)?.view());

/** Typed {@link usePath} returning the node cast to {@link ObjApi}, or `undefined`. */
export const useObj = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath = [],
  node: N = useCtxNodeStrict() as N,
  event: ChangeKind = 'subtree',
): Readonly<ShallowRef<ObjApi<any> | undefined>> =>
  trackedRef(node, event, () => resolvePath(node, path)?.asObj(true));

/** Typed {@link usePath} returning the node cast to {@link ArrApi}, or `undefined`. */
export const useArr = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath = [],
  node: N = useCtxNodeStrict() as N,
  event: ChangeKind = 'subtree',
): Readonly<ShallowRef<ArrApi<any> | undefined>> =>
  trackedRef(node, event, () => resolvePath(node, path)?.asArr(true));

/** Typed {@link usePath} returning the node cast to {@link StrApi}, or `undefined`. */
export const useStr = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath = [],
  node: N = useCtxNodeStrict() as N,
  event: ChangeKind = 'subtree',
): Readonly<ShallowRef<StrApi | undefined>> => trackedRef(node, event, () => resolvePath(node, path)?.asStr(true));
