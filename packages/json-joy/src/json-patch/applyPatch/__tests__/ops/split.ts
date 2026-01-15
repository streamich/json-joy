import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';
import type {SlateElementNode, SlateTextNode} from '../../../slate';

export const testSplitOp = (applyPatch: ApplyPatch) => {
  describe('split', () => {
    describe('Slate.js examples', () => {
      test('split a single "ab" paragraphs into two', () => {
        const state: SlateElementNode['children'] = [
          {
            children: [
              {
                text: 'ab',
              },
            ],
          },
        ];
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/0/children/0',
            pos: 1,
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;

        expect(result).toEqual([
          {
            children: [
              {
                text: 'a',
              },
              {
                text: 'b',
              },
            ],
          },
        ]);
      });

      test('split two element blocks into one', () => {
        const state: SlateElementNode['children'] = [
          {
            children: [
              {
                text: 'a',
              },
              {
                text: 'b',
              },
            ],
          },
        ];
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/0',
            pos: 1,
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;

        expect(result).toEqual([
          {
            children: [
              {
                text: 'a',
              },
            ],
          },
          {
            children: [
              {
                text: 'b',
              },
            ],
          },
        ]);
      });

      test('can split paragraph in two and insert a character', () => {
        const state: SlateElementNode['children'] = [
          {
            children: [
              {
                text: 'ab',
              },
            ],
          },
        ];
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/0/children/0',
            pos: 1,
          },
          {
            op: 'split',
            path: '/0',
            pos: 1,
          },
          {
            op: 'str_ins',
            path: '/1/children/0/text',
            pos: 0,
            str: 'c',
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;

        expect(result).toEqual([
          {
            children: [
              {
                text: 'a',
              },
            ],
          },
          {
            children: [
              {
                text: 'cb',
              },
            ],
          },
        ]);
      });
    });

    describe('root', () => {
      describe('string', () => {
        test('can split string in two', () => {
          const state = '1234';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: 2,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['12', '34']);
        });

        test('can split string in two at pos=1', () => {
          const state = '1234';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: 1,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['1', '234']);
        });

        test('can split string in two from beginning', () => {
          const state = '1234';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: 0,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['', '1234']);
        });

        test('can split string in two from end', () => {
          const state = '1234';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: 4,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['1234', '']);
        });

        test('can split string in two when pos is greater than string length', () => {
          const state = '12345';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: 99999,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['12345', '']);
        });

        test('takes characters from end if pos is negative', () => {
          const state = '12345';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: -1,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['1234', '5']);
        });

        test('takes characters from end if pos is negative - 2', () => {
          const state = '12345';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: -2,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['123', '45']);
        });

        test('when negative pos overflows, first element is empty', () => {
          const state = '12345';
          const operations: Operation[] = [
            {
              op: 'split',
              path: '',
              pos: -7,
            },
          ];
          const result = applyPatch(state, operations, {mutate: true}).doc;
          expect(result).toEqual(['', '12345']);
        });
      });

      describe('SlateTextNode', () => {
        test('splits simple SlateTextNode', () => {
          const state: SlateTextNode = {
            text: 'foo bar',
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 3}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([{text: 'foo'}, {text: ' bar'}]);
        });

        test('preserves text node attributes', () => {
          const state: SlateTextNode = {
            text: 'foo bar',
            foo: 'bar',
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 3}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([
            {text: 'foo', foo: 'bar'},
            {text: ' bar', foo: 'bar'},
          ]);
        });

        test('can add custom attributes', () => {
          const state: SlateTextNode = {
            text: 'foo bar',
            foo: 'bar',
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 3, props: {baz: 'qux'}}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([
            {text: 'foo', foo: 'bar', baz: 'qux'},
            {text: ' bar', foo: 'bar', baz: 'qux'},
          ]);
        });

        test('custom attributes can overwrite node attributes', () => {
          const state: SlateTextNode = {
            text: 'foo bar',
            foo: 'bar',
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 3, props: {foo: '1'}}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([
            {text: 'foo', foo: '1'},
            {text: ' bar', foo: '1'},
          ]);
        });
      });

      describe('SlateElementNode', () => {
        test('splits simple node', () => {
          const state: SlateElementNode = {
            children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 1}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([
            {
              children: [{text: 'foo'}],
            },
            {
              children: [{text: 'bar'}, {text: 'baz'}],
            },
          ]);
        });

        test('can provide custom attributes', () => {
          const state: SlateElementNode = {
            children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 2, props: {f: 1}}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([
            {
              f: 1,
              children: [{text: 'foo'}, {text: 'bar'}],
            },
            {
              f: 1,
              children: [{text: 'baz'}],
            },
          ]);
        });

        test('carries over node attributes', () => {
          const state: SlateElementNode = {
            a: 1,
            children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 2, props: {f: 2}}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([
            {
              f: 2,
              a: 1,
              children: [{text: 'foo'}, {text: 'bar'}],
            },
            {
              f: 2,
              a: 1,
              children: [{text: 'baz'}],
            },
          ]);
        });

        test('can overwrite node attributes', () => {
          const state: SlateElementNode = {
            a: 1,
            c: 3,
            children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
          };
          const operations: Operation[] = [{op: 'split', path: '', pos: 2, props: {f: 2, a: 2}}];
          const result = applyPatch(state, operations, {mutate: true}).doc;

          expect(result).toEqual([
            {
              f: 2,
              a: 2,
              c: 3,
              children: [{text: 'foo'}, {text: 'bar'}],
            },
            {
              f: 2,
              a: 2,
              c: 3,
              children: [{text: 'baz'}],
            },
          ]);
        });
      });
    });

    describe('object', () => {
      test('can split string in two', () => {
        const state = {foo: 'ab'};
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/foo',
            pos: 1,
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;
        expect(result).toEqual({foo: ['a', 'b']});
      });

      test('if attribute are specified, wraps strings into nodes', () => {
        const state = {foo: 'ab'};
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/foo',
            pos: 1,
            props: {z: 'x'},
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;
        expect(result).toEqual({
          foo: [
            {text: 'a', z: 'x'},
            {text: 'b', z: 'x'},
          ],
        });
      });

      test('splits SlateTextNode', () => {
        const state = {foo: {text: '777'}};
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/foo',
            pos: 1,
            props: {z: 'x'},
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;
        expect(result).toEqual({
          foo: [
            {text: '7', z: 'x'},
            {text: '77', z: 'x'},
          ],
        });
      });

      test('crates a tuple if target is a boolean value', () => {
        const state = {foo: true};
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/foo',
            pos: 1,
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;
        expect(result).toEqual({foo: [true, true]});
      });

      test('divides number into two haves if target is a number', () => {
        const state = {foo: 10};
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/foo',
            pos: 9,
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;
        expect(result).toEqual({foo: [9, 1]});
      });
    });

    describe('array', () => {
      test('splits SlateElementNode into two', () => {
        const state = [1, {children: [{text: 'a'}, {text: 'b'}]}, 2];
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/1',
            pos: 0,
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;
        expect(result).toEqual([1, {children: []}, {children: [{text: 'a'}, {text: 'b'}]}, 2]);
      });

      test('adds custom props and preserves node props', () => {
        const state = [1, {foo: 'bar', children: [{text: 'a'}, {text: 'b'}]}, 2];
        const operations: Operation[] = [
          {
            op: 'split',
            path: '/1',
            pos: 0,
            props: {a: 'b'},
          },
        ];
        const result = applyPatch(state, operations, {mutate: true}).doc;
        expect(result).toEqual([
          1,
          {foo: 'bar', a: 'b', children: []},
          {foo: 'bar', a: 'b', children: [{text: 'a'}, {text: 'b'}]},
          2,
        ]);
      });
    });
  });
};
