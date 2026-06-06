import type {NodeApi} from 'json-joy/lib/json-crdt';

/**
 * The node API surface the bindings operate on. Mirrors
 * `@jsonjoy.com/collaborative-react` — `$` (the path proxy) is omitted because
 * it is a navigation helper, not a node, and would otherwise widen the type.
 */
export type CrdtNodeApi = Omit<NodeApi<any>, '$'>;
