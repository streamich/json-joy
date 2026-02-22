import * as React from 'react';
import {useJsonCrdt} from './context';
import type {JsonNode} from 'json-joy/lib/json-crdt';
import type {NodeRef} from './NodeRef';

export const useNodeApi = <N extends JsonNode>(node: NodeRef<N>) => {
  const {model} = useJsonCrdt();
  return model.api.wrap(node.node);
};

export const useRerender = (node: NodeRef<JsonNode>) => {
  const events = useNodeApi(node).events;
  return React.useSyncExternalStore(events.subscribe, events.getSnapshot);
};

export const useRerenderModel = () => {
  const {model} = useJsonCrdt();
  const api = model.api;
  React.useSyncExternalStore(api.subscribe, () => model.tick);
};
