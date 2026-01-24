export interface UiLifeCycles {
  start(): () => void;
}

export interface SyncStore<T> {
  subscribe: SyncStoreSubscribe;
  getSnapshot: () => T;
}
export type SyncStoreSubscribe = (callback: () => void) => SyncStoreUnsubscribe;
export type SyncStoreUnsubscribe = () => void;
