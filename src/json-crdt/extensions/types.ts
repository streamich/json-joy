import type {NodeApi} from '../model/api/nodes';
import type {ExtensionNode} from './ExtensionNode';

export type ExtensionValue = [type: Uint8Array, data: unknown];

/** @todo Rename to `ExtApi`. */
export interface ExtensionApi<EN extends ExtensionNode<any>> extends NodeApi<EN> {}
