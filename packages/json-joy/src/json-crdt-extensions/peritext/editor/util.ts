import type {SliceTypeSteps} from '../slice';
import type {CharPredicate} from './types';

const LETTER_REGEX = /(\p{Letter}|\d|_)/u;
const WHITESPACE_REGEX = /\s/;

export const isLetter: CharPredicate<string> = (char: string) => LETTER_REGEX.test(char[0]);
export const isWhitespace: CharPredicate<string> = (char: string) => WHITESPACE_REGEX.test(char[0]);
export const isPunctuation: CharPredicate<string> = (char: string) => !isLetter(char) && !isWhitespace(char);

/**
 * Compares two block slice types, ignores tag discriminants.
 */
export const stepsEqual = (a: SliceTypeSteps, b: SliceTypeSteps): boolean => {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA !== lenB) return false;
  for (let i = 0; i < lenA; i++) {
    const stepA = a[i];
    const stepB = b[i];
    const tagA = Array.isArray(stepA) ? stepA[0] : stepA;
    const tagB = Array.isArray(stepB) ? stepB[0] : stepB;
    if (tagA !== tagB) return false;
  }
  return true;
};
