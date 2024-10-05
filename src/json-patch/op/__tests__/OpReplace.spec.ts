import {OpReplace} from '../OpReplace';
import {OpRemove} from '../OpRemove';
import {OpAdd} from '../OpAdd';
import {toPath} from '@jsonjoy.com/json-pointer';

test('JSON stringifies to correct value without extra keys', () => {
  const op = new OpReplace(toPath('/foo/bar'), 123, 456);
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'replace',
    path: '/foo/bar',
    value: 123,
    oldValue: 456,
  });
});

test('JSON stringifies to correct value without extra keys - 2', () => {
  const op = new OpReplace(toPath('/foo/bar'), 123, undefined);
  const json = JSON.stringify(op.toJson());
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    op: 'replace',
    path: '/foo/bar',
    value: 123,
  });
});

describe('apply()', () => {
  test('can add replace a key in object', () => {
    const op = new OpReplace(toPath('/foo'), 123, undefined);
    const res = op.apply({foo: {a: 1}});
    expect(res).toEqual({
      doc: {foo: 123},
      old: {a: 1},
    });
  });

  describe('RFC 6902, Section 4.3.', () => {
    describe('The "replace" operation replaces the value at the target location with a new value.', () => {
      test('at root', () => {
        const op = new OpReplace(toPath(''), 2, undefined);
        const res = op.apply(1);
        expect(res).toEqual({
          doc: 2,
          old: 1,
        });
      });

      test('at start of array', () => {
        const op = new OpReplace(toPath('/0'), 0, undefined);
        const res = op.apply([1, 2, 3]);
        expect(res).toEqual({
          doc: [0, 2, 3],
          old: 1,
        });
      });

      test('in middle of array', () => {
        const op = new OpReplace(toPath('/1'), 0, undefined);
        const res = op.apply([1, 2, 3]);
        expect(res).toEqual({
          doc: [1, 0, 3],
          old: 2,
        });
      });

      test('at end of array', () => {
        const op = new OpReplace(toPath('/2'), 0, undefined);
        const res = op.apply([1, 2, 3]);
        expect(res).toEqual({
          doc: [1, 2, 0],
          old: 3,
        });
      });

      test('in object', () => {
        const op = new OpReplace(toPath('/foo'), 0, undefined);
        const res = op.apply({foo: 'bar'});
        expect(res).toEqual({
          doc: {foo: 0},
          old: 'bar',
        });
      });
    });

    describe('The target location MUST exist for the operation to be successful.', () => {
      test('in array', () => {
        const op = new OpReplace(toPath('/5'), 0, undefined);
        expect(() => op.apply([1, 2, 3])).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
      });

      test('in object', () => {
        const op = new OpReplace(toPath('/5'), 0, undefined);
        expect(() => op.apply({foo: 123})).toThrowErrorMatchingInlineSnapshot(`"NOT_FOUND"`);
      });
    });

    describe('This operation is functionally identical to a "remove" operation for a value, followed immediately by an "add" operation at the same location with the replacement value.', () => {
      test('replacing last array element', () => {
        const op1 = new OpReplace(toPath('/2'), 0, undefined);
        const op2 = new OpRemove(toPath('/2'), undefined);
        const op3 = new OpAdd(toPath('/2'), 0);

        const res1 = op1.apply([1, 2, 3]);
        const res2 = op3.apply(op2.apply([1, 2, 3]).doc);

        expect(res1.doc).toEqual(res2.doc);
      });
    });
  });
});
