import {applyPatch} from '../patch';
import {OperationInc} from '../types';

describe('inc', () => {
  describe('root', () => {
    test('increments from 0 to 5', () => {
      const operation: OperationInc = {
        op: 'inc',
        path: '',
        inc: 5,
      };
      const result = applyPatch(0, [operation], true).doc;
      expect(result).toEqual(5);
    });

    test('increments from -0 to 5', () => {
      const operation: OperationInc = {
        op: 'inc',
        path: '',
        inc: 5,
      };
      const result = applyPatch(-0, [operation], true).doc;
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
      const result = applyPatch({lala: 0}, [operation], true).doc;
      expect(result).toEqual({lala: 5});
    });

    test('increments from -0 to 5', () => {
      const operation: OperationInc = {
        op: 'inc',
        path: '/lala',
        inc: 5,
      };
      const result = applyPatch({lala: -0}, [operation], true).doc;
      expect(result).toEqual({lala: 5});
    });

    test('casts string to number', () => {
      const operation: OperationInc = {
        op: 'inc',
        path: '/lala',
        inc: 5,
      };
      const result = applyPatch({lala: '4'}, [operation], true).doc;
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
      const result = applyPatch({lala: 0}, operations, true).doc;
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
      const result = applyPatch([0], [operation], true).doc;
      expect(result).toEqual([-3]);
    });

    test('increments from -0 to -3', () => {
      const operation: OperationInc = {
        op: 'inc',
        path: '/0',
        inc: -3,
      };
      const result = applyPatch([-0], [operation], true).doc;
      expect(result).toEqual([-3]);
    });
  });
});
