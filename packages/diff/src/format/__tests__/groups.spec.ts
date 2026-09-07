import {groups} from '../groups';
import {GROUP_TYPE, HUNK_OP_TYPE} from '../types';
import {diff} from './util';

const tile = (a: string, b: string, ignorable?: (op: HUNK_OP_TYPE, index: number) => boolean): number[][] => {
  const {patch} = diff(a, b);
  return groups(patch, {ignorable}).map((g) => [g.type, g.srcFrom, g.srcUpto, g.dstFrom, g.dstUpto]);
};

describe('groups()', () => {
  test('two identical files are one unchanged group', () => {
    expect(tile('a\nb\n', 'a\nb\n')).toEqual([[GROUP_TYPE.UNCHANGED, 0, 2, 0, 2]]);
  });

  test('two empty files tile into nothing at all', () => {
    expect(tile('', '')).toEqual([]);
  });

  test('a change is three groups', () => {
    expect(tile('a\nb\nc\n', 'a\nX\nc\n')).toEqual([
      [GROUP_TYPE.UNCHANGED, 0, 1, 0, 1],
      [GROUP_TYPE.CHANGED, 1, 2, 1, 2],
      [GROUP_TYPE.UNCHANGED, 2, 3, 2, 3],
    ]);
  });

  test('an insert and a delete are one-sided groups', () => {
    expect(tile('a\nc\n', 'a\nb\nc\n')).toEqual([
      [GROUP_TYPE.UNCHANGED, 0, 1, 0, 1],
      [GROUP_TYPE.NEW, 1, 1, 1, 2],
      [GROUP_TYPE.UNCHANGED, 1, 2, 2, 3],
    ]);
    expect(tile('a\nb\nc\n', 'a\nc\n')).toEqual([
      [GROUP_TYPE.UNCHANGED, 0, 1, 0, 1],
      [GROUP_TYPE.OLD, 1, 2, 1, 1],
      [GROUP_TYPE.UNCHANGED, 2, 3, 1, 2],
    ]);
  });

  test('a change at the very start emits no empty unchanged group before it', () => {
    expect(tile('a\n', 'X\n')).toEqual([[GROUP_TYPE.CHANGED, 0, 1, 0, 1]]);
  });

  test('the groups cover both files with no gaps', () => {
    const a = 'a\nb\nc\nd\ne\nf\n';
    const b = 'a\nX\nc\nd\nY\nZ\n';
    let src = 0;
    let dst = 0;
    for (const [, srcFrom, srcUpto, dstFrom, dstUpto] of tile(a, b)) {
      expect(srcFrom).toBe(src);
      expect(dstFrom).toBe(dst);
      src = srcUpto;
      dst = dstUpto;
    }
    expect(src).toBe(6);
    expect(dst).toBe(6);
  });

  test('an ignorable run joins the unchanged group around it', () => {
    const blank = (op: HUNK_OP_TYPE, index: number): boolean => (op === HUNK_OP_TYPE.INS ? index : index) >= 0;
    expect(tile('a\nb\n', 'a\n\nb\n', blank)).toEqual([[GROUP_TYPE.UNCHANGED, 0, 2, 0, 3]]);
  });
});
