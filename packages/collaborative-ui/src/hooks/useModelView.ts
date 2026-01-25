import {useSyncExternalStore} from 'react';
import type {Model, JsonNodeView, JsonNode} from 'json-joy/lib/json-crdt';

export const useModelView = <N extends JsonNode = JsonNode<any>>(model: Model<N>): Readonly<JsonNodeView<N>> => {
  const api = model.api;
  return useSyncExternalStore(api.subscribe, api.getSnapshot);
};
