import type {ApplyPatch} from '../../types';
import type {Operation} from '../../../types';
import type {SlateElementNode, SlateTextNode} from '../../../slate';

export const testMergeOp = (applyPatch: ApplyPatch) => {
  describe('merge', () => {
    test('can merge two nodes in an array', () => {
      const state: SlateTextNode[] = [{text: 'foo'}, {text: 'bar'}];
      const operations: Operation[] = [
        {
          op: 'merge',
          path: '/1',
          pos: 1,
        },
      ];
      const result = applyPatch(state, operations, {mutate: true}).doc;

      expect(result).toEqual([{text: 'foobar'}]);
    });

    test('cannot target first array element when merging', () => {
      const state: SlateTextNode[] = [{text: 'foo'}, {text: 'bar'}];
      const operations: Operation[] = [
        {
          op: 'merge',
          path: '/0',
          pos: 1,
        },
      ];
      expect(() => applyPatch(state, operations, {mutate: true})).toThrow();
    });

    test('can merge slate element nodes', () => {
      const state: {foo: SlateElementNode[]} = {
        foo: [
          {children: [{text: '1'}, {text: '2'}]},
          {children: [{text: '1'}, {text: '2'}]},
          {children: [{text: '3'}, {text: '4'}]},
        ],
      };
      const operations: Operation[] = [
        {
          op: 'merge',
          path: '/foo/2',
          pos: 1,
        },
      ];
      const result = applyPatch(state, operations, {mutate: true}).doc;

      expect(result).toEqual({
        foo: [{children: [{text: '1'}, {text: '2'}]}, {children: [{text: '1'}, {text: '2'}, {text: '3'}, {text: '4'}]}],
      });
    });

    test('cannot merge root', () => {
      expect(() =>
        applyPatch(
          123,
          [
            {
              op: 'merge',
              path: '',
              pos: 1,
            },
          ],
          {mutate: true},
        ),
      ).toThrow();
    });

    test('object element', () => {
      expect(() =>
        applyPatch(
          {foo: 123},
          [
            {
              op: 'merge',
              path: '/foo',
              pos: 1,
            },
          ],
          {mutate: true},
        ),
      ).toThrow();
    });

    test('can merge two Slate.js paragraphs', () => {
      const state: SlateElementNode['children'] = [
        {
          type: 'paragraph',
          children: [
            {
              text: 'a',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'b',
            },
          ],
        },
      ];
      const operations: Operation[] = [
        {
          op: 'merge',
          path: '/1',
          pos: 1,
        },
        {
          op: 'merge',
          path: '/0/children/1',
          pos: 1,
        },
      ];
      const result = applyPatch(state, operations, {mutate: true}).doc;

      expect(result).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              text: 'ab',
            },
          ],
        },
      ]);
    });
  });
};
