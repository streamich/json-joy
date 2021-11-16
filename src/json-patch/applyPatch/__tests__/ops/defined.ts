import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testDefinedOp = (applyPatch: ApplyPatch) => {
  const applyOperations = (doc: unknown, ops: Operation[]) => applyPatch(doc, ops, {mutate: true});

  describe('defined', () => {
    describe('root', () => {
      describe('positive', () => {
        test('succeeds when target exists', () => {
          applyOperations(null, [
            {
              op: 'defined',
              path: '',
            },
          ]);
        });

        test('throws when target does not exist', () => {
          expect(() =>
            applyOperations(undefined, [
              {
                op: 'defined',
                path: '',
              },
            ]),
          ).toThrow();
        });
      });
    });

    describe('object', () => {
      describe('positive', () => {
        test('succeeds when target exists', () => {
          const result = applyOperations({hello: 'mars'}, [
            {
              op: 'defined',
              path: '/hello',
            },
          ]).doc;
          expect(result).toEqual({hello: 'mars'});
        });

        test('throws when target does not exist', () => {
          expect(() =>
            applyOperations({hello: 'mars'}, [
              {
                op: 'defined',
                path: '/hello2',
              },
            ]),
          ).toThrow();

          expect(() =>
            applyOperations({hello: 'mars'}, [
              {
                op: 'defined',
                path: '/foo/bar/baz',
              },
            ]),
          ).toThrow();
        });
      });
    });

    describe('array', () => {
      describe('positive', () => {
        test('succeeds when target exists', () => {
          const result = applyOperations({hello: [0, false, null]}, [
            {
              op: 'defined',
              path: '/hello/1',
            },
          ]).doc;
          expect(result).toEqual({hello: [0, false, null]});
        });

        test('throws when target does not exist', () => {
          expect(() =>
            applyOperations({hello: [1]}, [
              {
                op: 'defined',
                path: '/hello/1',
              },
            ]),
          ).toThrow();
        });
      });
    });
  });
};
