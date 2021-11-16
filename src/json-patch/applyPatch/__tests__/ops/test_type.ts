import type {Operation} from '../../..';
import type {ApplyPatch} from '../../types';

export const testTestTypeOp = (applyPatch: ApplyPatch) => {
  const exec = (doc: unknown, op: Operation) => {
    return applyPatch(doc, [op], {mutate: true});
  };

  describe('test_type', () => {
    describe('root', () => {
      test('succeeds when target has correct type', () => {
        exec(
          {},
          {
            op: 'test_type',
            path: '',
            type: ['object'],
          },
        );
      });

      test('succeeds when target has correct type in list of types', () => {
        exec(
          {},
          {
            op: 'test_type',
            path: '',
            type: ['number', 'object'],
          },
        );
      });

      test('matches null as "null" type', () => {
        exec(null, {
          op: 'test_type',
          path: '',
          type: ['null'],
        });
      });

      test('does not match null as "object" type', () => {
        expect(() =>
          exec(null, {
            op: 'test_type',
            path: '',
            type: ['object'],
          }),
        ).toThrow();
      });

      test('matches number as "number" type', () => {
        exec(123, {
          op: 'test_type',
          path: '',
          type: ['string', 'number'],
        });
      });

      test('does not match number as "object" and "string" types', () => {
        expect(() =>
          exec(123, {
            op: 'test_type',
            path: '',
            type: ['string', 'object'],
          }),
        ).toThrow();
      });

      test('matches float as "number" type', () => {
        exec(1.2, {
          op: 'test_type',
          path: '',
          type: ['string', 'number'],
        });
      });

      test('does not match float as "integer"', () => {
        expect(() =>
          exec(2.3, {
            op: 'test_type',
            path: '',
            type: ['integer'],
          }),
        ).toThrow();
      });

      test('matches natural number as "integer" type', () => {
        exec(0, {
          op: 'test_type',
          path: '',
          type: ['integer'],
        });
      });

      test('does not match array as "object" type', () => {
        expect(() =>
          exec([1, 2, 3], {
            op: 'test_type',
            path: '',
            type: ['object'],
          }),
        ).toThrow();
      });

      test('does not match array as "null" type', () => {
        expect(() =>
          exec([1, 2, 3], {
            op: 'test_type',
            path: '',
            type: ['null'],
          }),
        ).toThrow();
      });

      test('matches array as "array" type', () => {
        exec([1, 2, 3], {
          op: 'test_type',
          path: '',
          type: ['null', 'object', 'array'],
        });
      });

      test('matches boolean as "boolean" type', () => {
        exec(true, {
          op: 'test_type',
          path: '',
          type: ['boolean'],
        });
        exec(false, {
          op: 'test_type',
          path: '',
          type: ['boolean'],
        });
      });
    });

    describe('object', () => {
      test('matches string with "string" type', () => {
        exec(
          {a: 'asdf'},
          {
            op: 'test_type',
            path: '/a',
            type: ['string'],
          },
        );
      });

      test('does not match string as "null" type', () => {
        expect(() =>
          exec(
            {a: 'asdf'},
            {
              op: 'test_type',
              path: '/a',
              type: ['null'],
            },
          ),
        ).toThrow();
      });
    });

    describe('array', () => {
      test('matches string with "string" type', () => {
        exec(
          {a: ['asdf']},
          {
            op: 'test_type',
            path: '/a/0',
            type: ['string'],
          },
        );
      });

      test('does not match string as "null" type', () => {
        expect(() =>
          exec(
            {a: ['asdf']},
            {
              op: 'test_type',
              path: '/a/0',
              type: ['null'],
            },
          ),
        ).toThrow();
      });
    });
  });
};
