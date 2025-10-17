import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Can merge two nodes in an array',
    doc: [{text: 'foo'}, {text: 'bar'}],
    patch: [
      {
        op: 'merge',
        path: '/1',
        pos: 1,
      },
    ],
    expected: [{text: 'foobar'}],
  },
  {
    comment: 'Cannot target first array element when merging',
    doc: [{text: 'foo'}, {text: 'bar'}],
    patch: [
      {
        op: 'merge',
        path: '/0',
        pos: 1,
      },
    ],
    error: 'INVALID_KEY',
  },
  {
    comment: 'Can merge slate element nodes',
    doc: {
      foo: [
        {children: [{text: '1'}, {text: '2'}]},
        {children: [{text: '1'}, {text: '2'}]},
        {children: [{text: '3'}, {text: '4'}]},
      ],
    },
    patch: [
      {
        op: 'merge',
        path: '/foo/2',
        pos: 1,
      },
    ],
    expected: {
      foo: [{children: [{text: '1'}, {text: '2'}]}, {children: [{text: '1'}, {text: '2'}, {text: '3'}, {text: '4'}]}],
    },
  },
  {
    comment: 'Cannot merge root',
    doc: 123,
    patch: [
      {
        op: 'merge',
        path: '',
        pos: 1,
      },
    ],
    error: 'INVALID_TARGET',
  },
  {
    comment: 'Cannot merge object element',
    doc: {foo: 123},
    patch: [
      {
        op: 'merge',
        path: '/foo',
        pos: 1,
      },
    ],
    error: 'INVALID_TARGET',
  },
  {
    comment: 'Can merge two Slate.js paragraphs',
    doc: [
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
    ],
    patch: [
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
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'ab',
          },
        ],
      },
    ],
  },
];

export default testCases;
