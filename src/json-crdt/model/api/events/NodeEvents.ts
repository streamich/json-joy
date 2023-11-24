import {FanOut, FanOutListener, FanOutUnsubscribe} from 'thingies/es2020/fanout';
import {Emitter} from '../../../../util/events/Emitter';
import type {NodeApi} from '../nodes';
import type {JsonNode, JsonNodeView} from '../../../nodes';
import type {SyncStore, SyncStoreUnsubscribe} from '../../../../util/events/sync-store';

export interface NodeEventMap {
  /**
   * Fired when the node's view has changed, checked using triple equality `===`.
   *
   * The strict equality identity is preserved deeply equal values, even for objects
   * and arrays. So, this event will not fire if there was a change to the node's
   * value, but the value is still deeply equal to the previous value.
   *
   * This event depends on overall Model's `change` event, which is batched using
   * `queueMicrotask` and fired asynchronously. So, this event will not fire
   * immediately after the node's value has changed, but rather after the next
   * microtask.
   */
  view: CustomEvent<void>;
}

class ChangesFanOut<N extends JsonNode = JsonNode> extends FanOut<JsonNodeView<N>> {
  private _v: JsonNodeView<N> | undefined = undefined;
  private _u: FanOutUnsubscribe | undefined = undefined;

  constructor(private readonly api: NodeApi<N>) {
    super();
  }

  public listen(listener: FanOutListener<JsonNodeView<N>>) {
    if (!this.listeners.size) {
      const api = this.api;
      this._v = api.view();
      this._u = api.api.changes.listen(() => {
        const view = api.view();
        if (view !== this._v) {
          this._v = view;
          this.emit(view);
        }
      });
    }
    const unsubscribe = super.listen(listener);
    return () => {
      unsubscribe();
      if (!this.listeners.size) {
        this._u?.();
        // this._unsub = this._view = undefined;
      }
    };
  }
}

export class NodeEvents<N extends JsonNode = JsonNode>
  extends Emitter<NodeEventMap>
  implements SyncStore<JsonNodeView<N>>
{
  public readonly changes: ChangesFanOut<N>;

  constructor(private readonly api: NodeApi<N>) {
    super();
    this.changes = new ChangesFanOut(api);
  }

  private viewSubs: Set<(ev: NodeEventMap['view']) => any> = new Set();

  private _view: undefined | unknown = undefined;

  private onModelChange = () => {
    const _view = this._view;
    const view = this.api.node.view();
    const viewHasChanged = _view !== view;
    this._view = view;
    if (viewHasChanged) this.emit(new CustomEvent<void>('view'));
  };

  private setupViewEvents(): void {
    this._view = this.api.node.view();
    this.api.api.events.on('change', this.onModelChange);
  }

  public on<K extends keyof NodeEventMap>(
    type: K,
    listener: (ev: NodeEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (type === 'view') this.viewSubs.add(listener);
    const shouldSubscribeToModelChanges = this.viewSubs.size === 1;
    if (shouldSubscribeToModelChanges) this.setupViewEvents();
    super.on(type, listener, options);
  }

  public off<K extends keyof NodeEventMap>(
    type: K,
    listener: (ev: NodeEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void {
    if (type === 'view') this.viewSubs.delete(listener);
    const shouldUnsubscribeFromModelChanges = this.viewSubs.size === 1;
    if (shouldUnsubscribeFromModelChanges) this.api.api.events.off('change', this.onModelChange);
    super.off(type, listener, options);
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe = (callback: () => void): SyncStoreUnsubscribe => {
    return this.changes.listen(() => callback());
  };

  public readonly getSnapshot = () => this.api.view();
}
