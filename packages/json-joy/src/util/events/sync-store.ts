import {FanOut} from 'thingies/lib/fanout';

export interface SyncStore<T> {
  subscribe: SyncStoreSubscribe;
  getSnapshot: () => T;
}

export type SyncStoreSubscribe = (callback: () => void) => SyncStoreUnsubscribe;
export type SyncStoreUnsubscribe = () => void;

export class FanoutSyncStore<T> implements SyncStore<T> {
  private readonly fanout: FanOut<void> = new FanOut<void>();
  public readonly subscribe: SyncStoreSubscribe = (cb) => this.fanout.listen(cb);

  constructor(public readonly getSnapshot: () => T) {}
}

export class ValueSyncStore<V> implements SyncStore<V> {
  private readonly fanout: FanOut<void> = new FanOut<void>();
  public readonly subscribe: SyncStoreSubscribe = (cb) => this.fanout.listen(cb);

  constructor(public value: V) {}

  public readonly getSnapshot: () => V = () => this.value;

  public next(value: V, force = false): void {
    if (!force && this.value === value) return;
    this.value = value;
    this.fanout.emit();
  }
}
