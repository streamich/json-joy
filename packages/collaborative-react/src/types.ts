// import type {FanOutUnsubscribe} from 'thingies/lib/fanout';
// import type {ChangeEvent} from 'json-joy/lib/json-crdt/model/api/events';
import type {NodeApi} from 'json-joy/lib/json-crdt';

export type CrdtNodeApi = Omit<NodeApi<any>, '$'>;

// export interface HookNodeLike<View = unknown> {
//   view(): View;
//   onNodeChange(event: 'self' | 'child' | 'subtree', listener: (event: ChangeEvent) => void): FanOutUnsubscribe;
// }
