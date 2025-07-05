import {PATCH_OP_TYPE, type Patch, diff, diffEdit, overlap} from '../str';
import {assertPatch} from './util';

describe('diff()', () => {
  test('returns a single equality tuple, when strings are identical', () => {
    const patch = diffEdit('hello', 'hello', 1);
    expect(patch).toEqual([[PATCH_OP_TYPE.EQL, 'hello']]);
    assertPatch('hello', 'hello', patch);
  });

  test('single character insert at the beginning', () => {
    const patch1 = diff('hello', '_hello');
    const patch2 = diffEdit('hello', '_hello', 1);
    const patch3 = diffEdit('hello', '_hello', 4);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.INS, '_'],
      [PATCH_OP_TYPE.EQL, 'hello'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.INS, '_'],
      [PATCH_OP_TYPE.EQL, 'hello'],
    ]);
    expect(patch3).toEqual([
      [PATCH_OP_TYPE.INS, '_'],
      [PATCH_OP_TYPE.EQL, 'hello'],
    ]);
    assertPatch('hello', '_hello', patch1);
    assertPatch('hello', '_hello', patch2);
    assertPatch('hello', '_hello', patch3);
  });

  test('single character insert at the end', () => {
    const patch1 = diff('hello', 'hello!');
    const patch2 = diffEdit('hello', 'hello!', 6);
    const patch3 = diffEdit('hello', 'hello!', 2);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, '!'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, '!'],
    ]);
    expect(patch3).toEqual([
      [PATCH_OP_TYPE.EQL, 'hello'],
      [PATCH_OP_TYPE.INS, '!'],
    ]);
    assertPatch('hello', 'hello!', patch1);
    assertPatch('hello', 'hello!', patch2);
    assertPatch('hello', 'hello!', patch3);
  });

  test('single character removal at the beginning', () => {
    const patch = diff('hello', 'ello');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.DEL, 'h'],
      [PATCH_OP_TYPE.EQL, 'ello'],
    ]);
    assertPatch('hello', 'ello', patch);
  });

  test('single character removal at the end', () => {
    const patch1 = diff('hello', 'hell');
    const patch2 = diffEdit('hello', 'hell', 4);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.EQL, 'hell'],
      [PATCH_OP_TYPE.DEL, 'o'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.EQL, 'hell'],
      [PATCH_OP_TYPE.DEL, 'o'],
    ]);
    assertPatch('hello', 'hell', patch1);
    assertPatch('hello', 'hell', patch2);
  });

  test('single character replacement at the beginning', () => {
    const patch1 = diff('hello', 'Hello');
    const patch2 = diffEdit('hello', 'Hello', 1);
    expect(patch1).toEqual([
      [PATCH_OP_TYPE.DEL, 'h'],
      [PATCH_OP_TYPE.INS, 'H'],
      [PATCH_OP_TYPE.EQL, 'ello'],
    ]);
    expect(patch2).toEqual([
      [PATCH_OP_TYPE.DEL, 'h'],
      [PATCH_OP_TYPE.INS, 'H'],
      [PATCH_OP_TYPE.EQL, 'ello'],
    ]);
    assertPatch('hello', 'Hello', patch1);
    assertPatch('hello', 'Hello', patch2);
  });

  test('single character replacement at the end', () => {
    const patch = diff('hello', 'hellO');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.EQL, 'hell'],
      [PATCH_OP_TYPE.DEL, 'o'],
      [PATCH_OP_TYPE.INS, 'O'],
    ]);
    assertPatch('hello', 'hellO', patch);
  });

  test('two inserts', () => {
    const src = '0123456789';
    const dst = '012__3456xx789';
    const patch = diff(src, dst);
    assertPatch(src, dst, patch);
  });

  test('two deletes', () => {
    const src = '0123456789';
    const dst = '0134589';
    const patch = diff(src, dst);
    assertPatch(src, dst, patch);
  });

  test('two inserts and two deletes', () => {
    const src = '0123456789';
    const dst = '01_245-678';
    assertPatch(src, dst);
  });

  test('emoji', () => {
    assertPatch('a🙃b', 'ab');
    assertPatch('a🙃b', 'a🙃');
    assertPatch('a🙃b', '🙃b');
    assertPatch('a🙃b', 'aasasdfdf👋b');
    assertPatch('a🙃b', 'a👋b');
  });

  test('same strings', () => {
    assertPatch('', '');
    assertPatch('1', '1');
    assertPatch('12', '12');
    assertPatch('asdf asdf asdf', 'asdf asdf asdf');
    assertPatch('a🙃b', 'a🙃b');
  });

  test('delete everything', () => {
    assertPatch('1', '');
    assertPatch('12', '');
    assertPatch('123', '');
    assertPatch('asdf asdf asdf asdf asdf', '');
    assertPatch('a🙃b', '');
  });

  test('insert into empty string', () => {
    assertPatch('', '1');
    assertPatch('', '12');
    assertPatch('', '123');
    assertPatch('', '1234');
    assertPatch('', 'asdf asdf asdf asdf asdf asdf asdf asdf asdf');
    assertPatch('', 'a🙃b');
  });

  test('common prefix', () => {
    assertPatch('abc', 'xyz');
    assertPatch('1234abcdef', '1234xyz');
    assertPatch('1234', '1234xyz');
    assertPatch('1234_', '1234xyz');
  });

  test('common suffix', () => {
    assertPatch('abcdef1234', 'xyz1234');
    assertPatch('1234abcdef', 'xyz1234');
    assertPatch('1234', 'xyz1234');
    assertPatch('_1234', 'xyz1234');
  });

  test('common overlap', () => {
    assertPatch('ab', 'bc');
    assertPatch('abc', 'abcd');
    assertPatch('ab', 'abcd');
    assertPatch('xab', 'abcd');
    assertPatch('xabc', 'abcd');
    assertPatch('xyabc', 'abcd_');
    assertPatch('12345xxx', 'xxabcd');
  });
});

describe('diffEdit()', () => {
  const assertDiffEdit = (prefix: string, edit: string, suffix: string) => {
    const src1 = prefix + suffix;
    const dst1 = prefix + edit + suffix;
    const cursor1 = prefix.length + edit.length;
    const patch1 = diffEdit(src1, dst1, cursor1);
    assertPatch(src1, dst1, patch1);
    const patch1Expected: Patch = [];
    if (prefix) patch1Expected.push([PATCH_OP_TYPE.EQL, prefix]);
    if (edit) patch1Expected.push([PATCH_OP_TYPE.INS, edit]);
    if (suffix) patch1Expected.push([PATCH_OP_TYPE.EQL, suffix]);
    expect(patch1).toEqual(patch1Expected);
    const src2 = prefix + edit + suffix;
    const dst2 = prefix + suffix;
    const cursor2 = prefix.length;
    const patch2 = diffEdit(src2, dst2, cursor2);
    assertPatch(src2, dst2, patch2);
    const patch2Expected: Patch = [];
    if (prefix) patch2Expected.push([PATCH_OP_TYPE.EQL, prefix]);
    if (edit) patch2Expected.push([PATCH_OP_TYPE.DEL, edit]);
    if (suffix) patch2Expected.push([PATCH_OP_TYPE.EQL, suffix]);
    expect(patch2).toEqual(patch2Expected);
  };

  test('can handle various inserts', () => {
    assertDiffEdit('', 'a', '');
    assertDiffEdit('a', 'b', '');
    assertDiffEdit('ab', 'c', '');
    assertDiffEdit('abc', 'd', '');
    assertDiffEdit('abcd', 'efg', '');
    assertDiffEdit('abcd', '_', 'efg');
    assertDiffEdit('abcd', '__', 'efg');
    assertDiffEdit('abcd', '___', 'efg');
    assertDiffEdit('', '_', 'var');
    assertDiffEdit('', '_', '_var');
    assertDiffEdit('a', 'b', 'c');
    assertDiffEdit('Hello', ' world', '');
    assertDiffEdit('Hello world', '!', '');
    assertDiffEdit('aaa', 'bbb', 'ccc');
    assertDiffEdit('1', '2', '3');
  });
});

describe('overlap()', () => {
  test('can compute various overlaps', () => {
    expect(overlap('abc', 'xyz')).toEqual(0);
    expect(overlap('abc', 'cxyz')).toEqual(1);
    expect(overlap('abc', 'xyzc')).toEqual(0);
    expect(overlap('abc', 'xyza')).toEqual(0);
    expect(overlap('Have some CoCo and CoCo', 'CoCo and CoCo is here.')).toEqual('CoCo and CoCo'.length);
    expect(overlap('Fire at Will', 'William Riker is number one')).toEqual('Will'.length);
  });
});
