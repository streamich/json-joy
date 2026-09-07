import {diff, dst as getDst} from '../str';
import {assertPatch, rounds, slow} from './util';

const rnd = (n: number): number => Math.floor(Math.random() * n);

const isWellFormed = (str: string): boolean => {
  const length = str.length;
  for (let i = 0; i < length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = str.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
};

/**
 * Beyond `assertPatch` (reconstruction, apply, invert), asserts that the patch
 * is normalized (no empty ops, no adjacent ops of the same type) and, for
 * well-formed inputs, that no op text contains a lone surrogate.
 */
const assertStrongInvariants = (src: string, dst: string, wellFormed: boolean): void => {
  const patch = diff(src, dst);
  assertPatch(src, dst, patch);
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    expect(patch[i][1]).not.toBe('');
    if (i > 0) expect(patch[i][0]).not.toBe(patch[i - 1][0]);
    if (wellFormed) expect(isWellFormed(patch[i][1])).toBe(true);
  }
};

const wellFormedPool = [
  'a',
  'b',
  'c',
  'x',
  '\n',
  ' ',
  'word',
  '😀',
  '😁',
  '🙂',
  '🤪',
  '👍',
  '❤️',
  '👨‍👩‍👧‍👦',
  '👩🏽‍🚀',
  '🇺🇸',
  '🇬🇧',
  'é',
  'à́',
  '中',
  '日本語',
  '‍',
  '️',
];

/** Random codepoint-safe string, so lone surrogates never enter the input. */
const genWellFormed = (maxLen: number): string[] => {
  const arr: string[] = [];
  const len = rnd(maxLen);
  for (let i = 0; i < len; i++) arr.push(wellFormedPool[rnd(wellFormedPool.length)]);
  return arr;
};

test('fuzz: well-formed unicode strings produce valid, normalized, well-formed patches', () => {
  for (let i = 0; i < rounds(3000); i++) {
    const src = genWellFormed(20);
    let dst: string[];
    if (Math.random() < 0.5) {
      // Mutate src into dst at codepoint boundaries, simulating edits.
      dst = [...src];
      const edits = 1 + rnd(4);
      for (let e = 0; e < edits; e++) {
        const at = rnd(dst.length + 1);
        if (Math.random() < 0.5) dst.splice(at, 0, wellFormedPool[rnd(wellFormedPool.length)]);
        else dst.splice(at, rnd(3));
      }
    } else {
      dst = genWellFormed(20);
    }
    const a = src.join('');
    const b = dst.join('');
    try {
      assertStrongInvariants(a, b, true);
    } catch (error) {
      console.log('SRC', JSON.stringify(a));
      console.log('DST', JSON.stringify(b));
      throw error;
    }
  }
});

/**
 * Every pair of strings up to `MAX_LEN` codepoints over the alphabet below. The
 * pair count is the number of strings squared, so the last length costs more
 * than every shorter one together and the default lane stops one short of it;
 * `RUN_SLOW_TESTS=1` runs the full three-codepoint sweep.
 */
const MAX_LEN = slow ? 3 : 2;

test('exhaustive: all short well-formed string pairs', () => {
  const alphabet = ['a', 'b', '😀', '😁', '🤪'];
  const strs: string[] = [''];
  for (let len = 1; len <= MAX_LEN; len++) {
    const prev = strs.filter((s) => [...s].length === len - 1);
    for (const p of prev) for (const u of alphabet) strs.push(p + u);
  }
  for (const a of strs) {
    for (const b of strs) {
      try {
        assertStrongInvariants(a, b, true);
      } catch (error) {
        console.log('SRC', JSON.stringify(a));
        console.log('DST', JSON.stringify(b));
        throw error;
      }
    }
  }
});

/**
 * Regression tests for the fixed lone-surrogate bugs (str-01, str-02),
 * tracked in `.docs/json-joy/diff/issues/` in the monorepo.
 */
describe('ill-formed inputs (lone surrogates)', () => {
  // str-01-lone-surrogate-stack-overflow
  test('shared lone high surrogate prefix does not stack-overflow', () => {
    assertStrongInvariants('\ud83da', '\ud83dba', false);
  });

  // str-07-cleanup-shift-shave-oscillation
  test('cleanup shave/shift oscillation does not recurse forever', () => {
    const src = '\ud83d\ud83e👨‍👩‍👧‍👦😀👨‍👩‍👧‍👦word\ude00😀🙂\ud83d\udbff\ud83d';
    const dst = 'b👨‍👩‍👧‍👦\ud83d';
    assertStrongInvariants(src, dst, false);
  });

  // str-02-cleanupmerge-absorb-corruption
  test('stray surrogate shaving does not lose dst characters', () => {
    const src = 'b\ud83d😀';
    const dst = '\ud83d🙂\ud83d\ud83e🨁';
    const patch = diff(src, dst);
    expect(getDst(patch)).toBe(dst);
  });

  test('fuzz: ill-formed inputs still reconstruct src and dst', () => {
    const pool = [
      'a',
      'b',
      'word',
      '\n',
      '\ud83d',
      '\ud83e',
      '\ude00',
      '\ude01',
      '\udbff',
      '\udfff',
      '😀',
      '🙂',
      '👨‍👩‍👧‍👦',
      '中',
    ];
    for (let i = 0; i < rounds(2000); i++) {
      let a = '';
      let b = '';
      const la = rnd(17);
      const lb = rnd(17);
      for (let j = 0; j < la; j++) a += pool[rnd(pool.length)];
      for (let j = 0; j < lb; j++) b += pool[rnd(pool.length)];
      try {
        assertStrongInvariants(a, b, false);
      } catch (error) {
        console.log('SRC', JSON.stringify(a));
        console.log('DST', JSON.stringify(b));
        throw error;
      }
    }
  });
});
