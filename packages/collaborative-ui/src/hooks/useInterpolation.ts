import {useSyncExternalStore, useMemo} from 'react';
import {animateInterpolation} from '../util/interpolate';

export const useInterpolation = (cur: number[], frame: number = 25, factor: number = 0.18): number[] => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: cur skipped intentionally
  const [update, subscribe, getSnapshot] = useMemo(() => animateInterpolation(frame, factor, cur), [frame, factor]);
  const state = useSyncExternalStore(subscribe, getSnapshot);
  update(cur);
  return state;
};
