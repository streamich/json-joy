import {applyPatch} from '../patch';
import {Operation} from '../types';

const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], true);

describe('less', () => {
  describe('root', () => {
    test('succeeds when value is lower than requested', () => {
      applyOperation(123, {
        op: 'less',
        path: '',
        value: 124,
      });
    });

    test('fails when value is not lower than requested', () => {
      expect(() =>
        applyOperation(123, {
          op: 'less',
          path: '',
          value: 123,
        }),
      ).toThrow();
      expect(() =>
        applyOperation(123, {
          op: 'less',
          path: '',
          value: 1,
        }),
      ).toThrow();
    });
  });
});
