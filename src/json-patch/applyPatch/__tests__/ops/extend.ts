import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testExtendOp = (applyPatch: ApplyPatch) => {
  describe('extend', () => {
    describe('root', () => {
      test('can extend an object', () => {
        const operations: Operation[] = [
          {
            op: 'extend',
            path: '',
            props: {
              a: 'b',
              c: 3,
            },
          },
        ];
        const result = applyPatch({foo: 'bar'}, operations, {mutate: true}).doc;

        expect(result).toEqual({
          foo: 'bar',
          a: 'b',
          c: 3,
        });
      });
    });

    describe('array', () => {
      test('can extend an object', () => {
        const operations: Operation[] = [
          {
            op: 'extend',
            path: '/foo/0/lol',
            props: {
              b: 123,
            },
          },
        ];
        const result = applyPatch({foo: [{lol: {a: 1}}]}, operations, {mutate: true}).doc;

        expect(result).toEqual({foo: [{lol: {a: 1, b: 123}}]});
      });

      test('can set null', () => {
        const operations: Operation[] = [
          {
            op: 'extend',
            path: '/foo/0/lol',
            props: {
              b: 123,
              c: null,
              a: null,
            },
          },
        ];
        const result = applyPatch({foo: [{lol: {a: 1}}]}, operations, {mutate: true}).doc;

        expect(result).toEqual({foo: [{lol: {a: null, b: 123, c: null}}]});
      });

      test('can use null to delete a key', () => {
        const operations: Operation[] = [
          {
            op: 'extend',
            path: '/foo/0/lol',
            props: {
              b: 123,
              c: null,
              a: null,
            },
            deleteNull: true,
          },
        ];
        const result = applyPatch({foo: [{lol: {a: 1}}]}, operations, {mutate: true}).doc;

        expect(result).toEqual({foo: [{lol: {b: 123}}]});
      });
    });

    describe('object', () => {
      test('can extend an object', () => {
        const operations: Operation[] = [
          {
            op: 'extend',
            path: '/foo/lol',
            props: {
              b: 123,
            },
          },
        ];
        const result = applyPatch({foo: {lol: {a: 1}}}, operations, {mutate: true}).doc;

        expect(result).toEqual({foo: {lol: {a: 1, b: 123}}});
      });

      test('can set null', () => {
        const operations: Operation[] = [
          {
            op: 'extend',
            path: '/foo/lol',
            props: {
              b: 123,
              c: null,
              a: null,
            },
          },
        ];
        const result = applyPatch({foo: {lol: {a: 1}}}, operations, {mutate: true}).doc;

        expect(result).toEqual({foo: {lol: {a: null, b: 123, c: null}}});
      });

      test('can use null to delete a key', () => {
        const operations: Operation[] = [
          {
            op: 'extend',
            path: '/foo/lol',
            props: {
              b: 123,
              c: null,
              a: null,
            },
            deleteNull: true,
          },
        ];
        const result = applyPatch({foo: {lol: {a: 1}}}, operations, {mutate: true}).doc;

        expect(result).toEqual({foo: {lol: {b: 123}}});
      });
    });
  });
};
