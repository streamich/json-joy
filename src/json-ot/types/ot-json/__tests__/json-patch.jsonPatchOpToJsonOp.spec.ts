import {jsonPatchOpToJsonOp} from '../json-patch';

describe('"test"', () => {
  test('transforms "test" operation', () => {
    const op = jsonPatchOpToJsonOp({op: 'test', path: '/a/b/c', value: 'd'});
    expect(op).toStrictEqual([[['==', ['$', '/a/b/c'], 'd']]]);
  });

  test('boxes array literals', () => {
    const op = jsonPatchOpToJsonOp({op: 'test', path: '/a/b/c', value: [0]});
    expect(op).toStrictEqual([[['==', ['$', '/a/b/c'], [[0]]]]]);
  });
});

describe('"add"', () => {
  test('transforms "add" operation at root', () => {
    const op = jsonPatchOpToJsonOp({op: 'add', path: '', value: 123});
    expect(op).toStrictEqual([[], [], [[0, 123]], [[0, []]]]);
  });

  test('transforms "add" operation at nested location', () => {
    const op = jsonPatchOpToJsonOp({op: 'add', path: '/a/1/b', value: [1, 2, 3]});
    expect(op).toStrictEqual([[], [], [[0, [1, 2, 3]]], [[0, ['a', '1', 'b']]]]);
  });
});

describe('"remove"', () => {
  test('transforms "remove" operation at root', () => {
    const op = jsonPatchOpToJsonOp({op: 'remove', path: '/a/b/c'});
    expect(op).toStrictEqual([[['$?', '/a/b/c']], [[0, ['a', 'b', 'c']]]]);
  });
});

describe('"replace"', () => {
  test('transforms "replace" operation at root', () => {
    const op = jsonPatchOpToJsonOp({op: 'replace', path: '/a/b/c', value: true});
    expect(op).toStrictEqual([[['$?', '/a/b/c']], [[0, ['a', 'b', 'c']]], [[1, true]], [[1, ['a', 'b', 'c']]]]);
  });
});

describe('"move"', () => {
  test('transforms "move" operation at root', () => {
    const op = jsonPatchOpToJsonOp({op: 'move', path: '/a/b/c', from: '/a/b/d'});
    expect(op).toStrictEqual([[['$?', '/a/b/d']], [[0, ['a', 'b', 'd']]], [], [[0, ['a', 'b', 'c']]]]);
  });
});

describe('"copy"', () => {
  test('transforms "copy" operation at root', () => {
    const op = jsonPatchOpToJsonOp({op: 'copy', path: '/a/b/c', from: '/a/b/d'});
    expect(op).toStrictEqual([
      [],
      [[0, ['a', 'b', 'd']]],
      [],
      [
        [0, ['a', 'b', 'd']],
        [0, ['a', 'b', 'c']],
      ],
    ]);
  });
});
