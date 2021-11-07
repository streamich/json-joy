import {applyPatch} from '../patch';

describe('defined', () => {
  describe('root', () => {
    describe('positive', () => {
      test('succeeds when target exists', () => {
        applyPatch(
          null,
          [
            {
              op: 'defined',
              path: '',
            },
          ],
          true,
          {},
        );
      });

      test('throws when target does not exist', () => {
        expect(() =>
          applyPatch(
            undefined,
            [
              {
                op: 'defined',
                path: '',
              },
            ],
            true,
            {},
          ),
        ).toThrow();
      });
    });
  });

  describe('object', () => {
    describe('positive', () => {
      test('succeeds when target exists', () => {
        const result = applyPatch(
          {hello: 'mars'},
          [
            {
              op: 'defined',
              path: '/hello',
            },
          ],
          true,
          {},
        ).doc;
        expect(result).toEqual({hello: 'mars'});
      });

      test('throws when target does not exist', () => {
        expect(() =>
          applyPatch(
            {hello: 'mars'},
            [
              {
                op: 'defined',
                path: '/hello2',
              },
            ],
            true,
            {},
          ),
        ).toThrow();

        expect(() =>
          applyPatch(
            {hello: 'mars'},
            [
              {
                op: 'defined',
                path: '/foo/bar/baz',
              },
            ],
            true,
            {},
          ),
        ).toThrow();
      });
    });
  });

  describe('array', () => {
    describe('positive', () => {
      test('succeeds when target exists', () => {
        const result = applyPatch(
          {hello: [0, false, null]},
          [
            {
              op: 'defined',
              path: '/hello/1',
            },
          ],
          true,
          {},
        ).doc;
        expect(result).toEqual({hello: [0, false, null]});
      });

      test('throws when target does not exist', () => {
        expect(() =>
          applyPatch(
            {hello: [1]},
            [
              {
                op: 'defined',
                path: '/hello/1',
              },
            ],
            true,
            {},
          ),
        ).toThrow();
      });
    });
  });
});
