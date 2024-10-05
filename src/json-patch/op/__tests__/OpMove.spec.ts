import {OpMove} from '../OpMove';
import {toPath} from '@jsonjoy.com/json-pointer';

test('JSON stringifies to correct value without extra keys', () => {
  const op = new OpMove(toPath('/foo/bar'), toPath('/foo/baz'));
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'move',
    path: '/foo/bar',
    from: '/foo/baz',
  });
});

describe('apply()', () => {
  test('can move an object key', () => {
    const op = new OpMove(toPath('/bar'), toPath('/foo'));
    const res = op.apply({foo: 123});
    expect(res).toEqual({
      doc: {bar: 123},
      old: undefined,
    });
  });

  describe('RFC 6902, Section 4.4.', () => {
    test('The "from" location MUST NOT be a proper prefix of the "path" location; i.e., a location cannot be moved into one of its children.', () => {
      expect(() =>
        new OpMove(toPath('/foo/bar'), toPath('/foo')).apply({foo: {bar: 123}}),
      ).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
    });

    describe('The "move" operation removes the value at a specified location and adds it to the target location.', () => {
      test('object to object', () => {
        const op = new OpMove(toPath('/bar/b'), toPath('/foo/a'));
        const res = op.apply({
          foo: {a: 1},
          bar: {b: 2},
        });
        expect(res).toEqual({
          doc: {
            foo: {},
            bar: {b: 1},
          },
          old: 2,
        });
      });

      test('object to array', () => {
        const op = new OpMove(toPath('/bar/1'), toPath('/foo/a'));
        const res = op.apply({
          foo: {a: 1},
          bar: [0],
        });
        expect(res).toEqual({
          doc: {
            foo: {},
            bar: [0, 1],
          },
          old: undefined,
        });
      });

      test('array to array', () => {
        const op = new OpMove(toPath('/bar/0'), toPath('/foo/0'));
        const res = op.apply({
          foo: [1],
          bar: [0],
        });
        expect(res).toEqual({
          doc: {
            foo: [],
            bar: [1, 0],
          },
          old: 0,
        });
      });

      test('array to object', () => {
        const op = new OpMove(toPath('/bar/b'), toPath('/foo/0'));
        const res = op.apply({
          foo: [1],
          bar: {a: 0},
        });
        expect(res).toEqual({
          doc: {
            foo: [],
            bar: {a: 0, b: 1},
          },
          old: undefined,
        });
      });
    });
  });
});
