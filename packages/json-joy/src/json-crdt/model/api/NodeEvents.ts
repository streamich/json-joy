import {MapFanOut, OnNewFanOut} from './fanout';
import type {FanOut, FanOutUnsubscribe} from 'thingies/lib/fanout';
import type {JsonNode, JsonNodeView} from '../../nodes';
import type {SyncStore, SyncStoreUnsubscribe} from '../../../util/events/sync-store';
import type {NodeApi} from './nodes';
import type {ChangeEvent} from './events';

export class NodeEvents<N extends JsonNode = JsonNode> implements SyncStore<JsonNodeView<N>> {
  /**
   * Fired on any model change, even if the node's value has not changed. The
   * changes are fired once per microtask, so multiple changes in the same
   * microtask are batched into a single event.
   */
  public readonly onChanges: FanOut<JsonNodeView<N>>;

  /**
   * Similar to `.onChanges`, but fired when the node's view has changed,
   * checked using triple equality `===`.
   *
   * The strict equality identity is preserved deeply equal values, even for
   * objects and arrays. So, this event will not fire if there was a change
   * to the node's value, but the value is still deeply equal to the previous
   * value.
   *
   * This event depends on overall Model's `onChanges` event, which is
   * batched using `queueMicrotask`.
   */
  public readonly onViewChanges: FanOut<JsonNodeView<N>>;

  constructor(private readonly api: NodeApi<N>) {
    this.onChanges = new MapFanOut(this.api.api.onChanges, this.getSnapshot);
    this.onViewChanges = new OnNewFanOut(this.onChanges, this.api.view());
  }

  onChange(listener: (event: ChangeEvent) => void): FanOutUnsubscribe {
    const unsubscribe = this.api.api.onChange.listen((event) => {
      console.log('ids', event.ids());
      listener(event);
    });
    return unsubscribe;
  }

  /**
   * Called when this node is deleted.
   *
   * @internal
   * @ignore
   */
  public handleDelete() {
    (this.onViewChanges as OnNewFanOut<JsonNodeView<N>>).clear();
    (this.onChanges as MapFanOut<unknown, unknown>).clear();
  }

  // ---------------------------------------------------------------- SyncStore

  // TODO: .subscribe should use targeted changes check.
  public readonly subscribe = (callback: () => void): SyncStoreUnsubscribe =>
    this.onViewChanges.listen(() => callback());
  public readonly getSnapshot = () => this.api.view();
}
