import type {Operation} from '../../..';
import type {ApplyPatch} from '../../types';

export const testTestStrLenOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('test_string_len', () => {
    describe('root', () => {
      describe('positive', () => {
        test('succeeds when target is longer than requested', () => {
          applyOperation('foo bar', {
            op: 'test_string_len',
            path: '',
            len: 3,
          });
        });

        test('succeeds when target length is equal to requested length', () => {
          applyOperation('xo', {
            op: 'test_string_len',
            path: '',
            len: 2,
          });
        });

        test('throws when requested length is larger than target', () => {
          expect(() =>
            applyOperation('asdf', {
              op: 'test_string_len',
              path: '',
              len: 9999,
            }),
          ).toThrow();
        });
      });

      describe('negative', () => {
        test('throw when target is longer than requested', () => {
          expect(() =>
            applyOperation('foo bar', {
              op: 'test_string_len',
              path: '',
              len: 3,
              not: true,
            }),
          ).toThrow();
        });

        test('throws when target length is equal to requested length', () => {
          expect(() =>
            applyOperation('xo', {
              op: 'test_string_len',
              path: '',
              len: 2,
              not: true,
            }),
          ).toThrow();
        });

        test('succeeds when requested length is larger than target', () => {
          applyOperation('asdf', {
            op: 'test_string_len',
            path: '',
            len: 9999,
            not: true,
          });
        });
      });
    });

    describe('object', () => {
      describe('positive', () => {
        test('succeeds when target is longer than requested', () => {
          applyOperation(
            {a: 'b'},
            {
              op: 'test_string_len',
              path: '/a',
              len: 1,
            },
          );
          applyOperation(
            {a: 'b'},
            {
              op: 'test_string_len',
              path: '/a',
              len: 0,
            },
          );
        });

        test('throws when target is shorter than requested', () => {
          expect(() =>
            applyOperation(
              {a: 'b'},
              {
                op: 'test_string_len',
                path: '/a',
                len: 99,
              },
            ),
          ).toThrow();
          applyOperation(
            {a: 'b'},
            {
              op: 'test_string_len',
              path: '/a',
              len: 99,
              not: true,
            },
          );
        });
      });
    });

    describe('array', () => {
      describe('positive', () => {
        test('succeeds when target is longer than requested', () => {
          applyOperation(
            {a: ['b']},
            {
              op: 'test_string_len',
              path: '/a/0',
              len: 1,
            },
          );
          applyOperation(
            {a: ['b']},
            {
              op: 'test_string_len',
              path: '/a/0',
              len: 0,
            },
          );
        });

        test('throws when target is shorter than requested', () => {
          expect(() =>
            applyOperation(
              {a: ['b']},
              {
                op: 'test_string_len',
                path: '/a/0',
                len: 99,
              },
            ),
          ).toThrow();
          applyOperation(
            {a: ['b']},
            {
              op: 'test_string_len',
              path: '/a/0',
              len: 99,
              not: true,
            },
          );
        });
      });
    });
  });
};
