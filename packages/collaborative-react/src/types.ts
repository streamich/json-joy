import type {NodeApi} from 'json-joy/lib/json-crdt';

export type CrdtNodeApi = Omit<NodeApi<any>, '$'>;
