export const throttle = <F extends (...args: any[]) => void>(fn: F, ms: number = 25): [fn: F, stop: () => void] => {
  let timer: unknown;
  let lastArgs: Parameters<F> | undefined;
  const stop = () => {
    if (timer) {
      clearTimeout(timer as number);
      timer = 0;
    }
  };
  const out = ((...args) => {
    lastArgs = args as Parameters<F>;
    if (timer) return;
    timer = setTimeout(() => {
      timer = 0;
      fn.apply(null, lastArgs!);
    }, ms);
  }) as F;
  return [out, stop];
};
