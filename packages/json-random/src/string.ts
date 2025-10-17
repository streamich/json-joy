/**
 * Tokens used to specify random string generation options
 */
export type Token = TokenLiteral | TokenPick | TokenRepeat | TokenChar | TokenList;

/**
 * A string literal to use as-is.
 */
export type TokenLiteral = string;

/**
 * Picks a random token from the provided tokens.
 */
export type TokenPick = [type: 'pick', ...from: Token[]];

/**
 * Repeats `pattern` a random number of times between `min` and `max`.
 */
export type TokenRepeat = [type: 'repeat', min: number, max: number, pattern: Token];

/**
 * Specifies a Unicode code point range from which to pick a random character.
 * The `count` parameter specifies how many characters to pick, defaults to 1.
 */
export type TokenChar = [type: 'char', min: number, max: number, count?: number];

/**
 * Executes a list of `every` tokens in sequence.
 */
export type TokenList = [type: 'list', ...every: Token[]];

/**
 * Generates a random string based on the provided token.
 * @param token The token defining the random string generation.
 * @returns A randomly generated string.
 */
export function randomString(token: Token): string {
  if (typeof token === 'string') return token;
  const rnd = Math.random();
  switch (token[0]) {
    case 'pick': {
      const [, ...from] = token;
      return randomString(from[Math.floor(rnd * from.length)]);
    }
    case 'repeat': {
      const [, min, max, pattern] = token;
      const count = Math.floor(rnd * (max - min + 1)) + min;
      let str = '';
      for (let i = 0; i < count; i++) str += randomString(pattern);
      return str;
    }
    case 'char': {
      const [, min, max, count = 1] = token;
      let str = '';
      for (let i = 0; i < count; i++) {
        const codePoint = Math.floor(rnd * (max - min + 1)) + min;
        str += String.fromCodePoint(codePoint);
      }
      return str;
    }
    case 'list': {
      const [, ...every] = token;
      return every.map(randomString).join('');
    }
    default:
      throw new Error('Invalid token type');
  }
}
