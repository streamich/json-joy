import type {OperationStrDel, OperationStrIns} from '../../..';
import type {ApplyPatch} from '../../types';

export const testStrDelOp = (applyPatch: ApplyPatch) => {
  describe('str_del', () => {
    describe('root', () => {
      test('can remove characters', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '',
          pos: 5,
          len: 6,
        };
        const result = applyPatch('hello world!', [operation], {mutate: true}).doc;
        expect(result).toEqual('hello!');
      });

      test('can remove characters by value', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '',
          pos: 0,
          str: 'hello ',
        };
        const result = applyPatch('hello world!', [operation], {mutate: true}).doc;
        expect(result).toEqual('world!');
      });

      test('length can be arbitrary long', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '',
          pos: 3,
          len: 999999,
        };
        const result = applyPatch('1234567890', [operation], {mutate: true}).doc;
        expect(result).toEqual('123');
      });

      test('pos=1 leaves only first character', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '',
          pos: 1,
          len: 999999,
        };
        const result = applyPatch('1', [operation], {mutate: true}).doc;
        expect(result).toEqual('1');
      });
    });

    describe('object', () => {
      test('can remove last character', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '/foo',
          pos: 2,
          len: 1,
        };
        const result = applyPatch({foo: 'abc'}, [operation], {mutate: true}).doc;
        expect(result).toEqual({foo: 'ab'});
      });

      test('can remove middle character', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '/foo',
          pos: 1,
          len: 1,
        };
        const result = applyPatch({foo: 'abc'}, [operation], {mutate: true}).doc;
        expect(result).toEqual({foo: 'ac'});
      });

      test('can remove middle character by value', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '/foo',
          pos: 1,
          str: 'b',
        };
        const result = applyPatch({foo: 'abc'}, [operation], {mutate: true}).doc;
        expect(result).toEqual({foo: 'ac'});
      });

      test('can remove first character', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '/foo',
          pos: 0,
          len: 1,
        };
        const result = applyPatch({foo: 'abc'}, [operation], {mutate: true}).doc;
        expect(result).toEqual({foo: 'bc'});
      });
    });

    describe('array', () => {
      test('can remove last character', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '/0',
          pos: 2,
          len: 1,
        };
        const result = applyPatch(['abc'], [operation], {mutate: true}).doc;
        expect(result).toEqual(['ab']);
      });

      test('can remove middle character', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '/1',
          pos: 1,
          len: 1,
        };
        const result = applyPatch([1, 'abc'], [operation], {mutate: true}).doc;
        expect(result).toEqual([1, 'ac']);
      });

      test('can remove first character', () => {
        const operation: OperationStrDel = {
          op: 'str_del',
          path: '/0',
          pos: 0,
          len: 1,
        };
        const result = applyPatch(['abc', true], [operation], {mutate: true}).doc;
        expect(result).toEqual(['bc', true]);
      });
    });
  });
};
