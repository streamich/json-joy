import {useSyncExternalStore, useMemo} from "react";
import {animateInterpolation} from "../util/interpolate";

export const useInterpolation = (cur: number[], frame: number = 25, factor: number = .18): number[] => {
  const [update, subscribe, getSnapshot] = useMemo(() => animateInterpolation(frame, factor, cur), [frame, factor]);
  const state = useSyncExternalStore(subscribe, getSnapshot);
  update(cur);
  return state;
};
