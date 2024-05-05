import type {NodeApi} from '../model/api/nodes';
import type {ExtNode} from './ExtNode';

export type ExtensionValue = [type: Uint8Array, data: unknown];

export interface ExtApi<EN extends ExtNode<any>> extends NodeApi<EN> {}
