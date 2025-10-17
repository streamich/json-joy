import {OpAdd} from '../OpAdd';
import {toPath} from '@jsonjoy.com/json-pointer';

test('JSON stringifies to correct value without extra keys', () => {
  const op = new OpAdd(toPath('/foo/bar'), 123);
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'add',
    path: '/foo/bar',
    value: 123,
  });
});

describe('apply()', () => {
  test('can add new key to object', () => {
    const op = new OpAdd(toPath('/foo/bar'), 123);
    const res = op.apply({foo: {}});
    expect(res).toEqual({
      doc: {foo: {bar: 123}},
      old: undefined,
    });
  });

  test('can add new key to object', () => {
    const op = new OpAdd(toPath('/foo/bar'), 123);
    const res = op.apply({foo: {}});
    expect(res).toEqual({
      doc: {foo: {bar: 123}},
      old: undefined,
    });
  });

  test('when adding element past array boundary, throws', () => {
    const op = new OpAdd(toPath('/100'), 1);
    expect(() => op.apply([0])).toThrow();
  });

  describe('RFC 6902, Section 4.1.', () => {
    test('The root of the target document - whereupon the specified value becomes the entire content of the target document.', () => {
      const op = new OpAdd(toPath(''), 123);
      const res = op.apply({
        a: 1,
      });
      expect(res).toEqual({
        doc: 123,
        old: {a: 1},
      });
    });

    test('If the target location specifies an object member that does not already exist, a new member is added to the object.', () => {
      const op = new OpAdd(toPath('/foo/z'), {test: {}});
      const res = op.apply({
        foo: {
          a: 'b',
        },
      });
      expect(res).toEqual({
        doc: {
          foo: {
            a: 'b',
            z: {test: {}},
          },
        },
        old: undefined,
      });
    });

    test("If the target location specifies an object member that does exist, that member's value is replaced.", () => {
      const op = new OpAdd(toPath('/a'), 2);
      const res = op.apply({
        a: 1,
      });
      expect(res).toEqual({
        doc: {a: 2},
        old: 1,
      });
    });

    test('If the "-" character is used to index the end of the array, this has the effect of appending the value to the array.', () => {
      const op = new OpAdd(toPath('/-'), 4);
      const res = op.apply([1, 2, 3]);
      expect(res).toEqual({
        doc: [1, 2, 3, 4],
        old: undefined,
      });
    });

    describe('If the target location specifies an array index, a new value is inserted into the array at the specified index.', () => {
      test('at the beginning of array', () => {
        const op = new OpAdd(toPath('/0'), 0);
        const res = op.apply([1, 2, 3]);
        expect(res).toEqual({
          doc: [0, 1, 2, 3],
          old: 1,
        });
      });

      test('in the middle of array', () => {
        const op = new OpAdd(toPath('/1'), 0);
        const res = op.apply([1, 2, 3]);
        expect(res).toEqual({
          doc: [1, 0, 2, 3],
          old: 2,
        });
      });

      test('at the end of array', () => {
        const op = new OpAdd(toPath('/3'), 0);
        const res = op.apply([1, 2, 3]);
        expect(res).toEqual({
          doc: [1, 2, 3, 0],
          old: undefined,
        });
      });
    });
  });
});
