import type {DelayedValueBuilder} from '../../json-crdt-patch/builder/DelayedValueBuilder';
import type {JsonNode} from '../types';

export type ExtensionValue = [type: Uint8Array, data: unknown];

export interface ExtensionJsonNode extends JsonNode {}

export interface ExtensionApi<EN extends ExtensionJsonNode, V = unknown> {}

export interface ExtensionDefinition<
  Value = unknown,
  Node extends JsonNode = JsonNode,
  ENode extends ExtensionJsonNode = ExtensionJsonNode,
  EApi extends ExtensionApi<ENode, Value> = ExtensionApi<ENode, Value>,
> {
  id: number;
  new: (...args: any[]) => DelayedValueBuilder;
  Node: new (data: Node) => ENode;
  Api: new (node: ENode, api: any) => EApi;
}
