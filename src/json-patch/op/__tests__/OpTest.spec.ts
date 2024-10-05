import {OpTest} from '../OpTest';
import {toPath} from '@jsonjoy.com/json-pointer';

test('JSON stringifies to correct value without extra keys', () => {
  const op = new OpTest(toPath('/foo/bar'), 'test', false);
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'test',
    path: '/foo/bar',
    value: 'test',
  });
});

test('JSON stringifies to correct value without extra keys - 2', () => {
  const op = new OpTest(toPath('/foo/bar'), 'test', true);
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'test',
    path: '/foo/bar',
    value: 'test',
    not: true,
  });
});

describe('apply()', () => {
  test('succeeds when value exists and matches', () => {
    const op = new OpTest(toPath('/foo'), 123, false);
    const res = op.apply({foo: 123});
    expect(res).toEqual({
      doc: {foo: 123},
    });
  });

  test('throws when values does not match', () => {
    const op = new OpTest(toPath('/foo'), '123', false);
    expect(() => op.apply({foo: 123})).toThrowErrorMatchingInlineSnapshot(`"TEST"`);
  });

  test('with "not", succeeds when values does not match', () => {
    const op = new OpTest(toPath('/foo'), '123', true);
    op.apply({foo: 123});
  });

  test('with "not", succeeds when values is not found', () => {
    const op = new OpTest(toPath('/asdfasdf'), '123', true);
    op.apply({foo: 123});
  });

  describe('RFC 6902, Section 4.6.', () => {
    test('strings: are considered equal if they contain the same number of Unicode characters and their code points are byte-by-byte equal.', () => {
      const op = new OpTest(toPath(''), '123', false);
      op.apply('123');
      expect(() => op.apply('1234')).toThrowErrorMatchingInlineSnapshot(`"TEST"`);
    });

    test('numbers: are considered equal if their values are numerically equal.', () => {
      const op = new OpTest(toPath(''), 123, false);
      op.apply(123);
      expect(() => op.apply(0)).toThrowErrorMatchingInlineSnapshot(`"TEST"`);
    });

    test('arrays: are considered equal if they contain the same number of values, and if each value can be considered equal to the value at the corresponding position in the other array, using this list of type-specific rules.', () => {
      const op = new OpTest(toPath(''), [1, 2, {foo: 'bar'}], false);
      op.apply([1, 2, {foo: 'bar'}]);
      expect(() => op.apply([1, 2, {foo: 'bar!'}])).toThrowErrorMatchingInlineSnapshot(`"TEST"`);
    });

    test('objects: are considered equal if they contain the same number of members, and if each member can be considered equal to a member in the other object, by comparing their keys (as strings) and their values (using this list of type-specific rules).', () => {
      const op = new OpTest(toPath(''), {foo: {bar: {}}}, false);
      op.apply({foo: {bar: {}}});
      expect(() => op.apply({foo: {bar: {a: 1}}})).toThrowErrorMatchingInlineSnapshot(`"TEST"`);
    });

    test('literals (false, true, and null): are considered equal if they are the same.', () => {
      new OpTest(toPath(''), true, false).apply(true);
      new OpTest(toPath(''), false, false).apply(false);
      new OpTest(toPath(''), null, false).apply(null);
      expect(() => new OpTest(toPath(''), null, false).apply(false)).toThrowErrorMatchingInlineSnapshot(`"TEST"`);
      expect(() => new OpTest(toPath(''), true, false).apply(false)).toThrowErrorMatchingInlineSnapshot(`"TEST"`);
    });
  });
});
