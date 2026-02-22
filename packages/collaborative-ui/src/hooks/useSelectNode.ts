import {useMemo} from 'react';
import {useModelTick} from './useModelTick';
import type {Model} from 'json-joy/lib/json-crdt';

export const useSelectNode = <M extends Model<any>, N>(model: M, selector: (api: M['s']) => N): N | null => {
  const tick = useModelTick(model);
  // biome-ignore lint: manual dependency list
  const node = useMemo(() => {
    try {
      return selector(model.s);
    } catch {
      return null;
    }
  }, [tick, model]);
  return node;
};
