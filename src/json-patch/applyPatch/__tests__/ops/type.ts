import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testTypeOp = (applyPatch: ApplyPatch) => {
  const exec = (doc: unknown, op: Operation) => {
    return applyPatch(doc, [op], {mutate: true});
  };

  describe('type', () => {
    describe('root', () => {
      test('succeeds when target has correct type', () => {
        exec(
          {},
          {
            op: 'type',
            path: '',
            value: 'object',
          },
        );
      });

      test('throws when type does not match', () => {
        expect(() =>
          exec(
            {},
            {
              op: 'type',
              path: '',
              value: 'number',
            },
          ),
        ).toThrow();
      });
    });
  });
};
