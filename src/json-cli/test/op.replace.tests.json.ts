import {clone as deepClone} from '@jsonjoy.com/util/lib/json-clone/clone';
import type {TestCase} from './types';

const values: [string, unknown][] = [
  ['"null"', null],
  // ['"true"', true],
  ['"false"', false],
  ['integer', 123],
  // ['float', -1.2],
  // ['empty string', ''],
  ['string', 'asdf'],
  // ['empty object', {}],
  ['simple object', {foo: 'bar'}],
  // ['nested object', {foo: {bar: 'baz'}}],
  // ['empty array', []],
  ['simple array', [1, 'a', false]],
  // ['nested array', [[{foo: [1, 2, null]}]]],
];

const testCases: TestCase[] = [
  {
    comment: 'Replacing non-existing object key, first level',
    doc: {},
    patch: [{op: 'replace', path: '/foo', value: 'bar'}],
    error: 'NOT_FOUND',
  },
];

for (const [name, doc] of values) {
  for (const [name2, doc2] of values) {
    testCases.push({
      comment: `Replace root ${name} by ${name2}`,
      doc: deepClone(doc),
      patch: [{op: 'replace', path: '', value: deepClone(doc2)}],
      expected: deepClone(doc2),
    });
  }
}

for (const [name, doc] of values) {
  for (const [name2, doc2] of values) {
    testCases.push({
      comment: `Replace first level object ${name} by ${name2}`,
      doc: {
        foo: 'bar',
        baz: 123,
        asdf: deepClone(doc),
        gg: true,
        aha: null,
      },
      patch: [{op: 'replace', path: '/asdf', value: deepClone(doc2)}],
      expected: {
        foo: 'bar',
        baz: 123,
        asdf: deepClone(doc2),
        gg: true,
        aha: null,
      },
    });
  }
}

for (const [name, doc] of values) {
  for (const [name2, doc2] of values) {
    testCases.push({
      comment: `Replace first level object ${name} by ${name2}`,
      doc: {
        foo: 'bar',
        baz: 123,
        test: {
          '1': 1234,
          '2': {
            gg: deepClone(doc),
          },
        },
        gg: true,
        aha: null,
      },
      patch: [{op: 'replace', path: '/test/2/gg', value: deepClone(doc2)}],
      expected: {
        foo: 'bar',
        baz: 123,
        test: {
          '1': 1234,
          '2': {
            gg: deepClone(doc2),
          },
        },
        gg: true,
        aha: null,
      },
    });
  }
}

for (const [name, doc] of values) {
  for (const [name2, doc2] of values) {
    testCases.push({
      comment: `Replace first level array ${name} by ${name2}, in the middle of array`,
      doc: ['bar', 123, false, {}, [], deepClone(doc), true, null],
      patch: [{op: 'replace', path: '/5', value: deepClone(doc2)}],
      expected: ['bar', 123, false, {}, [], deepClone(doc2), true, null],
    });
  }
}

for (const [name, doc] of values) {
  for (const [name2, doc2] of values) {
    testCases.push({
      comment: `Replace deeply nested array ${name} by ${name2}, at the first position`,
      doc: [
        'bar',
        [
          123,
          {
            hmm: [deepClone(doc), 1, 2, 3, 4],
          },
        ],
      ],
      patch: [{op: 'replace', path: '/1/1/hmm/0', value: deepClone(doc2)}],
      expected: [
        'bar',
        [
          123,
          {
            hmm: [deepClone(doc2), 1, 2, 3, 4],
          },
        ],
      ],
    });
  }
}

export default testCases;
