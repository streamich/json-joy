import type {NodeApi} from '../model/api/nodes';
import type {JsonNode} from '../nodes';
import type {ExtensionNode} from './ExtensionNode';

export type ExtensionValue = [type: Uint8Array, data: unknown];

export interface ExtensionJsonNode<N extends JsonNode> extends ExtensionNode<N> {}

export interface ExtensionApi<EN extends ExtensionJsonNode<any>> extends NodeApi<EN> {}
