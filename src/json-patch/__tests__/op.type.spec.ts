import {applyPatch} from '../patch';
import {Operation} from '../types';

const exec = (doc: unknown, op: Operation) => {
  return applyPatch(doc, [op], true);
};

describe('type', () => {
  describe('root', () => {
    test('succeeds when target has correct type', () => {
      exec(
        {},
        {
          op: 'type',
          path: '',
          value: 'object',
        },
      );
    });

    test('throws when type does not match', () => {
      expect(() =>
        exec(
          {},
          {
            op: 'type',
            path: '',
            value: 'number',
          },
        ),
      ).toThrow();
    });
  });
});
