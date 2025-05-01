import {PATCH_OP_TYPE, diff, diffEdit} from '../diff';

describe('diff()', () => {
  test('returns a single equality tuple, when strings are identical', () => {
    const patch = diffEdit('hello', 'hello', 1);
    expect(patch).toEqual([[PATCH_OP_TYPE.EQUAL, 'hello']]);
  });

  test('single character insert at the beginning', () => {
    const patch1 = diff('hello', '_hello');
    const patch2 = diffEdit('hello', '_hello', 1);
    const patch3 = diffEdit('hello', '_hello', 4);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.INSERT, '_'],
      [PATCH_OP_TYPE.EQUAL, 'hello'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.INSERT, '_'],
      [PATCH_OP_TYPE.EQUAL, 'hello'],
    ]);
    expect(patch3).toEqual([
      [PATCH_OP_TYPE.INSERT, '_'],
      [PATCH_OP_TYPE.EQUAL, 'hello'],
    ]);
  });

  test('single character insert at the end', () => {
    const patch1 = diff('hello', 'hello!');
    const patch2 = diffEdit('hello', 'hello!', 6);
    const patch3 = diffEdit('hello', 'hello!', 2);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQUAL, 'hello'],
      [PATCH_OP_TYPE.INSERT, '!'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.EQUAL, 'hello'],
      [PATCH_OP_TYPE.INSERT, '!'],
    ]);
    expect(patch3).toEqual([
      [PATCH_OP_TYPE.EQUAL, 'hello'],
      [PATCH_OP_TYPE.INSERT, '!'],
    ]);
  });

  test('single character removal at the beginning', () => {
    const patch = diff('hello', 'ello');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.DELETE, 'h'],
      [PATCH_OP_TYPE.EQUAL, 'ello'],
    ]);
  });

  test('single character removal at the end', () => {
    const patch1 = diff('hello', 'hell');
    const patch2 = diffEdit('hello', 'hell', 4);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQUAL, 'hell'],
      [PATCH_OP_TYPE.DELETE, 'o'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.EQUAL, 'hell'],
      [PATCH_OP_TYPE.DELETE, 'o'],
    ]);
  });

  test('single character replacement at the beginning', () => {
    const patch1 = diff('hello', 'Hello');
    const patch2 = diffEdit('hello', 'Hello', 1);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.DELETE, 'h'],
      [PATCH_OP_TYPE.INSERT, 'H'],
      [PATCH_OP_TYPE.EQUAL, 'ello'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.DELETE, 'h'],
      [PATCH_OP_TYPE.INSERT, 'H'],
      [PATCH_OP_TYPE.EQUAL, 'ello'],
    ]);
  });

  test('single character replacement at the end', () => {
    const patch = diff('hello', 'hellO');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.EQUAL, 'hell'],
      [PATCH_OP_TYPE.DELETE, 'o'],
      [PATCH_OP_TYPE.INSERT, 'O'],
    ]);
  });
});
