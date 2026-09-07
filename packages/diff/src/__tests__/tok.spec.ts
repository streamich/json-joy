import * as str from '../str';
import * as tok from '../tok';
import {int, logSeed, pick} from './rnd';

const reconstruct = <T>(src: T[], dst: T[], patch: tok.TokenPatch): [T[], T[]] => {
  const outSrc: T[] = [];
  const outDst: T[] = [];
  let si = 0;
  let di = 0;
  for (const [type, count] of patch) {
    if (type === str.PATCH_OP_TYPE.EQL) {
      for (let i = 0; i < count; i++) {
        outSrc.push(src[si + i]);
        outDst.push(dst[di + i]);
      }
      si += count;
      di += count;
    } else if (type === str.PATCH_OP_TYPE.DEL) {
      for (let i = 0; i < count; i++) outSrc.push(src[si + i]);
      si += count;
    } else {
      for (let i = 0; i < count; i++) outDst.push(dst[di + i]);
      di += count;
    }
  }
  return [outSrc, outDst];
};

const editDistance = (patch: tok.TokenPatch): number => {
  let sum = 0;
  for (const [type, count] of patch) if (type !== str.PATCH_OP_TYPE.EQL) sum += count;
  return sum;
};

const assertValid = <T>(src: T[], dst: T[], patch: tok.TokenPatch): void => {
  const [rs, rd] = reconstruct(src, dst, patch);
  expect(rs).toEqual(src);
  expect(rd).toEqual(dst);
  for (let i = 0; i < patch.length; i++) {
    expect(patch[i][1]).toBeGreaterThan(0);
    if (i > 0) {
      expect(patch[i][0]).not.toBe(patch[i - 1][0]);
      if (patch[i - 1][0] === str.PATCH_OP_TYPE.INS) expect(patch[i][0]).not.toBe(str.PATCH_OP_TYPE.DEL);
    }
  }
};

describe('tok.diff()', () => {
  test('empty inputs', () => {
    expect(tok.diff([], [])).toEqual([]);
    expect(tok.diff([], [1, 2])).toEqual([[str.PATCH_OP_TYPE.INS, 2]]);
    expect(tok.diff([1, 2], [])).toEqual([[str.PATCH_OP_TYPE.DEL, 2]]);
  });

  test('equal sequences', () => {
    expect(tok.diff([1, 2, 3], [1, 2, 3])).toEqual([[str.PATCH_OP_TYPE.EQL, 3]]);
  });

  test('single substitution', () => {
    expect(tok.diff(['a', 'b', 'c'], ['a', 'x', 'c'])).toEqual([
      [str.PATCH_OP_TYPE.EQL, 1],
      [str.PATCH_OP_TYPE.DEL, 1],
      [str.PATCH_OP_TYPE.INS, 1],
      [str.PATCH_OP_TYPE.EQL, 1],
    ]);
  });

  test('insertion in the middle', () => {
    expect(tok.diff(['a', 'c'], ['a', 'b', 'c'])).toEqual([
      [str.PATCH_OP_TYPE.EQL, 1],
      [str.PATCH_OP_TYPE.INS, 1],
      [str.PATCH_OP_TYPE.EQL, 1],
    ]);
  });

  test('works with number and object tokens by value/identity', () => {
    assertValid([10, 20, 30], [10, 30, 40], tok.diff([10, 20, 30], [10, 30, 40]));
    const x = {};
    const y = {};
    assertValid([x, y], [y, x], tok.diff([x, y], [y, x]));
  });

  test('fuzz: reconstruction and canonical shape', () => {
    for (let i = 0; i < 500; i++) {
      const src: number[] = [];
      const dst: number[] = [];
      const la = int(20);
      const lb = int(20);
      for (let j = 0; j < la; j++) src.push(int(5));
      for (let j = 0; j < lb; j++) dst.push(int(5));
      try {
        assertValid(src, dst, tok.diff(src, dst));
      } catch (error) {
        logSeed({src, dst});
        throw error;
      }
    }
  });

  test('fuzz: edit distance matches str.diff on single-character tokens', () => {
    for (let i = 0; i < 500; i++) {
      const src: string[] = [];
      const dst: string[] = [];
      const la = int(25);
      const lb = int(25);
      for (let j = 0; j < la; j++) src.push(pick(['a', 'b', 'c', 'd']));
      for (let j = 0; j < lb; j++) dst.push(pick(['a', 'b', 'c', 'd']));
      const a = src.join('');
      const b = dst.join('');
      const tokDist = editDistance(tok.diff(src, dst));
      let strDist = 0;
      for (const [type, txt] of str.diff(a, b)) if (type !== str.PATCH_OP_TYPE.EQL) strDist += txt.length;
      try {
        expect(tokDist).toBe(strDist);
      } catch (error) {
        logSeed({a, b, tokDist, strDist});
        throw error;
      }
    }
  });
});
