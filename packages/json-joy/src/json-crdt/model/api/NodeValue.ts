// import {FanOutListener, FanOutUnsubscribe} from 'thingies/lib/fanout';
// import {SyncStore, SyncStoreSubscribe, SyncValue, Value} from 'thingies/lib/sync';
// import {ApiPath} from './types';
// import {NodeApi} from './nodes';

// export class NodeValue<V> implements Pick<Value<V>, 'value' | 'next' | 'listen'>, SyncStore<V>, SyncValue<V> {
//   public get value(): V {
//     return this.node.read(this.path) as V;
//   }

//   constructor (public readonly node: NodeApi<any>, public readonly path: ApiPath) {}

//   public listen(listener: FanOutListener<void>): FanOutUnsubscribe {
//     return this.node.onSubtreeChange(() => listener());
//   }

//   public next(value: V, force = false): void {
//     const {node, path} = this;
//     const child = node.in(path, true);
//     if (child) child.merge(value);
//     else node.add(path, value);
//   }

//   /** ----------------------------------------------------- {@link SyncStore} */

//   public readonly subscribe: SyncStoreSubscribe = (cb) => this.listen(cb);
//   public readonly getSnapshot: () => V = () => this.value;
// }
