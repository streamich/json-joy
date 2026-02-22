import {useSyncExternalStore} from 'react';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';

export const useStore = <Store extends JsonPatchStore<any>>(store: Store) => {
  const view = useSyncExternalStore(store.subscribe, () => {
    // This try is not necessary one this is fixed: https://github.com/streamich/json-joy/issues/708
    try {
      return store.getSnapshot();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  });
  return view;
};
