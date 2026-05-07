/**
 * Subscribes to a reactive value, skips the first `skip` emissions, and calls
 * `callback` with the latest value after `debounce` ms of silence.
 *
 * @returns Returns a cleanup function that unsubscribes and cancels any pending timer.
 */
export const watch = <T>(
  source: {subscribe(cb: () => void): () => void; readonly value: T},
  debounce = 0,
  skip = 0,
  callback: (value: T) => void,
): (() => void) => {
  let remaining = skip;
  let timer = 0;
  const unsub = source.subscribe(() => {
    if (remaining > 0) {
      remaining--;
      return;
    }
    if (timer) clearTimeout(timer);
    if (debounce > 0) {
      timer = setTimeout(() => {
        timer = 0;
        callback(source.value);
      }, debounce) as unknown as number;
    } else {
      callback(source.value);
    }
  });
  return () => {
    unsub();
    if (timer) clearTimeout(timer);
  };
};
