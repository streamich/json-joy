import {useSyncExternalStore} from 'react';
import type {SyncStore} from '../types';

export const syncStore = <T>(value: T): SyncStore<T> => ({
  getSnapshot: () => value,
  subscribe: () => () => {},
});

const emptySyncStore: SyncStore<undefined> = syncStore(void 0);

export const useSyncStore = <T>(store: SyncStore<T>): T => useSyncExternalStore(store.subscribe, store.getSnapshot);

export const useSyncStoreOpt = <T>(store: SyncStore<T | undefined> = emptySyncStore): T | undefined =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);
