import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import {ReplicatedStr} from '@jsonjoy.com/collaborative-str/lib/replicated-str/ReplicatedStr';
import {StoreStrFacade} from '@jsonjoy.com/collaborative-str/lib/replicated-str/StoreStrFacade';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import * as React from 'react';

export interface StrAdapterProps {
  store: JsonPatchStore<any>;
  path: string;
  children: (str: () => CollaborativeStr) => React.ReactNode;
}

export const StrAdapter: React.FC<StrAdapterProps> = ({store, path, children}) => {
  const str = React.useMemo(() => {
    try {
      const substore = path ? store.bind(path) : store;
      const facade = new StoreStrFacade(substore);
      const str = new ReplicatedStr(facade);
      return () => str;
    } catch {
      return null;
    }
  }, [store, path]);

  if (!str) return null;

  return children(str);
};
