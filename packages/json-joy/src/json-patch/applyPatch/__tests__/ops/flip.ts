import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';
import type {OperationFlip} from '../../..';

export const testFlipOp = (applyPatch: ApplyPatch) => {
  const applyOperations = (doc: unknown, ops: Operation[]) => applyPatch(doc, ops, {mutate: true});

  describe('flip', () => {
    test('casts values and them flips them', () => {
      const doc = {
        val1: true,
        val2: false,
        val3: 1,
        val4: 0,
      };
      const operations: OperationFlip[] = [
        {op: 'flip', path: '/val1'},
        {op: 'flip', path: '/val2'},
        {op: 'flip', path: '/val3'},
        {op: 'flip', path: '/val4'},
      ];
      const result = applyOperations(doc, operations).doc;
      expect(result).toEqual({
        val1: false,
        val2: true,
        val3: false,
        val4: true,
      });
    });

    describe('root', () => {
      test('flips true to false', () => {
        const operation: OperationFlip = {
          op: 'flip',
          path: '',
        };
        const result = applyOperations(true, [operation]).doc;
        expect(result).toEqual(false);
      });

      test('flips false to true', () => {
        const operation: OperationFlip = {
          op: 'flip',
          path: '',
        };
        const result = applyOperations(false, [operation]).doc;
        expect(result).toEqual(true);
      });

      test('flips truthy number to false', () => {
        const operation: OperationFlip = {
          op: 'flip',
          path: '',
        };
        const result = applyOperations(123, [operation]).doc;
        expect(result).toEqual(false);
      });

      test('flips zero to true', () => {
        const operation: OperationFlip = {
          op: 'flip',
          path: '',
        };
        const result = applyOperations(0, [operation]).doc;
        expect(result).toEqual(true);
      });
    });

    describe('object', () => {
      test('flips true to false', () => {
        const operation: OperationFlip = {
          op: 'flip',
          path: '/foo',
        };
        const result = applyOperations({foo: true}, [operation]).doc;
        expect(result).toEqual({foo: false});
      });

      test('flips false to true', () => {
        const operation: OperationFlip = {
          op: 'flip',
          path: '/foo',
        };
        const result = applyOperations({foo: false}, [operation]).doc;
        expect(result).toEqual({foo: true});
      });
    });

    describe('array', () => {
      test('flips true to false and back', () => {
        const operations: OperationFlip[] = [
          {
            op: 'flip',
            path: '/0',
          },
          {
            op: 'flip',
            path: '/1',
          },
        ];
        const result = applyOperations([true, false], operations).doc;
        expect(result).toEqual([false, true]);
      });
    });
  });
};
