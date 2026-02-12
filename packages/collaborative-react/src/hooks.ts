import {useMemo, useCallback, useSyncExternalStore} from 'react';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import type {Model, JsonNodeView} from 'json-joy/lib/json-crdt';

// ---------------------------------------------------------------- Model hooks

/**
 * Hook to subscribe to a model's *tick* and get the current tick value. Useful
 * for re-rendering on every *tick* of the model, this will re-render on every
 * change of the model, even if the change results in not view-relevant updates.
 * 
 * @param model The JSON CRDT model.
 * @returns The current tick value (volatile change counter) of the model.
 */
export const useModelTick = <M extends Model<any>>(model: M): number => {
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
 * @param model The JSON CRDT model.
 * @returns The view of the model.
 */
export const useModelView = <M extends Model<any>>(model: M): JsonNodeView<M['root']> => {
  const api = model.api;
  return useSyncExternalStore(api.subscribe, api.getSnapshot) as any;
};

/**
 * Hook to subscribe to a model and get a derived value from the model using a
 * selector function. Re-renders the component whenever the model changes, even
 * if the view does not change.
 *
 * @param model The JSON CRDT model.
 * @param selector A function that maps JSON CRDT `Model` to some value.
 * @returns The value returned by the `selector` function.
 */
export const useModel = <M extends Model<any>, R>(model: M, selector: (model: M) => R): R => {
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
 * @param model The JSON CRDT model.
 * @param selector A function that maps JSON CRDT `Model` to some value.
 * @returns The value returned by the `selector` function, or `undefined` if the selector throws an error.
 */
export const useModelSafe = <M extends Model<any>, R>(model: M, selector: (model: M) => R): R | undefined => {
  try {
    return useModel(model, selector);
  } catch {
    return;
  }
};

// ----------------------------------------------------------------- Node hooks

export const useStore = <Store extends JsonPatchStore<any>>(store: Store) =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);

export const useSelectNode = <M extends Model<any>, N>(
  model: M,
  selector: (api: M['s']) => N,
): N | null => {
  const tick = useModelTick(model);
  // biome-ignore lint: manual dependency list
  const node = useMemo(() => {
    try {
      return selector(model.s);
    } catch {
      return null;
    }
  }, [tick, model]);
  return node;
};
