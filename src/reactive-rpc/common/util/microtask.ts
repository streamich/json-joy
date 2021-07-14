const nextTickMicrotask =
  typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : null;

const promiseMicrotask = (callback: () => void) => {
  Promise.resolve().then(callback);
};

export const microtask = nextTickMicrotask || promiseMicrotask;
