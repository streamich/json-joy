import {useMemo} from 'react';
import {useModelTick} from './useModelTick';
import type {Model} from 'json-joy/lib/json-crdt';

export const useModel = <M extends Model<any>, R>(model: M, selector: (api: M) => R): R | undefined => {
  const tick = useModelTick(model);
  // biome-ignore lint: manual dependency list
  const result = useMemo(() => {
    try {
      return selector(model);
    } catch {
      return undefined;
    }
  }, [tick, model]);
  return result;
};
