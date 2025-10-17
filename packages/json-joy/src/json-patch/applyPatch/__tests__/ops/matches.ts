import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testMatchesOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('matches', () => {
    describe('root', () => {
      test('succeeds when matches correctly a substring', () => {
        applyOperation('123', {
          op: 'matches',
          path: '',
          value: '\\d+',
        });
      });

      test('fails when does not match the string', () => {
        expect(() =>
          applyOperation('asdf', {
            op: 'matches',
            path: '',
            value: '\\d+',
          }),
        ).toThrow();
      });
    });
  });
};
