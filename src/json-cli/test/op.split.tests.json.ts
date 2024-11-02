import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Slate.js, split a single "ab" paragraphs into two',
    doc: [
      {
        children: [
          {
            text: 'ab',
          },
        ],
      },
    ],
    patch: [
      {
        op: 'split',
        path: '/0/children/0',
        pos: 1,
      },
    ],
    expected: [
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
    ],
  },
  {
    comment: 'Slate.js, split two element blocks into one',
    doc: [
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
    ],
    patch: [
      {
        op: 'split',
        path: '/0',
        pos: 1,
      },
    ],
    expected: [
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
    ],
  },
  {
    comment: 'Slate.js, can split paragraph in two and insert a character',
    doc: [
      {
        children: [
          {
            text: 'ab',
          },
        ],
      },
    ],
    patch: [
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
    ],
    expected: [
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
    ],
  },

  {
    comment: 'At root, string, can split string in two',
    doc: '1234',
    patch: [
      {
        op: 'split',
        path: '',
        pos: 2,
      },
    ],
    expected: ['12', '34'],
  },
  {
    comment: 'At root, string, can split string in two at pos=1',
    doc: '1234',
    patch: [
      {
        op: 'split',
        path: '',
        pos: 1,
      },
    ],
    expected: ['1', '234'],
  },
  {
    comment: 'At root, string, can split string in two from beginning',
    doc: '1234',
    patch: [
      {
        op: 'split',
        path: '',
        pos: 0,
      },
    ],
    expected: ['', '1234'],
  },
  {
    comment: 'At root, string, can split string in two from end',
    doc: '1234',
    patch: [
      {
        op: 'split',
        path: '',
        pos: 4,
      },
    ],
    expected: ['1234', ''],
  },
  {
    comment: 'At root, string, can split string in two when pos is greater than string length',
    doc: '12345',
    patch: [
      {
        op: 'split',
        path: '',
        pos: 99999,
      },
    ],
    expected: ['12345', ''],
  },
  {
    comment: 'At root, string, takes characters from end if pos is negative',
    doc: '12345',
    patch: [
      {
        op: 'split',
        path: '',
        pos: -1,
      },
    ],
    expected: ['1234', '5'],
  },
  {
    comment: 'At root, string, takes characters from end if pos is negative - 2',
    doc: '12345',
    patch: [
      {
        op: 'split',
        path: '',
        pos: -2,
      },
    ],
    expected: ['123', '45'],
  },
  {
    comment: 'At root, string, when negative pos overflows, first element is empty',
    doc: '12345',
    patch: [
      {
        op: 'split',
        path: '',
        pos: -7,
      },
    ],
    expected: ['', '12345'],
  },

  {
    comment: 'At root, SlateTextNode, splits simple SlateTextNode',
    doc: {
      text: 'foo bar',
    },
    patch: [{op: 'split', path: '', pos: 3}],
    expected: [{text: 'foo'}, {text: ' bar'}],
  },
  {
    comment: 'At root, SlateTextNode, preserves text node attributes',
    doc: {
      text: 'foo bar',
      foo: 'bar',
    },
    patch: [{op: 'split', path: '', pos: 3}],
    expected: [
      {text: 'foo', foo: 'bar'},
      {text: ' bar', foo: 'bar'},
    ],
  },
  {
    comment: 'At root, SlateTextNode, can add custom attributes',
    doc: {
      text: 'foo bar',
      foo: 'bar',
    },
    patch: [{op: 'split', path: '', pos: 3, props: {baz: 'qux'}}],
    expected: [
      {text: 'foo', foo: 'bar', baz: 'qux'},
      {text: ' bar', foo: 'bar', baz: 'qux'},
    ],
  },
  {
    comment: 'At root, SlateTextNode, custom attributes can overwrite node attributes',
    doc: {
      text: 'foo bar',
      foo: 'bar',
    },
    patch: [{op: 'split', path: '', pos: 3, props: {foo: '1'}}],
    expected: [
      {text: 'foo', foo: '1'},
      {text: ' bar', foo: '1'},
    ],
  },
  {
    comment: 'At root, SlateElementNode, splits simple node',
    doc: {
      children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
    },
    patch: [{op: 'split', path: '', pos: 1}],
    expected: [
      {
        children: [{text: 'foo'}],
      },
      {
        children: [{text: 'bar'}, {text: 'baz'}],
      },
    ],
  },
  {
    comment: 'At root, SlateElementNode, can provide custom attributes',
    doc: {
      children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
    },
    patch: [{op: 'split', path: '', pos: 2, props: {f: 1}}],
    expected: [
      {
        f: 1,
        children: [{text: 'foo'}, {text: 'bar'}],
      },
      {
        f: 1,
        children: [{text: 'baz'}],
      },
    ],
  },
  {
    comment: 'At root, SlateElementNode, carries over node attributes',
    doc: {
      a: 1,
      children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
    },
    patch: [{op: 'split', path: '', pos: 2, props: {f: 2}}],
    expected: [
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
    ],
  },
  {
    comment: 'At root, SlateElementNode, can overwrite node attributes',
    doc: {
      a: 1,
      c: 3,
      children: [{text: 'foo'}, {text: 'bar'}, {text: 'baz'}],
    },
    patch: [{op: 'split', path: '', pos: 2, props: {f: 2, a: 2}}],
    expected: [
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
    ],
  },

  {
    comment: 'In object, can split string in two',
    doc: {foo: 'ab'},
    patch: [
      {
        op: 'split',
        path: '/foo',
        pos: 1,
      },
    ],
    expected: {foo: ['a', 'b']},
  },
  {
    comment: 'In object, if attribute are specified, wraps strings into nodes',
    doc: {foo: 'ab'},
    patch: [
      {
        op: 'split',
        path: '/foo',
        pos: 1,
        props: {z: 'x'},
      },
    ],
    expected: {
      foo: [
        {text: 'a', z: 'x'},
        {text: 'b', z: 'x'},
      ],
    },
  },
  {
    comment: 'In object, splits SlateTextNode',
    doc: {foo: {text: '777'}},
    patch: [
      {
        op: 'split',
        path: '/foo',
        pos: 1,
        props: {z: 'x'},
      },
    ],
    expected: {
      foo: [
        {text: '7', z: 'x'},
        {text: '77', z: 'x'},
      ],
    },
  },
  {
    comment: 'In object, crates a tuple if target is a boolean value',
    doc: {foo: true},
    patch: [
      {
        op: 'split',
        path: '/foo',
        pos: 1,
      },
    ],
    expected: {foo: [true, true]},
  },
  {
    comment: 'In object, divides number into two haves if target is a number',
    doc: {foo: 10},
    patch: [
      {
        op: 'split',
        path: '/foo',
        pos: 9,
      },
    ],
    expected: {foo: [9, 1]},
  },

  {
    comment: 'In array, splits SlateElementNode into two',
    doc: [1, {children: [{text: 'a'}, {text: 'b'}]}, 2],
    patch: [
      {
        op: 'split',
        path: '/1',
        pos: 0,
      },
    ],
    expected: [1, {children: []}, {children: [{text: 'a'}, {text: 'b'}]}, 2],
  },
  {
    comment: 'In array, adds custom props and preserves node props',
    doc: [1, {foo: 'bar', children: [{text: 'a'}, {text: 'b'}]}, 2],
    patch: [
      {
        op: 'split',
        path: '/1',
        pos: 0,
        props: {a: 'b'},
      },
    ],
    expected: [1, {foo: 'bar', a: 'b', children: []}, {foo: 'bar', a: 'b', children: [{text: 'a'}, {text: 'b'}]}, 2],
  },
];

export default testCases;
