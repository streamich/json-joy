import * as React from 'react';
import type {SyncStore} from '../../../util/events/sync-store';

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

export const useTimeout = (ms: number, deps: React.DependencyList = [ms]) => {
  const [ready, setReady] = React.useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ready do not need to memoize it
  React.useEffect(() => {
    if (ready) setReady(false);

    const timer = setTimeout(() => {
      setReady(true);
    }, ms);

    return () => {
      clearTimeout(timer);
    };
  }, deps);

  return ready;
};
