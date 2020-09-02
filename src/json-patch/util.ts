import {SlateTextNode, SlateElementNode} from './types';

export function deepClone(obj: unknown) {
  switch (typeof obj) {
    case 'object':
      return JSON.parse(JSON.stringify(obj));
    case 'undefined':
      return null;
    default:
      return obj;
  }
}

const {isArray} = Array;

export const isTextNode = (node: unknown): node is SlateTextNode =>
  !!node && typeof node === 'object' && typeof (node as SlateTextNode).text === 'string';

export const isElementNode = (node: unknown): node is SlateElementNode =>
  !!node && typeof node === 'object' && isArray((node as SlateElementNode).children);
