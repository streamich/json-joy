const LETTER_REGEX = /(\p{Letter}|\d)/u;
const WHITESPACE_REGEX = /\s/;

export type CharPredicate = (char: string) => boolean;

export const isLetter: CharPredicate = (char: string) => LETTER_REGEX.test(char[0]);
export const isWhitespace: CharPredicate = (char: string) => WHITESPACE_REGEX.test(char[0]);
export const isPunctuation: CharPredicate = (char: string) => !isLetter(char) && !isWhitespace(char);
