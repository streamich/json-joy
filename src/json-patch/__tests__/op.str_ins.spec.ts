import {applyPatch} from '../patch';
import {OperationStrIns} from '../types';

describe('str_ins', () => {
  describe('root', () => {
    test('can add text to empty string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '',
        pos: 0,
        str: 'bar',
      };
      const result = applyPatch('', [operation], true, {}).doc;
      expect(result).toEqual('bar');
    });
  });

  describe('object', () => {
    test('can add text to empty string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      };
      const result = applyPatch({foo: ''}, [operation], true, {}).doc;
      expect(result).toEqual({foo: 'bar'});
    });

    test('throws if target is not a string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      };
      expect(() => applyPatch({foo: 123}, [operation], true, {})).toThrow();
      expect(() => applyPatch({foo: true}, [operation], true, {})).toThrow();
      expect(() => applyPatch({foo: {}}, [operation], true, {})).toThrow();
      expect(() => applyPatch({foo: []}, [operation], true, {})).toThrow();
      expect(() => applyPatch({foo: null}, [operation], true, {})).toThrow();
    });

    test('can add text to empty string at position greater than host string length', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo',
        pos: 25,
        str: 'bar',
      };
      const result = applyPatch({foo: ''}, [operation], true, {}).doc;
      expect(result).toEqual({foo: 'bar'});
    });

    test('can insert text into a string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo/bar',
        pos: 1,
        str: 'b',
      };
      const result = applyPatch({foo: {bar: 'ac'}}, [operation], true, {}).doc;
      expect(result).toEqual({foo: {bar: 'abc'}});
    });

    test('can insert text at the end of the string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo/bar',
        pos: 2,
        str: 'haha',
      };
      const result = applyPatch({foo: {bar: 'ac'}}, [operation], true, {}).doc;
      expect(result).toEqual({foo: {bar: 'achaha'}});
    });

    test('can insert text into a string at position greater than host string length', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo/bar',
        pos: 123,
        str: 'b',
      };
      const result = applyPatch({foo: {bar: 'ac'}}, [operation], true, {}).doc;
      expect(result).toEqual({foo: {bar: 'acb'}});
    });
  });

  describe('array', () => {
    test('can add text to empty string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/0',
        pos: 0,
        str: 'bar',
      };
      const result = applyPatch([''], [operation], true, {}).doc;
      expect(result).toEqual(['bar']);
    });

    test('can add text to empty string at position greater than host string length', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/0',
        pos: 25,
        str: 'bar',
      };
      const result = applyPatch([''], [operation], true, {}).doc;
      expect(result).toEqual(['bar']);
    });

    test('can insert text into a string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo/1',
        pos: 1,
        str: 'b',
      };
      const result = applyPatch({foo: [0, 'ac']}, [operation], true, {}).doc;
      expect(result).toEqual({foo: [0, 'abc']});
    });

    test('can insert text at the end of the string', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/foo/2',
        pos: 2,
        str: 'haha',
      };
      const result = applyPatch({foo: [1, 2, 'ac']}, [operation], true, {}).doc;
      expect(result).toEqual({foo: [1, 2, 'achaha']});
    });

    test('can insert text into a string at position greater than host string length', () => {
      const operation: OperationStrIns = {
        op: 'str_ins',
        path: '/1',
        pos: 123,
        str: 'b',
      };
      const result = applyPatch([true, 'ac'], [operation], true, {}).doc;
      expect(result).toEqual([true, 'acb']);
    });
  });

  describe('scenarios', () => {
    test('can create new string key and add content to it (if pos = 0 and there was nothing before)', () => {
      const operations: OperationStrIns[] = [
        {
          op: 'str_ins',
          path: '/baz',
          pos: 0,
          str: 'H',
        },
        {
          op: 'str_ins',
          path: '/baz',
          pos: 1,
          str: 'ello',
        },
      ];
      const result = applyPatch({foo: '123'}, operations, true, {}).doc;
      expect(result).toEqual({foo: '123', baz: 'Hello'});
    });

    test('throws if new string is create at position other than 0 (pos != 0)', () => {
      const operations: OperationStrIns[] = [
        {
          op: 'str_ins',
          path: '/baz',
          pos: 1,
          str: 'H',
        },
        {
          op: 'str_ins',
          path: '/baz',
          pos: 2,
          str: 'ello',
        },
      ];
      expect(() => applyPatch({foo: '123'}, operations, true, {})).toThrow();
    });
  });
});
