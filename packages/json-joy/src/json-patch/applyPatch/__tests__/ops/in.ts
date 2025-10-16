import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';

export const testInOp = (applyPatch: ApplyPatch) => {
  const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], {mutate: true});

  describe('in', () => {
    describe('positive', () => {
      test('should test against root (on a json document of type object) - and return true', () => {
        const obj = {
          hello: 'world',
        };
        const result = applyOperation(obj, {
          op: 'in',
          path: '',
          value: [
            1,
            {
              hello: 'world',
            },
          ],
        }).doc;
        expect(result).toEqual(obj);
      });

      test('should test against root (on a json document of type object) - and return false', () => {
        const obj = {
          hello: 'world',
        };
        expect(() =>
          applyOperation(obj, {
            op: 'in',
            path: '',
            value: [1],
          }),
        ).toThrow();
      });

      test('should test against root (on a json document of type array) - and return false', () => {
        const obj = [
          {
            hello: 'world',
          },
        ];

        expect(() =>
          applyOperation(obj, {
            op: 'in',
            path: '',
            value: [1],
          }),
        ).toThrow();
      });
    });
  });
};
