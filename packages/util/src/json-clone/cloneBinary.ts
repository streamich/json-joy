import {isUint8Array} from '@jsonjoy.com/buffers/lib/isUint8Array';

const {isArray} = Array;
const objectKeys = Object.keys;

/**
 * Creates a deep clone of any JSON-like object.
 *
 * @param obj Any plain POJO object.
 * @returns A deep copy of the object.
 */
export const cloneBinary = <T = unknown>(obj: T): T => {
  if (!obj) return obj;
  if (isArray(obj)) {
    const arr: unknown[] = [];
    const length = obj.length;
    for (let i = 0; i < length; i++) arr.push(cloneBinary(obj[i]));
    return arr as unknown as T;
  } else if (typeof obj === 'object') {
    if (isUint8Array(obj)) return new Uint8Array(obj) as unknown as T;
    const keys = objectKeys(obj!);
    const length = keys.length;
    const newObject: any = {};
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      newObject[key] = cloneBinary((obj as any)[key]);
    }
    return newObject;
  }
  return obj;
};
