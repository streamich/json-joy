import type {NodeBuilder} from '../../json-crdt-patch/builder/DelayedValueBuilder';
import type {ModelApi} from '../model/api/ModelApi';
import type {NodeApi} from '../model/api/nodes';
import type {JsonNode} from '../nodes';

export type ExtensionValue = [type: Uint8Array, data: unknown];

export interface ExtensionJsonNode extends JsonNode {}

export interface ExtensionApi<EN extends ExtensionJsonNode> extends NodeApi<EN> {}

export interface ExtensionDefinition<
  Node extends JsonNode = JsonNode,
  ENode extends ExtensionJsonNode = ExtensionJsonNode,
  EApi extends ExtensionApi<ENode> = ExtensionApi<ENode>,
> {
  id: number;
  name: string;
  new: (...args: any[]) => NodeBuilder;
  Node: new (data: Node) => ENode;
  Api: new (node: ENode, api: ModelApi) => EApi;
}
