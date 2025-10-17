import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testMoreOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('more', () => {
    describe('root', () => {
      test('succeeds when value is higher than requested', () => {
        applyOperation(123, {
          op: 'more',
          path: '',
          value: 99,
        });
      });

      test('fails when value is not higher than requested', () => {
        expect(() =>
          applyOperation(123, {
            op: 'more',
            path: '',
            value: 123,
          }),
        ).toThrow();
        expect(() =>
          applyOperation(123, {
            op: 'more',
            path: '',
            value: 124,
          }),
        ).toThrow();
      });
    });
  });
};
