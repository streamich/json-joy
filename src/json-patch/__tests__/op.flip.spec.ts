import {applyPatch} from '../patch';
import {OperationFlip} from '../types';

describe('flip', () => {
  describe('root', () => {
    test('flips true to false', () => {
      const operation: OperationFlip = {
        op: 'flip',
        path: '',
      };
      const result = applyPatch(true, [operation], true).doc;
      expect(result).toEqual(false);
    });

    test('flips false to true', () => {
      const operation: OperationFlip = {
        op: 'flip',
        path: '',
      };
      const result = applyPatch(false, [operation], true).doc;
      expect(result).toEqual(true);
    });

    test('flips truthy number to false', () => {
      const operation: OperationFlip = {
        op: 'flip',
        path: '',
      };
      const result = applyPatch(123, [operation], true).doc;
      expect(result).toEqual(false);
    });

    test('flips zero to true', () => {
      const operation: OperationFlip = {
        op: 'flip',
        path: '',
      };
      const result = applyPatch(0, [operation], true).doc;
      expect(result).toEqual(true);
    });
  });

  describe('object', () => {
    test('flips true to false', () => {
      const operation: OperationFlip = {
        op: 'flip',
        path: '/foo',
      };
      const result = applyPatch({foo: true}, [operation], true).doc;
      expect(result).toEqual({foo: false});
    });

    test('flips false to true', () => {
      const operation: OperationFlip = {
        op: 'flip',
        path: '/foo',
      };
      const result = applyPatch({foo: false}, [operation], true).doc;
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
      const result = applyPatch([true, false], operations, true).doc;
      expect(result).toEqual([false, true]);
    });
  });
});
