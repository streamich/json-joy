import type {DelayedValueBuilder} from '../../json-crdt-patch/builder/DelayedValueBuilder';
import type {ModelApi} from '../model/api/ModelApi';
import type {NodeApi} from '../model/api/nodes';
import type {JsonNode} from '../types';

export type ExtensionValue = [type: Uint8Array, data: unknown];

export interface ExtensionJsonNode extends JsonNode {}

export interface ExtensionApi<EN extends ExtensionJsonNode, V = unknown> extends NodeApi<EN, V> {}

export interface ExtensionDefinition<
  Value = unknown,
  Node extends JsonNode = JsonNode,
  ENode extends ExtensionJsonNode = ExtensionJsonNode,
  EApi extends ExtensionApi<ENode, Value> = ExtensionApi<ENode, Value>,
> {
  id: number;
  new: (...args: any[]) => DelayedValueBuilder;
  Node: new (data: Node) => ENode;
  Api: new (node: ENode, api: ModelApi) => EApi;
}
