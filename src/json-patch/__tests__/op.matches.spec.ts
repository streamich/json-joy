import {applyPatch} from '../patch';
import {Operation} from '../types';

const applyOperation = (doc: unknown, op: Operation) => applyPatch(doc, [op], true);

describe('matches', () => {
  describe('root', () => {
    test('succeeds when matches correctly a substring', () => {
      applyOperation('123', {
        op: 'matches',
        path: '',
        value: '\\d+',
      });
    });

    test('fails when does not match the string', () => {
      expect(() =>
        applyOperation('asdf', {
          op: 'matches',
          path: '',
          value: '\\d+',
        }),
      ).toThrow();
    });
  });
});
