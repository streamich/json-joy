import {useState, useMemo, useCallback, useSyncExternalStore, useEffect} from 'react';
import {useCtxModelStrict, useCtxNodeStrict} from './context';
import type {FanOutUnsubscribe} from 'thingies/lib/fanout';
import type {SyncStore} from 'json-joy/lib/util/events/sync-store';
import type {Model, JsonNodeView, ArrApi, ObjApi, StrApi} from 'json-joy/lib/json-crdt';
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

/**
 * Hook to subscribe to change events on a JSON CRDT node. Returns a function
 * to unsubscribe from the events. If the `node` parameter is
 * not provided, the node will be retrieved from the context using
 * `useCtxNodeStrict()`.
 * 
 * @see useNodeEffect for a more convenient hook that automatically handles un-subscription.
 *
 * @param event The type of change event to subscribe to.
 *     Defaults to 'subtree', which will trigger whenever the top `node` or
 *     any of its descendants change. 'self' will only trigger when the `node`
 *     itself changes, and 'child' will trigger when direct children change.
 * @param listener The callback function to be invoked when the specified change
 *     event occurs.
 * @param node The JSON CRDT node to subscribe to. If not provided, it will be
 *     retrieved from the context using `useCtxNodeStrict()`.
 * @returns A function to unsubscribe from the change events.
 */
export const useNodeEvents = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  listener: (event: ChangeEvent) => void,
  node: N = useCtxNodeStrict() as N,
): FanOutUnsubscribe =>
  useMemo(() => node.onNodeChange(event, listener), [node, event]);

/**
 * Same as `useNodeEvents`, but automatically unsubscribes when the component
 * unmounts.
 * 
 * @see useNodeEvents for a more low-level hook that returns the un-subscription
 *     function for manual control over subscription lifecycle.
 *
 * @param event The type of change event to subscribe to.
 *     Defaults to 'subtree', which will trigger whenever the top `node` or
 *     any of its descendants change. 'self' will only trigger when the `node`
 *     itself changes, and 'child' will trigger when direct children change.
 * @param listener The callback function to be invoked when the specified change
 *     event occurs.
 * @param node The JSON CRDT node to subscribe to. If not provided, it will be
 *     retrieved from the context using `useCtxNodeStrict()`.
 * @returns A function to unsubscribe from the change events.
 */
export const useNodeEffect = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  listener: (event: ChangeEvent) => void,
  node?: N,
): void => {
  const unsubscribe = useNodeEvents(event, listener, node);
  useEffect(() => unsubscribe, [unsubscribe]);
};

/**
 * Re-renders the component whenever the specified type of change event occurs
 * on the given node. Returns the latest change event object, or `undefined` if
 * no change has occurred yet. If the `node` parameter is not provided, the node
 * will be retrieved from the context using `useCtxNodeStrict()`.
 * 
 * @see useNodeEffect for a more low-level hook that listen for change events
 *     without causing re-renders.
 *
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @param node The JSON CRDT node to subscribe to. If not provided, it will be
 *     retrieved from the context using `useCtxNodeStrict()`.
 * @returns The latest change event object, or `undefined` if no change has
 *     occurred yet.
 */
export const useNodeChange = <N extends CrdtNodeApi = CrdtNodeApi>(
  event: 'self' | 'child' | 'subtree',
  node?: N,
): ChangeEvent | undefined => {
  const [change, setChange] = useState<ChangeEvent>();
  useNodeEffect(event, setChange, node);
  return change;
};

/**
 * Re-renders the component whenever the specified type of change event occurs
 * on the given node, and returns the node itself. If the `node` parameter is not
 * provided, the node will be retrieved from the context using `useCtxNodeStrict()`.
 * 
 * @see useNodeEvents
 * @see useNodeEffect
 * @see useNodeChange
 * @see useNodeView
 *
 * @param node The JSON CRDT node to subscribe to. If not provided, it will be
 *     retrieved from the context using `useCtxNodeStrict()`.
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @returns The JSON CRDT node that the component is subscribed to.
 */
export const useNode = <N extends CrdtNodeApi = CrdtNodeApi>(
  node: N = useCtxNodeStrict() as N,
  event: 'self' | 'child' | 'subtree' = 'subtree',
): N => {
  useNodeChange(event, node);
  return node;
};

/**
 * Re-renders the component whenever the specified type of change event occurs
 * on the given node, and returns the node view. If the `node` parameter is not
 * provided, the node will be retrieved from the context using `useCtxNodeStrict()`.
 * 
 * @see useNodeEvents
 * @see useNodeEffect
 * @see useNodeChange
 * @see useNode
 *
 * @param node The JSON CRDT node to subscribe to. If not provided, it will be
 *     retrieved from the context using `useCtxNodeStrict()`.
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @returns The view of the JSON CRDT node that the component is subscribed to.
 */
export const useNodeView = <N extends CrdtNodeApi = CrdtNodeApi>(
  node: N = useCtxNodeStrict() as N,
  event: 'self' | 'child' | 'subtree' = 'subtree',
): ReturnType<N['view']> => {
  useNodeChange(event, node);
  return node.view() as ReturnType<N['view']>;
};

// ----------------------------------------------------------------- Path hooks

/**
 * React hook to access a nested JSON CRDT node at a specified path. Subscribes
 * to changes on the parent node (or context node if not provided) and
 * re-renders when the specified type of change event occurs. Returns
 * `undefined` if the path does not exist or cannot be resolved to a node.
 *
 * @param path Path at which to find a nested JSON CRDT node.
 * @param node The parent (or node taken from React context, if not provided)
 *     from which to start search of the nested node.
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @returns The nested JSON CRDT node at the specified path, or `undefined` if
 *     the path does not exist.
 */
export const usePath = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath,
  node: N = useCtxNodeStrict() as N,
  event: 'self' | 'child' | 'subtree' = 'subtree',
): CrdtNodeApi | undefined => {
  useNode(node, event);
  try {
    return node.in(path);
  } catch {
    return;
  }
};

/**
 * React hook to access the view of a nested JSON CRDT node at a specified path.
 * Same as `usePath`, but returns the view of the node at the path instead of
 * the node itself.
 *
 * @param path Path at which to find a nested JSON CRDT node.
 * @param node The parent (or node taken from React context, if not provided)
 *     from which to start search of the nested node.
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @returns The view of the nested JSON CRDT node at the specified path,
 *     or `undefined` if the path does not exist.
 */
export const usePathView = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath,
  node: N = useCtxNodeStrict() as N,
  event?: 'self' | 'child' | 'subtree',
) => usePath(path, node, event)?.view();

/**
 * React hook to access "obj" node at a specified path. Same as `usePath`, but
 * returns the node casted to an `ObjApi` using `asObj()`. Returns `undefined`
 * if the path does not exist or if the node at the path is not an object node.
 * Subscribes to changes on the parent node (or context node if not provided)
 * and re-renders when the specified type of change event occurs.
 *
 * @param path Path at which to find a nested JSON CRDT node.
 * @param node The parent (or node taken from React context, if not provided)
 *     from which to start search of the nested node.
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @returns An instance of `ObjApi` at the specified path, or `undefined` if
 *     the path does not exist, or if the node is of a different type.
 */
export const useObj = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath = [],
  node?: N,
  event?: 'self' | 'child' | 'subtree',
): ObjApi<any> | undefined => usePath(path, node, event)?.asObj(true);

/**
 * React hook to access "arr" node at a specified path. Same as `usePath`, but
 * returns the node casted to an `ArrApi` using `asArr()`. Returns `undefined`
 * if the path does not exist or if the node at the path is not an array node.
 * Subscribes to changes on the parent node (or context node if not provided)
 * and re-renders when the specified type of change event occurs.
 *
 * @param path Path at which to find a nested JSON CRDT node.
 * @param node The parent (or node taken from React context, if not provided)
 *     from which to start search of the nested node.
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @returns An instance of `ArrApi` at the specified path, or `undefined` if
 *     the path does not exist, or if the node is of a different type.
 */
export const useArr = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath = [],
  node?: N,
  event?: 'self' | 'child' | 'subtree',
): ArrApi<any> | undefined => usePath(path, node, event)?.asArr(true);

/**
 * React hook to access "str" node at a specified path. Same as `usePath`, but
 * returns the node casted to an `StrApi` using `asStr()`. Returns `undefined`
 * if the path does not exist or if the node at the path is not a string node.
 * Subscribes to changes on the parent node (or context node if not provided)
 * and re-renders when the specified type of change event occurs.
 *
 * @param path Path at which to find a nested JSON CRDT node.
 * @param node The parent (or node taken from React context, if not provided)
 *     from which to start search of the nested node.
 * @param event The type of change event to subscribe to for re-rendering.
 *     Defaults to 'subtree', which will re-render whenever the top `node` or
 *     any of its descendants change. 'self' will only re-render when the `node`
 *     itself changes, and 'child' will re-render when direct children change.
 * @returns An instance of `StrApi` at the specified path, or `undefined` if
 *     the path does not exist, or if the node is of a different type.
 */
export const useStr = <N extends CrdtNodeApi = CrdtNodeApi>(
  path: ApiPath = [],
  node?: N,
  event?: 'self' | 'child' | 'subtree',
): StrApi | undefined => usePath(path, node, event)?.asStr(true);
