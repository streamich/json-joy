import {isUint8Array} from '@jsonjoy.com/buffers/lib/isUint8Array';

const random = Math.random;

export const rnd =
  (seed = 123456789) =>
  () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };

/**
 * Executes code in a callback *deterministically*: the `Math.random()` function
 * is mocked for the duration of the callback.
 *
 * Example:
 *
 * ```js
 * deterministic(123, () => {
 *   return Math.random() + 1;
 * });
 * ```
 *
 * @param rndSeed A seed number or a random number generator function.
 * @param code Code to execute deterministically.
 * @returns Return value of the code block.
 */
export const deterministic = <T>(rndSeed: number | (() => number), code: () => T): T => {
  const isNative = Math.random === random;
  Math.random = typeof rndSeed === 'function' ? rndSeed : rnd(Math.round(rndSeed));
  try {
    return code();
  } finally {
    if (isNative) Math.random = random;
  }
};

const {isArray} = Array;
const objectKeys = Object.keys;

/**
 * Creates a deep clone of any JSON-like object.
 *
 * @param obj Any plain POJO object.
 * @returns A deep copy of the object.
 */
export const clone = <T = unknown>(obj: T): T => {
  if (!obj) return obj;
  if (isArray(obj)) {
    const arr: unknown[] = [];
    const length = obj.length;
    for (let i = 0; i < length; i++) arr.push(clone(obj[i]));
    return arr as unknown as T;
  } else if (typeof obj === 'object') {
    if (isUint8Array(obj)) return new Uint8Array(obj) as unknown as T;
    const keys = objectKeys(obj!);
    const length = keys.length;
    const newObject: any = {};
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      newObject[key] = clone((obj as any)[key]);
    }
    return newObject;
  }
  return obj;
};
