import {applyPatch} from '../patch';

describe('undefined', () => {
  describe('root', () => {
    describe('positive', () => {
      test('fails when target exists', () => {
        expect(() =>
          applyPatch(
            null,
            [
              {
                op: 'undefined',
                path: '',
              },
            ],
            true,
          ),
        ).toThrow();
      });

      test('succeeds when target does not exist', () => {
        applyPatch(
          undefined,
          [
            {
              op: 'undefined',
              path: '',
            },
          ],
          true,
        );
      });
    });
  });

  describe('object', () => {
    describe('positive', () => {
      test('throws when target exists', () => {
        expect(() =>
          applyPatch(
            {hello: 'mars'},
            [
              {
                op: 'undefined',
                path: '/hello',
              },
            ],
            true,
          ),
        ).toThrow();
      });

      test('succeeds when target does not exist', () => {
        applyPatch(
          {hello: 'mars'},
          [
            {
              op: 'undefined',
              path: '/hello2',
            },
          ],
          true,
        );

        applyPatch(
          {hello: 'mars'},
          [
            {
              op: 'undefined',
              path: '/foo/bar/baz',
            },
          ],
          true,
        );
      });
    });
  });

  describe('array', () => {
    describe('positive', () => {
      test('throws when target exists', () => {
        expect(() =>
          applyPatch(
            {hello: [0, false, null]},
            [
              {
                op: 'undefined',
                path: '/hello/1',
              },
            ],
            true,
          ),
        ).toThrow();
      });

      test('succeeds when target does not exist', () => {
        applyPatch(
          {hello: [1]},
          [
            {
              op: 'undefined',
              path: '/hello/1',
            },
          ],
          true,
        );
      });
    });
  });
});
