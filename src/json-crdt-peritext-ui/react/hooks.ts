import * as React from 'react';
import type {SyncStore} from '../../util/events/sync-store';

export const useIsoLayoutEffect =
  typeof window === 'object' && !!window.document ? React.useLayoutEffect : React.useEffect;

export const useBrowserLayoutEffect =
  typeof window === 'object' && !!window.document ? React.useLayoutEffect : () => {};

export const useSyncStore = <T>(store: SyncStore<T>): T =>
  React.useSyncExternalStore(store.subscribe, store.getSnapshot);

const emptySyncStore: SyncStore<undefined> = {
  getSnapshot: () => undefined,
  subscribe: () => () => {},
};

export const useSyncStoreOpt = <T>(store: SyncStore<T | undefined> = emptySyncStore): T | undefined =>
  React.useSyncExternalStore(store.subscribe, store.getSnapshot);
