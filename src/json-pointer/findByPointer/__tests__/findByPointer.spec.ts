import {isArrayReference, isArrayEnd} from '../../find';
import {findByPointer as v1} from '../v1';
import {findByPointer as v2} from '../v2';
import {findByPointer as v3} from '../v3';
import {findByPointer as v4} from '../v4';
import {findByPointer as v5} from '../v5';

const versions = [v1, v2, v3, v4, v5];

for (let i = 0; i < versions.length; i++) {
  const findByPointer = versions[i];

  describe(`findByPointer v${i + 1}`, () => {
    test('can find number root', () => {
      const res = findByPointer('', 123);
      expect(res.val).toBe(123);
    });

    test('can find string root', () => {
      const res = findByPointer('', 'foo');
      expect(res.val).toBe('foo');
    });

    test('can find key in object', () => {
      const res = findByPointer('/foo', {foo: 'bar'});
      expect(res.val).toBe('bar');
    });

    test('returns container object and key', () => {
      const res = findByPointer('/foo/bar/baz', {foo: {bar: {baz: 'qux', a: 1}}});
      expect(res).toEqual({
        val: 'qux',
        obj: {baz: 'qux', a: 1},
        key: 'baz',
      });
    });

    test('can reference simple object key', () => {
      const doc = {a: 123};
      const res = findByPointer('/a', doc);
      expect(res).toEqual({
        val: 123,
        obj: {a: 123},
        key: 'a',
      });
    });

    test('throws when referencing missing key with multiple steps', () => {
      const doc = {a: 123};
      expect(() => findByPointer('/b/c', doc)).toThrow();
    });

    test('can reference array element', () => {
      const doc = {a: {b: [1, 2, 3]}};
      const res = findByPointer('/a/b/1', doc);
      expect(res).toEqual({
        val: 2,
        obj: [1, 2, 3],
        key: 1,
      });
    });

    test('can reference end of array', () => {
      const doc = {a: {b: [1, 2, 3]}};
      const ref = findByPointer('/a/b/-', doc);
      expect(ref).toEqual({
        val: undefined,
        obj: [1, 2, 3],
        key: 3,
      });
      expect(isArrayReference(ref)).toBe(true);
      if (isArrayReference(ref)) expect(isArrayEnd(ref)).toBe(true);
    });

    test('throws when pointing past array boundary', () => {
      const doc = {a: {b: [1, 2, 3]}};
      expect(() => findByPointer('/a/b/-1', doc)).toThrow();
    });

    test('can point one element past array boundary', () => {
      const doc = {a: {b: [1, 2, 3]}};
      const ref = findByPointer('/a/b/3', doc);
      expect(ref).toEqual({
        val: undefined,
        obj: [1, 2, 3],
        key: 3,
      });
      expect(isArrayReference(ref)).toBe(true);
      if (isArrayReference(ref)) expect(isArrayEnd(ref)).toBe(true);
    });

    test('can reference missing object key', () => {
      const doc = {foo: 123};
      const ref = findByPointer('/bar', doc);
      expect(ref).toEqual({
        val: undefined,
        obj: {foo: 123},
        key: 'bar',
      });
    });

    test('can reference missing array key withing bounds', () => {
      const doc = {foo: 123, bar: [1, 2, 3]};
      const ref = findByPointer('/bar/3', doc);
      expect(ref).toEqual({
        val: undefined,
        obj: [1, 2, 3],
        key: 3,
      });
    });
  });
}
