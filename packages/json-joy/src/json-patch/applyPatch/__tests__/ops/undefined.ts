import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testUndefinedOp = (applyPatch: ApplyPatch) => {
  const exec = (doc: unknown, op: Operation) => {
    return applyPatch(doc, [op], {mutate: true});
  };

  describe('undefined', () => {
    describe('root', () => {
      describe('positive', () => {
        test('fails when target exists', () => {
          expect(() =>
            applyPatch(
              null,
              [
                {
                  op: 'undefined',
                  path: '',
                },
              ],
              {mutate: true},
            ),
          ).toThrow();
        });

        test('succeeds when target does not exist', () => {
          applyPatch(
            undefined,
            [
              {
                op: 'undefined',
                path: '',
              },
            ],
            {mutate: true},
          );
        });
      });
    });

    describe('object', () => {
      describe('positive', () => {
        test('throws when target exists', () => {
          expect(() =>
            applyPatch(
              {hello: 'mars'},
              [
                {
                  op: 'undefined',
                  path: '/hello',
                },
              ],
              {mutate: true},
            ),
          ).toThrow();
        });

        test('succeeds when target does not exist', () => {
          applyPatch(
            {hello: 'mars'},
            [
              {
                op: 'undefined',
                path: '/hello2',
              },
            ],
            {mutate: true},
          );

          applyPatch(
            {hello: 'mars'},
            [
              {
                op: 'undefined',
                path: '/foo/bar/baz',
              },
            ],
            {mutate: true},
          );
        });
      });
    });

    describe('array', () => {
      describe('positive', () => {
        test('throws when target exists', () => {
          expect(() =>
            applyPatch(
              {hello: [0, false, null]},
              [
                {
                  op: 'undefined',
                  path: '/hello/1',
                },
              ],
              {mutate: true},
            ),
          ).toThrow();
        });

        test('succeeds when target does not exist', () => {
          applyPatch(
            {hello: [1]},
            [
              {
                op: 'undefined',
                path: '/hello/1',
              },
            ],
            {mutate: true},
          );
        });
      });
    });
  });
};
