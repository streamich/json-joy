import {useCallback, useSyncExternalStore} from 'react';
import type {Model} from 'json-joy/lib/json-crdt';

export interface UseModelProps<M extends Model<any>> {
  model: M;
  render: () => React.ReactNode;
}

export const UseModel = <M extends Model<any>>({model, render}: UseModelProps<M>) => {
  const get = useCallback(() => model.tick, [model]);
  useSyncExternalStore(model.api.subscribe, get);
  return render();
};
