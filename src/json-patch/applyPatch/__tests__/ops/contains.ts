import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testContainsOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('contains', () => {
    describe('root', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation('foo bar', {
          op: 'contains',
          path: '',
          value: 'oo b',
        });
      });

      test('succeeds when matches start of the string', () => {
        applyOperation('foo bar', {
          op: 'contains',
          path: '',
          value: 'foo',
        });
      });

      test('can ignore case', () => {
        applyOperation('foo bar', {
          op: 'contains',
          path: '',
          value: 'oo B',
          ignore_case: true,
        });
      });

      test('throws when case does not match', () => {
        expect(() =>
          applyOperation('foo bar', {
            op: 'contains',
            path: '',
            value: 'oo B',
          }),
        ).toThrow();
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation('foo bar', {
            op: 'contains',
            path: '',
            value: 'oo 0',
          }),
        ).toThrow();
      });
    });

    describe('object', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(
          {foo: 'foo bar'},
          {
            op: 'contains',
            path: '/foo',
            value: 'oo b',
          },
        );
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(
            {foo: 'foo bar'},
            {
              op: 'contains',
              path: '/foo',
              value: 'oo 0',
            },
          ),
        ).toThrow();
      });
    });

    describe('array', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(['foo bar'], {
          op: 'contains',
          path: '/0',
          value: 'oo b',
        });
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(['foo bar'], {
            op: 'contains',
            path: '/0',
            value: 'oo 0',
          }),
        ).toThrow();
      });
    });
  });
};
