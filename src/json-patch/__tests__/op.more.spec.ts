import {applyPatch} from '../patch';
import {Operation} from '../types';

const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], true);

describe('more', () => {
  describe('root', () => {
    test('succeeds when value is lower than requested', () => {
      applyOperation(123, {
        op: 'more',
        path: '',
        value: 99,
      });
    });

    test('succeeds when value is lower than requested', () => {
      expect(() =>
        applyOperation(123, {
          op: 'more',
          path: '',
          value: 123,
        }),
      ).toThrow();
      expect(() =>
        applyOperation(123, {
          op: 'more',
          path: '',
          value: 124,
        }),
      ).toThrow();
    });
  });
});
