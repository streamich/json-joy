import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testLessOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('less', () => {
    describe('root', () => {
      test('succeeds when value is lower than requested', () => {
        applyOperation(123, {
          op: 'less',
          path: '',
          value: 124,
        });
      });

      test('fails when value is not lower than requested', () => {
        expect(() =>
          applyOperation(123, {
            op: 'less',
            path: '',
            value: 123,
          }),
        ).toThrow();
        expect(() =>
          applyOperation(123, {
            op: 'less',
            path: '',
            value: 1,
          }),
        ).toThrow();
      });
    });
  });
};
