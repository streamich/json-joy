import {semantic} from '../optimize';
import {diff, dst as getDst, src as getSrc, PATCH_OP_TYPE, type Patch} from '../str';
import {int, logSeed, pick} from './rnd';

const isWellFormed = (str: string): boolean => {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = str.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
};

describe('semantic()', () => {
  test('passes through empty patches', () => {
    expect(semantic([])).toEqual([]);
  });

  test('does not eliminate equalities larger than the surrounding edits', () => {
    const a: Patch = [
      [PATCH_OP_TYPE.DEL, 'ab'],
      [PATCH_OP_TYPE.INS, 'cd'],
      [PATCH_OP_TYPE.EQL, '12'],
      [PATCH_OP_TYPE.DEL, 'e'],
    ];
    expect(semantic(a)).toEqual(a);
    const b: Patch = [
      [PATCH_OP_TYPE.DEL, 'abc'],
      [PATCH_OP_TYPE.INS, 'ABC'],
      [PATCH_OP_TYPE.EQL, '1234'],
      [PATCH_OP_TYPE.DEL, 'wxyz'],
    ];
    expect(semantic(b)).toEqual(b);
  });

  test('eliminates a small equality between edits', () => {
    expect(
      semantic([
        [PATCH_OP_TYPE.DEL, 'a'],
        [PATCH_OP_TYPE.EQL, 'b'],
        [PATCH_OP_TYPE.DEL, 'c'],
      ]),
    ).toEqual([
      [PATCH_OP_TYPE.DEL, 'abc'],
      [PATCH_OP_TYPE.INS, 'b'],
    ]);
  });

  test('re-evaluates the previous equality after an elimination', () => {
    expect(
      semantic([
        [PATCH_OP_TYPE.DEL, 'ab'],
        [PATCH_OP_TYPE.EQL, 'cd'],
        [PATCH_OP_TYPE.DEL, 'e'],
        [PATCH_OP_TYPE.EQL, 'f'],
        [PATCH_OP_TYPE.INS, 'g'],
      ]),
    ).toEqual([
      [PATCH_OP_TYPE.DEL, 'abcdef'],
      [PATCH_OP_TYPE.INS, 'cdfg'],
    ]);
  });

  test('performs multiple eliminations', () => {
    expect(
      semantic([
        [PATCH_OP_TYPE.INS, '1'],
        [PATCH_OP_TYPE.EQL, 'A'],
        [PATCH_OP_TYPE.DEL, 'B'],
        [PATCH_OP_TYPE.INS, '2'],
        [PATCH_OP_TYPE.EQL, '_'],
        [PATCH_OP_TYPE.INS, '1'],
        [PATCH_OP_TYPE.EQL, 'A'],
        [PATCH_OP_TYPE.DEL, 'B'],
        [PATCH_OP_TYPE.INS, '2'],
      ]),
    ).toEqual([
      [PATCH_OP_TYPE.DEL, 'AB_AB'],
      [PATCH_OP_TYPE.INS, '1A2_1A2'],
    ]);
  });

  test('aligns edits to word boundaries', () => {
    expect(
      semantic([
        [PATCH_OP_TYPE.EQL, 'The c'],
        [PATCH_OP_TYPE.DEL, 'ow and the c'],
        [PATCH_OP_TYPE.EQL, 'at.'],
      ]),
    ).toEqual([
      [PATCH_OP_TYPE.EQL, 'The '],
      [PATCH_OP_TYPE.DEL, 'cow and the '],
      [PATCH_OP_TYPE.EQL, 'cat.'],
    ]);
  });

  test('does not extract an overlap smaller than half the edits', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.DEL, 'abcxx'],
      [PATCH_OP_TYPE.INS, 'xxdef'],
    ];
    expect(semantic(patch)).toEqual(patch);
  });

  test('extracts a forward overlap into an equality', () => {
    expect(
      semantic([
        [PATCH_OP_TYPE.DEL, 'abcxxx'],
        [PATCH_OP_TYPE.INS, 'xxxdef'],
      ]),
    ).toEqual([
      [PATCH_OP_TYPE.DEL, 'abc'],
      [PATCH_OP_TYPE.EQL, 'xxx'],
      [PATCH_OP_TYPE.INS, 'def'],
    ]);
  });

  test('extracts a reverse overlap into an equality', () => {
    expect(
      semantic([
        [PATCH_OP_TYPE.DEL, 'xxxabc'],
        [PATCH_OP_TYPE.INS, 'defxxx'],
      ]),
    ).toEqual([
      [PATCH_OP_TYPE.INS, 'def'],
      [PATCH_OP_TYPE.EQL, 'xxx'],
      [PATCH_OP_TYPE.DEL, 'abc'],
    ]);
  });

  test('does not mutate the input patch', () => {
    const patch: Patch = [
      [PATCH_OP_TYPE.DEL, 'a'],
      [PATCH_OP_TYPE.EQL, 'b'],
      [PATCH_OP_TYPE.DEL, 'c'],
    ];
    const before = JSON.parse(JSON.stringify(patch));
    semantic(patch);
    expect(patch).toEqual(before);
  });

  test('fuzz: reconstruction, well-formed, normalized, canonical, stable under re-application', () => {
    const pool = ['a', 'b', 'c', ' ', '\n', '. ', 'the ', 'cat ', 'xxx', '😀', '🙂', 'é', '中'];
    for (let i = 0; i < 300; i++) {
      let a = '';
      let b = '';
      const la = int(18);
      const lb = int(18);
      for (let j = 0; j < la; j++) a += pick(pool);
      for (let j = 0; j < lb; j++) b += pick(pool);
      const patch = diff(a, b);
      try {
        const out = semantic(patch);
        expect(getSrc(out)).toBe(a);
        expect(getDst(out)).toBe(b);
        for (let j = 0; j < out.length; j++) {
          expect(out[j][1]).not.toBe('');
          expect(isWellFormed(out[j][1])).toBe(true);
          if (j > 0) {
            expect(out[j][0]).not.toBe(out[j - 1][0]);
            if (out[j - 1][0] === PATCH_OP_TYPE.INS) expect(out[j][0]).not.toBe(PATCH_OP_TYPE.DEL);
          }
        }
        // Not idempotent (a single-pass heuristic), but a second pass stays valid.
        const twice = semantic(out);
        expect(getSrc(twice)).toBe(a);
        expect(getDst(twice)).toBe(b);
      } catch (error) {
        logSeed({a, b});
        throw error;
      }
    }
  });
});
