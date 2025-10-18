import {b} from '@jsonjoy.com/buffers/lib/b';

interface Test {
  description: string;
  value1: unknown;
  value2: unknown;
  equal: boolean;
}

interface Suite {
  description: string;
  tests: Test[];
}

export const tests: Suite[] = [
  {
    description: 'scalars',
    tests: [
      {
        description: 'equal numbers',
        value1: 1,
        value2: 1,
        equal: true,
      },
      {
        description: 'not equal numbers',
        value1: 1,
        value2: 2,
        equal: false,
      },
      {
        description: 'number and array are not equal',
        value1: 1,
        value2: [],
        equal: false,
      },
      {
        description: '0 and null are not equal',
        value1: 0,
        value2: null,
        equal: false,
      },
      {
        description: 'equal strings',
        value1: 'a',
        value2: 'a',
        equal: true,
      },
      {
        description: 'not equal strings',
        value1: 'a',
        value2: 'b',
        equal: false,
      },
      {
        description: 'empty string and null are not equal',
        value1: '',
        value2: null,
        equal: false,
      },
      {
        description: 'null is equal to null',
        value1: null,
        value2: null,
        equal: true,
      },
      {
        description: 'equal booleans (true)',
        value1: true,
        value2: true,
        equal: true,
      },
      {
        description: 'equal booleans (false)',
        value1: false,
        value2: false,
        equal: true,
      },
      {
        description: 'not equal booleans',
        value1: true,
        value2: false,
        equal: false,
      },
      {
        description: '1 and true are not equal',
        value1: 1,
        value2: true,
        equal: false,
      },
      {
        description: '0 and false are not equal',
        value1: 0,
        value2: false,
        equal: false,
      },
      {
        description: '0 and -0 are equal',
        value1: 0,
        value2: -0,
        equal: true,
      },
      {
        description: 'Infinity and Infinity are equal',
        value1: Infinity,
        value2: Infinity,
        equal: true,
      },
      {
        description: 'Infinity and -Infinity are not equal',
        value1: Infinity,
        value2: -Infinity,
        equal: false,
      },
    ],
  },

  {
    description: 'objects',
    tests: [
      {
        description: 'empty objects are equal',
        value1: {},
        value2: {},
        equal: true,
      },
      {
        description: 'equal objects (same properties "order")',
        value1: {a: 1, b: '2'},
        value2: {a: 1, b: '2'},
        equal: true,
      },
      {
        description: 'equal objects (different properties "order")',
        value1: {a: 1, b: '2'},
        value2: {b: '2', a: 1},
        equal: true,
      },
      {
        description: 'not equal objects (extra property)',
        value1: {a: 1, b: '2'},
        value2: {a: 1, b: '2', c: []},
        equal: false,
      },
      {
        description: 'not equal objects (different property values)',
        value1: {a: 1, b: '2', c: 3},
        value2: {a: 1, b: '2', c: 4},
        equal: false,
      },
      {
        description: 'not equal objects (different properties)',
        value1: {a: 1, b: '2', c: 3},
        value2: {a: 1, b: '2', d: 3},
        equal: false,
      },
      {
        description: 'equal objects (same sub-properties)',
        value1: {a: [{b: 'c'}]},
        value2: {a: [{b: 'c'}]},
        equal: true,
      },
      {
        description: 'not equal objects (different sub-property value)',
        value1: {a: [{b: 'c'}]},
        value2: {a: [{b: 'd'}]},
        equal: false,
      },
      {
        description: 'not equal objects (different sub-property)',
        value1: {a: [{b: 'c'}]},
        value2: {a: [{c: 'c'}]},
        equal: false,
      },
      {
        description: 'empty array and empty object are not equal',
        value1: {},
        value2: [],
        equal: false,
      },
      {
        description: 'nulls are equal',
        value1: null,
        value2: null,
        equal: true,
      },
      {
        description: 'null and undefined are not equal',
        value1: null,
        value2: undefined,
        equal: false,
      },
      {
        description: 'null and empty object are not equal',
        value1: null,
        value2: {},
        equal: false,
      },
      {
        description: 'undefined and empty object are not equal',
        value1: undefined,
        value2: {},
        equal: false,
      },
    ],
  },

  {
    description: 'arrays',
    tests: [
      {
        description: 'two empty arrays are equal',
        value1: [],
        value2: [],
        equal: true,
      },
      {
        description: 'equal arrays',
        value1: [1, 2, 3],
        value2: [1, 2, 3],
        equal: true,
      },
      {
        description: 'not equal arrays (different item)',
        value1: [1, 2, 3],
        value2: [1, 2, 4],
        equal: false,
      },
      {
        description: 'not equal arrays (different length)',
        value1: [1, 2, 3],
        value2: [1, 2],
        equal: false,
      },
      {
        description: 'equal arrays of objects',
        value1: [{a: 'a'}, {b: 'b'}],
        value2: [{a: 'a'}, {b: 'b'}],
        equal: true,
      },
      {
        description: 'not equal arrays of objects',
        value1: [{a: 'a'}, {b: 'b'}],
        value2: [{a: 'a'}, {b: 'c'}],
        equal: false,
      },
      {
        description: 'pseudo array and equivalent array are not equal',
        value1: {'0': 0, '1': 1, length: 2},
        value2: [0, 1],
        equal: false,
      },
    ],
  },

  {
    description: 'binary',
    tests: [
      {
        description: 'two empty blobs',
        value1: new Uint8Array(0),
        value2: new Uint8Array(0),
        equal: true,
      },
      {
        description: 'two single char blobs',
        value1: b(0),
        value2: b(0),
        equal: true,
      },
      {
        description: 'small blobs',
        value1: b(1, 2, 3),
        value2: b(1, 2, 3),
        equal: true,
      },
      {
        description: 'empty blob not equal to empty array',
        value1: b(),
        value2: [],
        equal: false,
      },
      {
        description: 'empty blob not equal to non-empty blob',
        value1: b(),
        value2: b(1),
        equal: false,
      },
    ],
  },

  {
    description: 'sample objects',
    tests: [
      {
        description: 'big object',
        value1: {
          prop1: 'value1',
          prop2: 'value2',
          prop3: 'value3',
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5],
            },
          },
          prop5: 1000,
        },
        value2: {
          prop5: 1000,
          prop3: 'value3',
          prop1: 'value1',
          prop2: 'value2',
          prop4: {
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5],
            },
            subProp1: 'sub value1',
          },
        },
        equal: true,
      },
    ],
  },
];
