import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testStartsOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('starts', () => {
    describe('root', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation('foo bar', {
          op: 'starts',
          path: '',
          value: 'foo',
        });
      });

      test('can ignore case', () => {
        applyOperation('foo bar', {
          op: 'starts',
          path: '',
          value: 'fOO',
          ignore_case: true,
        });
      });

      test('can ignore case', () => {
        applyOperation('Foo bar', {
          op: 'starts',
          path: '',
          value: 'fOo',
          ignore_case: true,
        });
      });

      test('throws when case does not match', () => {
        expect(() =>
          applyOperation('foo bar', {
            op: 'starts',
            path: '',
            value: 'fOo',
          }),
        ).toThrow();
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation('foo bar', {
            op: 'starts',
            path: '',
            value: '!foo',
          }),
        ).toThrow();
      });
    });

    describe('object', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(
          {foo: 'foo bar'},
          {
            op: 'starts',
            path: '/foo',
            value: 'foo',
          },
        );
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(
            {foo: 'foo bar'},
            {
              op: 'starts',
              path: '/foo',
              value: 'bar',
            },
          ),
        ).toThrow();
      });
    });

    describe('array', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation(['foo bar'], {
          op: 'starts',
          path: '/0',
          value: 'foo',
        });
      });

      test('throws when matches substring incorrectly', () => {
        expect(() =>
          applyOperation(['foo bar'], {
            op: 'starts',
            path: '/0',
            value: 'bar',
          }),
        ).toThrow();
      });
    });
  });
};
