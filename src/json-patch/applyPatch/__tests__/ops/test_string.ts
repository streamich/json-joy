import type {Operation} from '../../..';
import type {ApplyPatch} from '../../types';

export const testTestString = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('test_string', () => {
    describe('root', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation('foo bar', {
          op: 'test_string',
          path: '',
          pos: 1,
          str: 'oo b',
        });
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation('foo bar', {
            op: 'test_string',
            path: '',
            pos: 3,
            str: 'oo',
          }),
        ).toThrow();
        applyOperation('foo bar', {
          op: 'test_string',
          path: '',
          pos: 4,
          str: 'bar',
        });
      });
    });

    describe('object', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(
          {a: 'b', test: 'foo bar'},
          {
            op: 'test_string',
            path: '/test',
            pos: 1,
            str: 'oo b',
          },
        );
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(
            {test: 'foo bar'},
            {
              op: 'test_string',
              path: '/test',
              pos: 3,
              str: 'oo',
            },
          ),
        ).toThrow();
      });
    });

    describe('array', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(
          {a: 'b', test: ['foo bar']},
          {
            op: 'test_string',
            path: '/test/0',
            pos: 1,
            str: 'oo b',
          },
        );
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(
            {test: ['foo bar']},
            {
              op: 'test_string',
              path: '/test/0',
              pos: 3,
              str: 'oo',
            },
          ),
        ).toThrow();
      });
    });
  });
};
