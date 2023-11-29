import {FanOut} from 'thingies/es2020/fanout';
import {MapFanOut, OnNewFanOut} from './util';
import type {JsonNode, JsonNodeView} from '../../nodes';
import type {SyncStore, SyncStoreUnsubscribe} from '../../../util/events/sync-store';
import type {NodeApi} from './nodes';

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
  public readonly onViewChange: FanOut<JsonNodeView<N>>;

  constructor(private readonly api: NodeApi<N>) {
    this.onChanges = new MapFanOut(this.api.api.onChanges, this.getSnapshot);
    this.onViewChange = new OnNewFanOut(this.onChanges);
  }

  /**
   * Called when this node is deleted.
   *
   * @internal
   * @ignore
   */
  public handleDelete() {
    (this.onViewChange as OnNewFanOut<JsonNodeView<N>>).clear();
    (this.onChanges as MapFanOut<unknown, unknown>).clear();
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe = (callback: () => void): SyncStoreUnsubscribe => this.onViewChange.listen(() => callback());
  public readonly getSnapshot = () => this.api.view();
}
