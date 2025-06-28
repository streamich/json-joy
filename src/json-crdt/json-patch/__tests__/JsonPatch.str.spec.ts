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
    name: 'can insert char in empty string',
    doc1: '',
    patches: [[{op: 'str_ins', path: '', pos: 0, str: 'a'}]],
    doc2: 'a',
  },
  {
    name: 'can insert char at the end of string',
    doc1: '1',
    patches: [[{op: 'str_ins', path: '', pos: 1, str: '2'}]],
    doc2: '12',
  },
  {
    name: 'can insert char beyond end of string',
    doc1: '1',
    patches: [[{op: 'str_ins', path: '', pos: 111, str: '2'}]],
    doc2: '12',
  },
  {
    name: 'can insert char beyond end of string - 2',
    doc1: '1',
    patches: [[{op: 'str_ins', path: '', pos: 2, str: '2'}]],
    doc2: '12',
  },
  {
    name: 'can insert char at the beginning of string',
    doc1: '1',
    patches: [[{op: 'str_ins', path: '', pos: 0, str: '0'}]],
    doc2: '01',
  },
  {
    name: 'can insert char in the middle of string',
    doc1: '25',
    patches: [[{op: 'str_ins', path: '', pos: 1, str: '.'}]],
    doc2: '2.5',
  },
  {
    name: 'can insert text in nested object',
    doc1: null,
    patches: [
      [{op: 'add', path: '', value: {foo: [{bar: 'baz'}]}}],
      [{op: 'str_ins', path: '/foo/0/bar', pos: 3, str: '!'}],
    ],
    doc2: {foo: [{bar: 'baz!'}]},
  },
  {
    name: 'can insert text in nested object - 2',
    doc1: null,
    patches: [
      [{op: 'add', path: '', value: {foo: [{bar: 'baz'}]}}],
      [{op: 'str_ins', path: ['foo', 0, 'bar'], pos: 3, str: '!'}],
    ],
    doc2: {foo: [{bar: 'baz!'}]},
  },
  {
    name: 'can delete a single char',
    doc1: 'a',
    patches: [[{op: 'str_del', path: [], pos: 0, len: 1}]],
    doc2: '',
  },
  {
    name: 'can delete from already empty string',
    doc1: '',
    patches: [[{op: 'str_del', path: [], pos: 0, len: 1}]],
    doc2: '',
  },
  {
    name: 'can delete at the end of string',
    doc1: 'ab',
    patches: [[{op: 'str_del', path: [], pos: 1, len: 1}]],
    doc2: 'a',
  },
  {
    name: 'can delete at the beginning of string',
    doc1: 'ab',
    patches: [[{op: 'str_del', path: [], pos: 0, len: 1}]],
    doc2: 'b',
  },
  {
    name: 'can delete in the middle of string',
    doc1: 'abc',
    patches: [[{op: 'str_del', path: [], pos: 1, len: 1}]],
    doc2: 'ac',
  },
  {
    name: 'can delete multiple chars',
    doc1: '1234',
    patches: [[{op: 'str_del', path: [], pos: 1, len: 2}], [{op: 'str_del', path: [], pos: 1, len: 5}]],
    doc2: '1',
  },
  {
    name: 'handles deletion beyond end of string',
    doc1: '1234',
    patches: [[{op: 'str_del', path: [], pos: 1111, len: 2}]],
    doc2: '1234',
  },
  {
    name: 'can delete a string in object',
    doc1: {foo: '123'},
    patches: [[{op: 'str_del', path: '/foo', pos: 1, len: 2}]],
    doc2: {foo: '1'},
  },
];

for (const {only, name, doc1, doc2, patches, throws} of testCases) {
  (only ? test.only : test)(name, () => {
    const model = Model.withLogicalClock();
    const jsonPatch = new JsonPatch(model);
    if (doc1 !== undefined) model.api.set(doc1);
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
