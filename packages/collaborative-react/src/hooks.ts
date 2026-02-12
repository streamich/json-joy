import {useMemo, useCallback, useSyncExternalStore} from 'react';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import type {Model} from 'json-joy/lib/json-crdt';

// ---------------------------------------------------------------- Model hooks

/**
 * Hook to subscribe to a model's *tick* and get the current tick value. Useful
 * for re-rendering on every *tick* of the model, this will re-render on every
 * change of the model, even if the change results in not view-relevant updates.
 */
export const useModelTick = <M extends Model<any>>(model: M): number => {
  const getSnapshot = useCallback(() => model.tick, [model]);
  return useSyncExternalStore(model.api.subscribe, getSnapshot);
};

export const useModelView = <M extends Model<any>>(model: M) => {
  const api = model.api;
  return useSyncExternalStore(api.subscribe, api.getSnapshot);
};

export const useModel = <M extends Model<any>, R>(model: M, selector: (api: M) => R): R | undefined => {
  const tick = useModelTick(model);
  // biome-ignore lint: manual dependency list
  const result = useMemo(() => {
    try {
      return selector(model);
    } catch (error) {
      console.error('Error in useModel selector:', error);
      return undefined;
    }
  }, [tick, model]);
  return result;
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
