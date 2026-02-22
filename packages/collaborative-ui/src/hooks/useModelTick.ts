import {useCallback, useSyncExternalStore} from 'react';
import type {Model, JsonNode} from 'json-joy/lib/json-crdt';

export const useModelTick = <N extends JsonNode = JsonNode<any>>(model: Model<N>): number => {
  const getSnapshot = useCallback(() => model.tick, [model]);
  return useSyncExternalStore(model.api.subscribe, getSnapshot);
};
