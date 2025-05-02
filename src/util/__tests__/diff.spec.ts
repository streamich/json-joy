import {PATCH_OP_TYPE, diff, diffEdit} from '../diff';
import {assertPatch} from './util';

describe('diff()', () => {
  test('returns a single equality tuple, when strings are identical', () => {
    const patch = diffEdit('hello', 'hello', 1);
    expect(patch).toEqual([[PATCH_OP_TYPE.EQUAL, 'hello']]);
    assertPatch('hello', 'hello', patch);
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
    assertPatch('hello', '_hello', patch1);
    assertPatch('hello', '_hello', patch2);
    assertPatch('hello', '_hello', patch3);
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
    assertPatch('hello', 'hello!', patch1);
    assertPatch('hello', 'hello!', patch2);
    assertPatch('hello', 'hello!', patch3);
  });

  test('single character removal at the beginning', () => {
    const patch = diff('hello', 'ello');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.DELETE, 'h'],
      [PATCH_OP_TYPE.EQUAL, 'ello'],
    ]);
    assertPatch('hello', 'ello', patch);
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
    assertPatch('hello', 'hell', patch1);
    assertPatch('hello', 'hell', patch2);
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
    assertPatch('hello', 'Hello', patch1);
    assertPatch('hello', 'Hello', patch2);
  });

  test('single character replacement at the end', () => {
    const patch = diff('hello', 'hellO');
    expect(patch).toEqual([
      [PATCH_OP_TYPE.EQUAL, 'hell'],
      [PATCH_OP_TYPE.DELETE, 'o'],
      [PATCH_OP_TYPE.INSERT, 'O'],
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
});
