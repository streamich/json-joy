import {b} from '@jsonjoy.com/util/lib/buffers/b';
import {toStr, toBin, diff, src, dst} from '../bin';
import {PATCH_OP_TYPE} from '../str';

describe('toHex()', () => {
  test('can convert buffer to string', () => {
    const buffer = b(1, 2, 3, 4, 5);
    const hex = toStr(buffer);
    expect(hex).toBe('\x01\x02\x03\x04\x05');
  });

  test('can convert buffer to string', () => {
    const buffer = b(0, 127, 255);
    const hex = toStr(buffer);
    expect(hex).toBe('\x00\x7f\xff');
  });
});

describe('fromHex()', () => {
  test('can convert buffer to string', () => {
    const buffer = toBin('\x01\x02\x03\x04\x05');
    expect(buffer).toEqual(b(1, 2, 3, 4, 5));
  });

  test('can convert buffer to string', () => {
    const buffer = toBin('\x00\x7f\xff');
    expect(buffer).toEqual(b(0, 127, 255));
  });
});

describe('diff()', () => {
  test('returns a single equality tuple, when buffers are identical', () => {
    const patch = diff(b(1, 2, 3), b(1, 2, 3));
    expect(patch).toEqual([[PATCH_OP_TYPE.EQUAL, toStr(b(1, 2, 3))]]);
    expect(src(patch)).toEqual(b(1, 2, 3));
    expect(dst(patch)).toEqual(b(1, 2, 3));
  });

  test('single character insert at the beginning', () => {
    const patch1 = diff(b(1, 2, 3), b(0, 1, 2, 3));
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.INSERT, toStr(b(0))],
      [PATCH_OP_TYPE.EQUAL, toStr(b(1, 2, 3))],
    ]);
    expect(src(patch1)).toEqual(b(1, 2, 3));
    expect(dst(patch1)).toEqual(b(0, 1, 2, 3));
  });

  test('single character insert at the end', () => {
    const patch1 = diff(b(1, 2, 3), b(1, 2, 3, 4));
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQUAL, toStr(b(1, 2, 3))],
      [PATCH_OP_TYPE.INSERT, toStr(b(4))],
    ]);
    expect(src(patch1)).toEqual(b(1, 2, 3));
    expect(dst(patch1)).toEqual(b(1, 2, 3, 4));
  });

  test('can delete char', () => {
    const patch1 = diff(b(1, 2, 3), b(2, 3, 4));
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.DELETE, toStr(b(1))],
      [PATCH_OP_TYPE.EQUAL, toStr(b(2, 3))],
      [PATCH_OP_TYPE.INSERT, toStr(b(4))],
    ]);
    expect(src(patch1)).toEqual(b(1, 2, 3));
    expect(dst(patch1)).toEqual(b(2, 3, 4));
  });
});
