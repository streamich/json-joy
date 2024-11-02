import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';
import type {OperationInc} from '../../..';

export const testIncOp = (applyPatch: ApplyPatch) => {
  const applyOperations = (doc: unknown, ops: Operation[]) => applyPatch(doc, ops, {mutate: true});

  describe('inc', () => {
    test('casts values and them increments them', () => {
      const doc = {
        val1: true,
        val2: false,
        val3: 1,
        val4: 0,
      };
      const operations: OperationInc[] = [
        {op: 'inc', path: '/val1', inc: 1},
        {op: 'inc', path: '/val2', inc: 1},
        {op: 'inc', path: '/val3', inc: 1},
        {op: 'inc', path: '/val4', inc: 1},
      ];
      const result = applyOperations(doc, operations).doc;
      expect(result).toEqual({
        val1: 2,
        val2: 1,
        val3: 2,
        val4: 1,
      });
    });

    test('can use arbitrary increment value, and can decrement', () => {
      const doc = {
        foo: 1,
      };
      const operations: OperationInc[] = [
        {op: 'inc', path: '/foo', inc: 10},
        {op: 'inc', path: '/foo', inc: -3},
      ];
      const result = applyOperations(doc, operations).doc;
      expect(result).toEqual({
        foo: 8,
      });
    });

    test('increment can be a floating point number', () => {
      const doc = {
        foo: 1,
      };
      const operations: OperationInc[] = [{op: 'inc', path: '/foo', inc: 0.1}];
      const result = applyOperations(doc, operations).doc;
      expect(result).toEqual({
        foo: 1.1,
      });
    });

    describe('root', () => {
      test('increments from 0 to 5', () => {
        const operation: OperationInc = {
          op: 'inc',
          path: '',
          inc: 5,
        };
        const result = applyOperations(0, [operation]).doc;
        expect(result).toEqual(5);
      });

      test('increments from -0 to 5', () => {
        const operation: OperationInc = {
          op: 'inc',
          path: '',
          inc: 5,
        };
        const result = applyOperations(-0, [operation]).doc;
        expect(result).toEqual(5);
      });
    });

    describe('object', () => {
      test('increments from 0 to 5', () => {
        const operation: OperationInc = {
          op: 'inc',
          path: '/lala',
          inc: 5,
        };
        const result = applyOperations({lala: 0}, [operation]).doc;
        expect(result).toEqual({lala: 5});
      });

      test('increments from -0 to 5', () => {
        const operation: OperationInc = {
          op: 'inc',
          path: '/lala',
          inc: 5,
        };
        const result = applyOperations({lala: -0}, [operation]).doc;
        expect(result).toEqual({lala: 5});
      });

      test('casts string to number', () => {
        const operation: OperationInc = {
          op: 'inc',
          path: '/lala',
          inc: 5,
        };
        const result = applyOperations({lala: '4'}, [operation]).doc;
        expect(result).toEqual({lala: 9});
      });

      test('can increment twice', () => {
        const operations: OperationInc[] = [
          {
            op: 'inc',
            path: '/lala',
            inc: 1,
          },
          {
            op: 'inc',
            path: '/lala',
            inc: 2,
          },
        ];
        const result = applyOperations({lala: 0}, operations).doc;
        expect(result).toEqual({lala: 3});
      });
    });

    describe('array', () => {
      test('increments from 0 to -3', () => {
        const operation: OperationInc = {
          op: 'inc',
          path: '/0',
          inc: -3,
        };
        const result = applyOperations([0], [operation]).doc;
        expect(result).toEqual([-3]);
      });

      test('increments from -0 to -3', () => {
        const operation: OperationInc = {
          op: 'inc',
          path: '/0',
          inc: -3,
        };
        const result = applyOperations([-0], [operation]).doc;
        expect(result).toEqual([-3]);
      });
    });
  });
};
