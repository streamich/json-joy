import type {Operation} from '../../../json-patch';
import {Model} from '../../model/Model';
import {JsonPatch} from '../JsonPatch';

interface TestCase {
  name: string;
  doc1?: unknown;
  patches: Operation[][];
  doc2?: unknown;
  throws?: string;
  only?: true;
}

const testCases: TestCase[] = [
  {
    name: 'can set boolean as document root',
    doc1: undefined,
    patches: [[{op: 'add', path: '', value: true}]],
    doc2: true,
  },
  {
    name: 'can set string as root value',
    doc1: undefined,
    patches: [[{op: 'add', path: '', value: 'hello world'}]],
    doc2: 'hello world',
  },
  {
    name: 'can set object as root',
    doc1: undefined,
    patches: [[{op: 'add', path: '', value: {a: [1, null]}}]],
    doc2: {a: [1, null]},
  },
  {
    name: 'can set object as document root and update it',
    doc1: undefined,
    patches: [[{op: 'add', path: '', value: {foo: {}}}], [{op: 'add', path: '/foo/bar', value: 123}]],
    doc2: {foo: {bar: 123}},
  },
  {
    name: 'can add element to empty array',
    doc1: [],
    patches: [[{op: 'add', path: '/0', value: 1}]],
    doc2: [1],
  },
  {
    name: 'can add element to end of array',
    doc1: [1],
    patches: [[{op: 'add', path: '/1', value: 2}]],
    doc2: [1, 2],
  },
  {
    name: 'can add element to beginning of array',
    doc1: [1],
    patches: [[{op: 'add', path: '/0', value: 2}]],
    doc2: [2, 1],
  },
  {
    name: 'can add element to middle of array',
    doc1: [1, 2],
    patches: [[{op: 'add', path: '/1', value: 3}]],
    doc2: [1, 3, 2],
  },
  {
    name: 'can push to end of array',
    doc1: [1, 2],
    patches: [[{op: 'add', path: '/-', value: 3}]],
    doc2: [1, 2, 3],
  },
  {
    name: 'can populate an array',
    doc1: {foo: []},
    patches: [
      [{op: 'add', path: '/foo/0', value: 1}],
      [{op: 'add', path: '/foo/0', value: 2}],
      [{op: 'add', path: '/foo/0', value: 3}],
    ],
    doc2: {foo: [3, 2, 1]},
  },
  {
    name: 'can populate an array - 2',
    doc1: {foo: []},
    patches: [
      [
        {op: 'add', path: '/foo/0', value: 1},
        {op: 'add', path: '/foo/0', value: 2},
        {op: 'add', path: '/foo/0', value: 3},
      ],
    ],
    doc2: {foo: [3, 2, 1]},
  },
  {
    name: 'can remove document root value',
    doc1: 'hello',
    patches: [[{op: 'remove', path: ''}]],
    doc2: null,
  },
  {
    name: 'can remove object key',
    doc1: {foo: 'bar'},
    patches: [[{op: 'remove', path: '/foo'}]],
    doc2: {},
  },
  {
    name: 'can remove deep object key',
    doc1: {foo: {}, a: {b: 1, c: 2}},
    patches: [[{op: 'remove', path: '/a/b'}]],
    doc2: {foo: {}, a: {c: 2}},
  },
  {
    name: 'can remove at the beginning of array',
    doc1: {foo: [1, 2, 3]},
    patches: [[{op: 'remove', path: '/foo/0'}]],
    doc2: {foo: [2, 3]},
  },
  {
    name: 'can remove at the end of array',
    doc1: {foo: [1, 2, 3]},
    patches: [[{op: 'remove', path: '/foo/2'}]],
    doc2: {foo: [1, 2]},
  },
  {
    name: 'can remove in the middle of array',
    doc1: {foo: [1, 2, 3]},
    patches: [[{op: 'remove', path: '/foo/1'}]],
    doc2: {foo: [1, 3]},
  },
  {
    name: 'can replace a key value',
    doc1: {
      a: 'a',
      b: 'b',
      c: 'c',
    },
    patches: [[{op: 'replace', path: '/b', value: 'gg'}]],
    doc2: {
      a: 'a',
      b: 'gg',
      c: 'c',
    },
  },
  {
    name: 'can replace a key value using "add"',
    doc1: {
      a: 'a',
      b: 'b',
      c: 'c',
    },
    patches: [[{op: 'add', path: '/b', value: 'gg'}]],
    doc2: {
      a: 'a',
      b: 'gg',
      c: 'c',
    },
  },
  {
    name: '"replace" cannot add a new key',
    doc1: {
      a: 'a',
    },
    patches: [[{op: 'replace', path: '/b', value: 'gg'}]],
    throws: 'NOT_FOUND',
  },
  {
    name: 'can replace document root',
    doc1: {
      a: 'a',
    },
    patches: [[{op: 'replace', path: '', value: 'b'}]],
    doc2: 'b',
  },
  {
    name: 'can array element',
    doc1: {
      foo: [1, 2, 3],
    },
    patches: [[{op: 'replace', path: '/foo/1', value: 'b'}]],
    doc2: {
      foo: [1, 'b', 3],
    },
  },
  {
    name: 'can move from one object key to another',
    doc1: {
      a: 1,
      b: 2,
    },
    patches: [[{op: 'move', from: '/a', path: '/b'}]],
    doc2: {
      b: 1,
    },
  },
  {
    name: 'can move from object to array',
    doc1: {
      a: ['a', 'b'],
      b: 2,
    },
    patches: [[{op: 'move', from: '/b', path: '/a/1'}]],
    doc2: {
      a: ['a', 2, 'b'],
    },
  },
  {
    name: 'can move into object root',
    doc1: {
      a: ['a', 'b'],
      b: 2,
    },
    patches: [[{op: 'move', from: '/a', path: ''}]],
    doc2: ['a', 'b'],
  },
  {
    name: 'cannot move into a child',
    doc1: {
      foo: {
        bar: 123,
      },
    },
    patches: [[{op: 'move', from: '/foo', path: '/foo/bar'}]],
    throws: 'INVALID_CHILD',
  },
  {
    name: 'can copy to object key',
    doc1: {
      a: ['a', 'b'],
    },
    patches: [[{op: 'copy', from: '/a', path: '/b'}]],
    doc2: {
      a: ['a', 'b'],
      b: ['a', 'b'],
    },
  },
  {
    name: 'can copy int array',
    doc1: {
      a: ['a', 'b'],
      b: {aha: 123},
    },
    patches: [[{op: 'copy', from: '/b/aha', path: '/a/1'}]],
    doc2: {
      a: ['a', 123, 'b'],
      b: {aha: 123},
    },
  },
  {
    name: 'can copy int array - 2',
    doc1: {
      a: ['a', 'b'],
      b: {aha: 123},
    },
    patches: [[{op: 'copy', from: '/b', path: '/a/1'}]],
    doc2: {
      a: ['a', {aha: 123}, 'b'],
      b: {aha: 123},
    },
  },
  {
    name: 'can positively test object root',
    doc1: 123,
    patches: [[{op: 'test', path: '', value: 123}]],
    doc2: 123,
  },
  {
    name: 'can negatively test object root',
    doc1: 123,
    patches: [[{op: 'test', path: '', value: 1234}]],
    throws: 'TEST',
  },
  {
    name: 'can negatively test object root - 2',
    doc1: 123,
    patches: [[{op: 'test', path: '', value: '123'}]],
    throws: 'TEST',
  },
  {
    name: 'can negatively test object root - 2',
    doc1: 123,
    patches: [[{op: 'test', path: '', value: '123'}]],
    throws: 'TEST',
  },
  {
    name: 'deeply tests nested object',
    doc1: {
      a: 123,
      b: 'asdf',
      c: [1, 'a', true],
      d: false,
      e: null,
    },
    patches: [
      [
        {
          op: 'test',
          path: '',
          value: {
            a: 123,
            b: 'asdf',
            c: [1, 'a', true],
            d: false,
            e: null,
          },
        },
        {op: 'test', path: '/a', value: 123},
        {op: 'test', path: '/b', value: 'asdf'},
        {op: 'test', path: '/c', value: [1, 'a', true]},
        {op: 'test', path: '/c/0', value: 1},
        {op: 'test', path: '/c/1', value: 'a'},
        {op: 'test', path: '/c/2', value: true},
        {op: 'test', path: '/d', value: false},
        {op: 'test', path: '/e', value: null},
      ],
    ],
    doc2: {
      a: 123,
      b: 'asdf',
      c: [1, 'a', true],
      d: false,
      e: null,
    },
  },
  {
    name: 'deeply negatively tests nested object',
    doc1: {
      a: 123,
      b: 'asdf',
      c: [1, 'a', true],
      d: false,
      e: null,
    },
    patches: [
      [
        {
          op: 'test',
          path: '',
          value: {
            a: '123',
            b: 'asdf',
            c: [1, 'a', true],
            d: false,
            e: null,
          },
        },
      ],
    ],
    throws: 'TEST',
  },
];

for (const {only, name, doc1, doc2, patches, throws} of testCases) {
  (only ? test.only : test)(name, () => {
    const model = Model.create();
    const jsonPatch = new JsonPatch(model);
    if (doc1 !== undefined) model.api.root(doc1);
    if (throws) {
      expect(() => {
        for (const patch of patches) jsonPatch.apply(patch);
      }).toThrow(new Error(throws));
    } else {
      for (const patch of patches) jsonPatch.apply(patch);
      expect(model.view()).toEqual(doc2);
    }
  });
}
