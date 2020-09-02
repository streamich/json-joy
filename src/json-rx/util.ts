export const {isArray} = Array;

export const assertId = (id: number) => {
  if (typeof id !== 'number' || id < 1 || Math.round(id) !== id) throw new Error('Invalid ID.');
};

export const assertName = (name: string) => {
  if (typeof name !== 'string' || !name || name.length > 128) throw new Error('Invalid method.');
};

const nextTickMicrotask =
  typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : null;

const promiseMicrotask = (callback: () => void) => {
  Promise.resolve().then(callback);
};

export const microtask = nextTickMicrotask || promiseMicrotask;
