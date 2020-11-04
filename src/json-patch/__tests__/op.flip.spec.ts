import {applyPatch} from '../patch';
import {OperationFlip} from '../types';

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
    const result = applyPatch(doc, operations, true).doc;
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
