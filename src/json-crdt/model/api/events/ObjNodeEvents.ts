import {NodeEvents} from './NodeEvents';
import {LruMap} from 'thingies/lib/LruMap';
import type {JsonNodeView, ObjNode} from '../../../nodes';
import type {SyncStoreSubscribe, SyncStoreUnsubscribe} from '../../../../util/events/sync-store';

export class ObjNodeEvents<O extends ObjNode<any>> extends NodeEvents<O> {
  // public keySubscribe<K extends string>(key: K): SyncStoreSubscribe {
  //   return (callback: () => void): SyncStoreUnsubscribe => {
  //     const unsubscribe = this.subscribe(() => {

  //     });
  //     return unsubscribe;
  //   };
  // }

  protected readonly getterCache = new LruMap(25);

  public keyGetter<K extends keyof JsonNodeView<O>>(key: K): (() => JsonNodeView<O>[K]) {
    const cache = this.getterCache;
    const cachedGetter = cache.get(key);
    if (cachedGetter) return <any>cachedGetter;
    const node = this.api.node;
    const getter = (): JsonNodeView<O>[K] => node.get(key)?.view();
    cache.set(key, getter);
    return getter;
  }
}
