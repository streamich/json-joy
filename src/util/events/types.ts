export interface SyncExternalStore<T> {
  subscribe: SyncExternalStoreSubscribe;
  getSnapshot: () => T;
}

export type SyncExternalStoreSubscribe = (callback: () => void) => SyncExternalStoreUnsubscribe;
export type SyncExternalStoreUnsubscribe = () => void;
