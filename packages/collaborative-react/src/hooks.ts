import {useState, useMemo, useCallback, useSyncExternalStore, useEffect, use} from 'react';
import {useCtxModelStrict, useCtxNodeStrict} from './context';
import type {FanOutUnsubscribe} from 'thingies/lib/fanout';
import type {SyncStore} from 'json-joy/lib/util/events/sync-store';
import type {Model, JsonNodeView} from 'json-joy/lib/json-crdt';
import type {ChangeEvent} from 'json-joy/lib/json-crdt/model/api/events';
import type {ApiPath} from 'json-joy/lib/json-crdt/model/api/types';
import type {CrdtNodeApi} from './types';

// ------------------------------------------------------------------ SyncStore

export const useStore = <T>(store: SyncStore<T>): T =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);

const emptySyncStore: SyncStore<undefined> = {
  getSnapshot: () => undefined,
  subscribe: () => () => {},
};

export const useStoreOpt = <T>(store: SyncStore<T | undefined> = emptySyncStore): T | undefined =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);

// ---------------------------------------------------------------- Model hooks

/**
 * Hook to subscribe to a model's *tick* and get the current tick value. Useful
 * for re-rendering on every *tick* of the model, this will re-render on every
 * change of the model, even if the change results in not view-relevant updates.
 * 
 * @param model The JSON CRDT model. If not provided, it will be retrieved from
 *     the context using `useCtxModelStrict()`.
 * @returns The current tick value (volatile change counter) of the model.
 */
export const useModelTick = <M extends Model<any>>(model: M = useCtxModelStrict() as M): number => {
  const getSnapshot = useCallback(() => model.tick, [model]);
  return useSyncExternalStore(model.api.subscribe, getSnapshot);
};

/**
 * Hook to subscribe to a model's view and get the current view value.
 * Re-renders the component whenever the view changes. Does not re-render if the
 * identity of the view object does not change, for example, if `{foo: 'bar'}`
 * changes to `{foo: 'bar'}`, the JSON CRDT model will preserve the same view
 * object, so this hook will not trigger a re-render.
 *
 * @returns The view of the model.
 * @param model The JSON CRDT model. If not provided, it will be retrieved from
 *     the context using `useCtxModelStrict()`.
 */
export const useModelView = <M extends Model<any>>(model: M = useCtxModelStrict() as M): JsonNodeView<M['root']> => {
  const api = model.api;
  return useSyncExternalStore(api.subscribe, api.getSnapshot) as any;
};

/**
 * Hook to subscribe to a model and get a derived value from the model using a
 * selector function. Re-renders the component whenever the model changes, even
 * if the view does not change.
 *
 * @param selector A function that maps JSON CRDT `Model` to some value.
 * @param model The JSON CRDT model. If not provided, it will be retrieved from
 *     the context using `useCtxModelStrict()`.
 * @returns The value returned by the `selector` function.
 */
export const useModel = <M extends Model<any>, R = unknown>(selector: (model: M) => R, model: M = useCtxModelStrict() as M): R => {
  const tick = useModelTick(model);
  // biome-ignore lint: manual dependency list
  return useMemo(() => selector(model), [tick, model]);
};

/**
 * A safe version of `useModel` that returns `undefined` if the selector function
 * throws an error. This can be useful if the selector function may throw an error
 * during the initial render, for example, if it tries to access a part of the
 * model that is not yet initialized.
 *
 * @param selector A function that maps JSON CRDT `Model` to some value.
 * @param model The JSON CRDT model. If not provided, it will be retrieved from
 *     the context using `useCtxModelStrict()`.
 * @returns The value returned by the `selector` function, or `undefined` if the selector throws an error.
 */
export const useModelTry = <M extends Model<any>, R = unknown>(selector: (model: M) => R, model?: M): R | undefined => {
  try {
    return useModel(selector, model);
  } catch {
    return;
  }
};

// ----------------------------------------------------------------- Node hooks

export const useNodeEvents = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  listener: (event: ChangeEvent) => void,
  node: N = useCtxNodeStrict() as N,
): FanOutUnsubscribe =>
  useMemo(() => node.onNodeChange(event, listener), [node, event]);

export const useNodeEffect = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  listener: (event: ChangeEvent) => void,
  node?: N,
): void => {
  const unsubscribe = useNodeEvents(event, listener, node);
  useEffect(() => unsubscribe, [unsubscribe]);
};

export const useNodeChange = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  node?: N,
): ChangeEvent | undefined => {
  const [change, setChange] = useState<ChangeEvent>();
  useNodeEffect(event, setChange, node);
  return change;
};

export const useNode = <N extends CrdtNodeApi = CrdtNodeApi>(
  node: N = useCtxNodeStrict() as N,
  event: 'self' | 'child' | 'subtree' = 'subtree',
): N => {
  useNodeChange(event, node);
  return node;
};

export const useNodeView = <N extends CrdtNodeApi = CrdtNodeApi>(
  node: N = useCtxNodeStrict() as N,
  event: 'self' | 'child' | 'subtree' = 'subtree',
): ReturnType<N['view']> => {
  useNodeChange(event, node);
  return node.view() as ReturnType<N['view']>;
};

// ----------------------------------------------------------------- Path hooks


export const usePathView = <M extends Model<any>>(path: ApiPath, model?: M) => {

};


// export const useSelectNode = <M extends Model<any>, N>(
//   model: M,
//   selector: (api: M['s']) => N,
// ): N | null => {
//   const tick = useModelTick(model);
//   // biome-ignore lint: manual dependency list
//   const node = useMemo(() => {
//     try {
//       return selector(model.s);
//     } catch {
//       return null;
//     }
//   }, [tick, model]);
//   return node;
// };

// 2. useNode(nodeApi: NodeApi<N>, selector) → R



// export const useNodeView;
// export const useNodeEffect;
