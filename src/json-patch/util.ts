import type {CreateRegexMatcher} from '.';
import type {SlateTextNode, SlateElementNode} from './types';

const {isArray} = Array;

export const isTextNode = (node: unknown): node is SlateTextNode =>
  !!node && typeof node === 'object' && typeof (node as SlateTextNode).text === 'string';

export const isElementNode = (node: unknown): node is SlateElementNode =>
  !!node && typeof node === 'object' && isArray((node as SlateElementNode).children);

export const createMatcherDefault: CreateRegexMatcher = (pattern, ignoreCase) => {
  const reg = new RegExp(pattern, ignoreCase ? 'i' : undefined);
  return (value) => reg.test(value);
};
