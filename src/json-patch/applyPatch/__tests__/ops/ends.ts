import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testEndsOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('ends', () => {
    describe('root', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation('foo bar', {
          op: 'ends',
          path: '',
          value: 'bar',
        });
      });

      test('can ignore case', () => {
        applyOperation('foo bar', {
          op: 'ends',
          path: '',
          value: 'BaR',
          ignore_case: true,
        });
      });

      test('can ignore case', () => {
        applyOperation('foo bAr', {
          op: 'ends',
          path: '',
          value: 'BaR',
          ignore_case: true,
        });
      });

      test('throws when case does not match', () => {
        expect(() =>
          applyOperation('foo bar', {
            op: 'ends',
            path: '',
            value: 'BaR',
          }),
        ).toThrow();
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation('foo bar', {
            op: 'ends',
            path: '',
            value: 'bar!',
          }),
        ).toThrow();
      });
    });

    describe('object', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(
          {foo: 'foo bar'},
          {
            op: 'ends',
            path: '/foo',
            value: 'bar',
          },
        );
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(
            {foo: 'foo bar'},
            {
              op: 'ends',
              path: '/foo',
              value: 'foo',
            },
          ),
        ).toThrow();
      });
    });

    describe('array', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(['foo bar'], {
          op: 'ends',
          path: '/0',
          value: 'bar',
        });
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(['foo bar'], {
            op: 'ends',
            path: '/0',
            value: 'foo',
          }),
        ).toThrow();
      });
    });
  });
};
