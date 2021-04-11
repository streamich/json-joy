import {SlateTextNode, SlateElementNode} from './types';

const {isArray} = Array;
const objectKeys = Object.keys;

export function deepClone(obj: unknown): unknown {
  if (!obj) return obj;
  if (isArray(obj)) {
    const arr: unknown[] = [];
    const length = obj.length;
    for (let i = 0; i < length; i++) arr.push(deepClone(obj[i]));
    return arr;
  } else if (typeof obj === 'object') {
    const keys = objectKeys(obj!);
    const length = keys.length;
    const newObject: any = {};
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      newObject[key] = deepClone((obj as any)[key]);
    }
    return newObject;
  }
  return obj;
}

export const isTextNode = (node: unknown): node is SlateTextNode =>
  !!node && typeof node === 'object' && typeof (node as SlateTextNode).text === 'string';

export const isElementNode = (node: unknown): node is SlateElementNode =>
  !!node && typeof node === 'object' && isArray((node as SlateElementNode).children);
