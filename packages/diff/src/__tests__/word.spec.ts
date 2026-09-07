import * as str from '../str';
import * as word from '../word';
import {int, logSeed, pick} from './rnd';

const isWellFormed = (s: string): boolean => {
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = s.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
};

describe('word.words()', () => {
  test('partitions into word, whitespace, and single other tokens', () => {
    expect(word.words('the cat.')).toEqual(['the', ' ', 'cat', '.']);
    expect(word.words('a  b')).toEqual(['a', '  ', 'b']);
    expect(word.words('')).toEqual([]);
    expect(word.words('😀!')).toEqual(['😀', '!']);
    expect(word.words('café déjà')).toEqual(['café', ' ', 'déjà']);
  });

  test('tokens always concatenate back to the input', () => {
    for (let i = 0; i < 500; i++) {
      const pool = ['a', 'bb', ' ', '  ', '\n', '.', ',', '😀', 'é', '中', 'x1'];
      let s = '';
      const len = int(15);
      for (let j = 0; j < len; j++) s += pick(pool);
      expect(word.words(s).join('')).toBe(s);
    }
  });
});

describe('word.diff()', () => {
  test('replaces a whole word', () => {
    expect(word.diff('the cat runs', 'the dog runs')).toEqual([
      [str.PATCH_OP_TYPE.EQL, 'the '],
      [str.PATCH_OP_TYPE.DEL, 'cat'],
      [str.PATCH_OP_TYPE.INS, 'dog'],
      [str.PATCH_OP_TYPE.EQL, ' runs'],
    ]);
  });

  test('inserts a word', () => {
    expect(word.diff('the cat', 'the big cat')).toEqual([
      [str.PATCH_OP_TYPE.EQL, 'the '],
      [str.PATCH_OP_TYPE.INS, 'big '],
      [str.PATCH_OP_TYPE.EQL, 'cat'],
    ]);
  });

  test('equal and fully different strings', () => {
    expect(word.diff('same', 'same')).toEqual([[str.PATCH_OP_TYPE.EQL, 'same']]);
    expect(word.diff('', 'abc')).toEqual([[str.PATCH_OP_TYPE.INS, 'abc']]);
    expect(word.diff('abc', '')).toEqual([[str.PATCH_OP_TYPE.DEL, 'abc']]);
  });

  test('accepts a custom tokenizer', () => {
    const byChar = (s: string): string[] => [...s];
    expect(str.src(word.diff('abc', 'axc', byChar))).toBe('abc');
    expect(str.dst(word.diff('abc', 'axc', byChar))).toBe('axc');
  });

  test('fuzz: reconstructs, ops on token boundaries, well-formed, normalized', () => {
    const pool = ['the', ' ', 'cat', 'dog', 'runs', 'fast', '.', '\n', 'a', 'é', '😀', '中'];
    for (let i = 0; i < 400; i++) {
      let a = '';
      let b = '';
      const la = int(15);
      const lb = int(15);
      for (let j = 0; j < la; j++) a += pick(pool);
      for (let j = 0; j < lb; j++) b += pick(pool);
      const patch = word.diff(a, b);
      try {
        expect(str.src(patch)).toBe(a);
        expect(str.dst(patch)).toBe(b);
        const tokens = new Set(word.words(a).concat(word.words(b)));
        for (let k = 0; k < patch.length; k++) {
          expect(patch[k][1]).not.toBe('');
          expect(isWellFormed(patch[k][1])).toBe(true);
          // Every op text is a concatenation of whole tokens.
          expect(word.words(patch[k][1]).every((t) => tokens.has(t))).toBe(true);
          if (k > 0) {
            expect(patch[k][0]).not.toBe(patch[k - 1][0]);
            if (patch[k - 1][0] === str.PATCH_OP_TYPE.INS) expect(patch[k][0]).not.toBe(str.PATCH_OP_TYPE.DEL);
          }
        }
      } catch (error) {
        logSeed({a, b});
        throw error;
      }
    }
  });
});
