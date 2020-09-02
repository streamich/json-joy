import {OpRemove} from '../OpRemove';

test('JSON stringifies to correct value without extra keys', () => {
  const op = new OpRemove(['foo', 'bar'], undefined);
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'remove',
    path: '/foo/bar',
  });
});

test('JSON stringifies to correct value without extra keys - 2', () => {
  const op = new OpRemove(['foo', 'bar'], 'test');
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'remove',
    path: '/foo/bar',
    oldValue: 'test',
  });
});

describe('apply()', () => {
  test('can add remove key from object', () => {
    const op = new OpRemove(['foo'], undefined);
    const res = op.apply({foo: {a: 1}});
    expect(res).toEqual({
      doc: {},
      old: {a: 1},
    });
  });

  test('throws when deleting a non-existing key', () => {
    const op = new OpRemove(['foo'], undefined);
    expect(() => op.apply({bar: 123})).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
  });

  test('removing root sets document to null', () => {
    const op = new OpRemove([], undefined);
    const res = op.apply({foo: {a: 1}});
    expect(res).toEqual({
      doc: null,
      old: {foo: {a: 1}},
    });
  });

  test('can remove last member of array', () => {
    const op = new OpRemove(['2'], undefined);
    const res = op.apply([1, 2, 3]);
    expect(res).toEqual({
      doc: [1, 2],
      old: 3,
    });
  });

  test('can remove first member of array', () => {
    const op = new OpRemove(['0'], undefined);
    const res = op.apply([1, 2, 3]);
    expect(res).toEqual({
      doc: [2, 3],
      old: 1,
    });
  });

  test('throws when removing elements beyond array boundaries', () => {
    expect(() => new OpRemove(['4'], undefined).apply([1, 2, 3])).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
    expect(() => new OpRemove(['5'], undefined).apply([1, 2, 3])).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
  });

  describe('RFC 6902, Section 4.2.', () => {
    test('If removing an element from an array, any elements above the specified index are shifted one position to the left.', () => {
      const op = new OpRemove(['1'], undefined);
      const res = op.apply([1, 2, 3]);
      expect(res).toEqual({
        doc: [1, 3],
        old: 2,
      });
    });
  });
});
