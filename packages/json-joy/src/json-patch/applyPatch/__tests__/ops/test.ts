import type {Operation} from '../../..';
import type {ApplyPatch} from '../../types';

export const testTestOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('test', () => {
    describe('positive', () => {
      test('should `test` against root (on a json document of type object) - and return true', () => {
        const obj = {
          hello: 'world',
        };
        const result = applyOperation(obj, {
          op: 'test',
          path: '',
          value: {
            hello: 'world',
          },
        }).doc;
        expect(result).toEqual(obj);
      });

      test('should `test` against root (on a json document of type object) - and return false', () => {
        const obj = {
          hello: 'world',
        };
        expect(() =>
          applyOperation(obj, {
            op: 'test',
            path: '',
            value: 1,
          }),
        ).toThrow();
      });

      test('should `test` against root (on a json document of type array) - and return false', () => {
        const obj = [
          {
            hello: 'world',
          },
        ];

        expect(() =>
          applyOperation(obj, {
            op: 'test',
            path: '',
            value: 1,
          }),
        ).toThrow();
      });

      test('should throw against root', () => {
        expect(() =>
          applyOperation(1, {
            op: 'test',
            path: '',
            value: 2,
            not: false,
          }),
        ).toThrow();
      });

      test('should throw when object key is different', () => {
        expect(() =>
          applyOperation(
            {foo: 1},
            {
              op: 'test',
              path: '/foo',
              value: 2,
              not: false,
            },
          ),
        ).toThrow();
      });

      test('should not throw when object key is the same', () => {
        applyOperation(
          {foo: 1},
          {
            op: 'test',
            path: '/foo',
            value: 1,
            not: false,
          },
        );
      });
    });

    describe('negative', () => {
      test('should `test` against root', () => {
        applyOperation(1, {
          op: 'test',
          path: '',
          value: 2,
          not: true,
        });
      });

      test('should not throw when object key is different', () => {
        applyOperation(
          {foo: 1},
          {
            op: 'test',
            path: '/foo',
            value: 2,
            not: true,
          },
        );
      });

      test('should throw when object key is the same', () => {
        expect(() =>
          applyOperation(
            {foo: 1},
            {
              op: 'test',
              path: '/foo',
              value: 1,
              not: true,
            },
          ),
        ).toThrow();
      });
    });
  });
};
