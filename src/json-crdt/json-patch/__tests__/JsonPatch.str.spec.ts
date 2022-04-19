import {Operation} from '../../../json-patch';
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
      [{op: 'str_ins', path: '/foo/0/bar', pos: 3, str: '!'}]
    ],
    doc2: {foo: [{bar: 'baz!'}]},
  },
  {
    name: 'can insert text in nested object - 2',
    doc1: null,
    patches: [
      [{op: 'add', path: '', value: {foo: [{bar: 'baz'}]}}],
      [{op: 'str_ins', path: ['foo', 0, 'bar'], pos: 3, str: '!'}]
    ],
    doc2: {foo: [{bar: 'baz!'}]},
  },
];

for (const {only, name, doc1, doc2, patches, throws} of testCases) {
  (only ? test.only : test)(name, () => {
    const model = Model.withLogicalClock();
    const jsonPatch = new JsonPatch(model);
    if (doc1 !== undefined) model.api.root(doc1).commit();
    if (throws) {
      expect(() => {
        for (const patch of patches) jsonPatch.apply(patch).commit();
      }).toThrow(new Error(throws));
    } else {
      for (const patch of patches) jsonPatch.apply(patch).commit();
      expect(model.toView()).toEqual(doc2);
    }
  });
}
