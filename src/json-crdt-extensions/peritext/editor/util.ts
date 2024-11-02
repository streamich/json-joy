import type {CharPredicate} from './types';

const LETTER_REGEX = /(\p{Letter}|\d)/u;
const WHITESPACE_REGEX = /\s/;

export const isLetter: CharPredicate<string> = (char: string) => LETTER_REGEX.test(char[0]);
export const isWhitespace: CharPredicate<string> = (char: string) => WHITESPACE_REGEX.test(char[0]);
export const isPunctuation: CharPredicate<string> = (char: string) => !isLetter(char) && !isWhitespace(char);
