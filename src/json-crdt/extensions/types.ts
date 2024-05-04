import type {NodeApi} from '../model/api/nodes';
import type {ExtensionNode} from './ExtensionNode';

export type ExtensionValue = [type: Uint8Array, data: unknown];

export interface ExtensionApi<EN extends ExtensionNode<any>> extends NodeApi<EN> {}
