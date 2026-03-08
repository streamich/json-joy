export const interpolate = (src: number[], dst: number[], factor: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < src.length; i++) {
    const s = src[i];
    const d = dst[i];
    const delta = d - s;
    result.push(Math.abs(delta) <= 1 ? d : s + delta * factor);
  }
  return result;
};

export const equal = (a: number[], b: number[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0, n = a.length; i < n; i++) if (a[i] !== b[i]) return false;
  return true;
};

type Unsubscribe = () => void;
type Subscribe = (callback: () => void) => Unsubscribe;
type GetSnapshot<T> = () => T;

export const animateInterpolation = (
  frameDuration: number,
  factor: number,
  cur: number[],
): [update: (dst: number[]) => void, subscribe: Subscribe, snapshot: GetSnapshot<number[]>] => {
  let callback: () => void = () => {};
  let dst: number[] = cur;
  let timer: any = null;
  const iteration = () => {
    timer = null;
    cur = interpolate(cur, dst, factor);
    callback();
    if (!equal(dst, cur)) timer = setTimeout(iteration, frameDuration);
  };
  const update = (d: number[]) => {
    dst = d;
    if (!timer && !equal(dst, cur)) iteration();
  };
  const unsubscribe: Unsubscribe = () => clearTimeout(timer);
  const subscribe: Subscribe = (cb) => {
    callback = cb;
    return unsubscribe;
  };
  const snapshot = () => cur;
  return [update, subscribe, snapshot];
};
