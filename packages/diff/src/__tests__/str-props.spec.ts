import {diff, diffEdit, dst as getDst, src as getSrc, invert, normalize, PATCH_OP_TYPE, type Patch} from '../str';
import {int, logSeed, pick} from './rnd';
import {assertPatch, isWellFormed} from './util';

const fastDiff = require('fast-diff') as typeof diff;

const wellFormed = ['a', 'b', 'c', 'x', ' ', '\n', 'word', '😀', '😁', '🙂', '❤️', '👨‍👩‍👧‍👦', '🇺🇸', 'é', '中'];
const illFormed = [...wellFormed, '\ud83d', '\ud83e', '\ude00', '\udfff'];

const gen = (pool: string[], maxLen: number): string => {
  let str = '';
  const len = int(maxLen);
  for (let i = 0; i < len; i++) str += pick(pool);
  return str;
};

const iterations = 300;

test('diff() is deterministic', () => {
  for (let i = 0; i < iterations; i++) {
    const a = gen(illFormed, 20);
    const b = gen(illFormed, 20);
    expect(diff(a, b)).toEqual(diff(a, b));
  }
});

test('invert() round-trips', () => {
  for (let i = 0; i < iterations; i++) {
    const patch = diff(gen(illFormed, 20), gen(illFormed, 20));
    expect(invert(invert(patch))).toEqual(patch);
  }
});

test('normalize() is idempotent and a no-op on diff() output', () => {
  const types = [PATCH_OP_TYPE.DEL, PATCH_OP_TYPE.EQL, PATCH_OP_TYPE.INS];
  for (let i = 0; i < iterations; i++) {
    const patch = diff(gen(illFormed, 20), gen(illFormed, 20));
    expect(normalize(patch)).toEqual(patch);
    const raw: Patch = [];
    const len = int(8);
    for (let j = 0; j < len; j++) raw.push([pick(types), gen(wellFormed, 3)] as Patch[number]);
    const once = normalize(raw.map((op) => [...op] as Patch[number]));
    expect(normalize(once.map((op) => [...op] as Patch[number]))).toEqual(once);
  }
});

test('edit runs are ordered DEL before INS', () => {
  for (let i = 0; i < iterations; i++) {
    const a = gen(illFormed, 20);
    const b = gen(illFormed, 20);
    const patch = diff(a, b);
    for (let j = 1; j < patch.length; j++) {
      if (patch[j - 1][0] === PATCH_OP_TYPE.INS && patch[j][0] === PATCH_OP_TYPE.DEL) {
        logSeed({a, b, patch});
        throw new Error('INS followed by DEL');
      }
    }
  }
});

test('edit volume stays within 2x of fast-diff', () => {
  const vol = (patch: Patch): number => {
    let sum = 0;
    for (const [type, txt] of patch) if (type !== PATCH_OP_TYPE.EQL) sum += txt.length;
    return sum;
  };
  for (let i = 0; i < iterations; i++) {
    const a = gen(wellFormed, 25);
    const b = gen(wellFormed, 25);
    const ours = vol(diff(a, b));
    const theirs = vol(fastDiff(a, b));
    if (ours > theirs * 2 + 8) {
      logSeed({a, b, ours, theirs});
      throw new Error('diff quality regression vs fast-diff');
    }
  }
});

test('diffEdit() is safe for any caret, including mid-pair and out-of-range', () => {
  for (let i = 0; i < iterations; i++) {
    const a = gen(wellFormed, 20);
    const b = gen(wellFormed, 20);
    const caret = int(b.length + 5) - 2;
    const patch = diffEdit(a, b, caret);
    try {
      expect(getSrc(patch)).toBe(a);
      expect(getDst(patch)).toBe(b);
      for (const [, txt] of patch) expect(isWellFormed(txt)).toBe(true);
      assertPatch(a, b, patch);
    } catch (error) {
      logSeed({a, b, caret});
      throw error;
    }
  }
});
