import {OpCopy} from '../OpCopy';
import {toPath} from '@jsonjoy.com/json-pointer';

test('JSON stringifies to correct value without extra keys', () => {
  const op = new OpCopy(toPath('/foo/bar'), toPath('/foo/baz'));
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'copy',
    path: '/foo/bar',
    from: '/foo/baz',
  });
});

describe('apply()', () => {
  test('can add new key to object', () => {
    const op = new OpCopy(toPath('/foo/bar'), toPath('/source'));
    const res = op.apply({foo: {}, source: 123});
    expect(res).toEqual({
      doc: {foo: {bar: 123}, source: 123},
      old: undefined,
    });
  });

  test('can add new key to object', () => {
    const op = new OpCopy(toPath('/foo/bar'), toPath('/source'));
    const res = op.apply({foo: {}, source: 123});
    expect(res).toEqual({
      doc: {foo: {bar: 123}, source: 123},
      old: undefined,
    });
  });

  test('when adding element past array boundary, throws', () => {
    const op = new OpCopy(toPath('/a/100'), toPath('/source'));
    expect(() => op.apply({a: [0], source: 123})).toThrowErrorMatchingInlineSnapshot(`"INVALID_INDEX"`);
  });

  test('can copy parent into child (deal with recursive reference)', () => {
    const op = new OpCopy(toPath('/source/target'), toPath('/source'));
    const res = op.apply({source: {target: 0, foo: 1}});
    expect(res).toEqual({
      doc: {source: {target: {target: 0, foo: 1}, foo: 1}},
      old: 0,
    });
  });

  describe('RFC 6902, Section 4.5.', () => {
    test('The "copy" operation copies the value at a specified location to the target location.', () => {
      const op = new OpCopy(toPath('/a'), toPath('/b'));
      const res = op.apply({a: 1, b: 2});
      expect(res).toEqual({
        doc: {a: 2, b: 2},
        old: 1,
      });
    });

    test('The "from" location MUST exist for the operation to be successful.', () => {
      const op = new OpCopy(toPath('/a'), toPath('/b'));
      expect(() => op.apply({a: 1})).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
    });
  });
});
