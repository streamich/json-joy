import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Empty dock, empty patch',
    doc: {},
    patch: [],
    expected: {},
  },

  {
    comment: 'Empty patch',
    doc: {foo: 1},
    patch: [],
    expected: {foo: 1},
  },

  {
    comment: 'Rearrange object keys',
    doc: {foo: 1, bar: 2},
    patch: [],
    expected: {bar: 2, foo: 1},
  },

  {
    comment: 'Rearrange object keys in array',
    doc: [{foo: 1, bar: 2}],
    patch: [],
    expected: [{bar: 2, foo: 1}],
  },

  {
    comment: 'Rearrange object keys in object',
    doc: {foo: {foo: 1, bar: 2}},
    patch: [],
    expected: {foo: {bar: 2, foo: 1}},
  },

  {
    comment: 'Add replaces any existing field',
    doc: {foo: null},
    patch: [{op: 'add', path: '/foo', value: 1}],
    expected: {foo: 1},
  },

  {comment: 'Top level array', doc: [], patch: [{op: 'add', path: '/0', value: 'foo'}], expected: ['foo']},

  {comment: 'Top level array, no change', doc: ['foo'], patch: [], expected: ['foo']},

  {
    comment: 'Top level object, numeric string',
    doc: {},
    patch: [{op: 'add', path: '/foo', value: '1'}],
    expected: {foo: '1'},
  },

  {comment: 'Top level object, integer', doc: {}, patch: [{op: 'add', path: '/foo', value: 1}], expected: {foo: 1}},

  {
    comment: 'Top level scalar values OK?',
    doc: 'foo',
    patch: [{op: 'replace', path: '', value: 'bar'}],
    expected: 'bar',
    disabled: true,
  },

  {comment: 'Add, / target', doc: {}, patch: [{op: 'add', path: '/', value: 1}], expected: {'': 1}},

  {
    comment: 'Add composite value at top level',
    doc: {foo: 1},
    patch: [{op: 'add', path: '/bar', value: [1, 2]}],
    expected: {foo: 1, bar: [1, 2]},
  },

  {
    comment: 'Add into composite value',
    doc: {foo: 1, baz: [{qux: 'hello'}]},
    patch: [{op: 'add', path: '/baz/0/foo', value: 'world'}],
    expected: {foo: 1, baz: [{qux: 'hello', foo: 'world'}]},
  },

  {
    comment: 'Array location out of bounds, inside object',
    doc: {bar: [1, 2]},
    patch: [{op: 'add', path: '/bar/8', value: '5'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'Array location negative, inside object',
    doc: {bar: [1, 2]},
    patch: [{op: 'add', path: '/bar/-2', value: '5'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'Add object key equal to "true", first level object',
    doc: {foo: 1},
    patch: [{op: 'add', path: '/bar', value: true}],
    expected: {foo: 1, bar: true},
  },

  {
    comment: 'Add object key equal to "false", first level object',
    doc: {foo: 1},
    patch: [{op: 'add', path: '/bar', value: false}],
    expected: {foo: 1, bar: false},
  },

  {
    comment: 'Add object key equal to "null", first level object',
    doc: {foo: 1},
    patch: [{op: 'add', path: '/bar', value: null}],
    expected: {foo: 1, bar: null},
  },

  {
    comment: '0 can be an array index or object element name',
    doc: {foo: 1},
    patch: [{op: 'add', path: '/0', value: 'bar'}],
    expected: {foo: 1, '0': 'bar'},
  },

  {
    comment: 'First level array, insert at second position in array with one element',
    doc: ['foo'],
    patch: [{op: 'add', path: '/1', value: 'bar'}],
    expected: ['foo', 'bar'],
  },

  {
    comment: 'First level array, insert at second position in the middle of two element array',
    doc: ['foo', 'sil'],
    patch: [{op: 'add', path: '/1', value: 'bar'}],
    expected: ['foo', 'bar', 'sil'],
  },

  {
    comment: 'First level array, insert at first position in array with two elements',
    doc: ['foo', 'sil'],
    patch: [{op: 'add', path: '/0', value: 'bar'}],
    expected: ['bar', 'foo', 'sil'],
  },

  {
    comment: 'First level array, insert at third position in array with two element',
    doc: ['foo', 'sil'],
    patch: [{op: 'add', path: '/2', value: 'bar'}],
    expected: ['foo', 'sil', 'bar'],
  },

  {
    comment: 'Test against implementation-specific numeric parsing',
    doc: {'1e0': 'foo'},
    patch: [{op: 'test', path: '/1e0', value: 'foo'}],
    expected: {'1e0': 'foo'},
  },

  {
    comment: 'Test with bad number should fail',
    doc: ['foo', 'bar'],
    patch: [{op: 'test', path: '/1e0', value: 'bar'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'First level array, inserting using string index',
    doc: ['foo', 'sil'],
    patch: [{op: 'add', path: '/bar', value: 42}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'First level object, remove key containing array',
    doc: {foo: 1, bar: [1, 2, 3, 4]},
    patch: [{op: 'remove', path: '/bar'}],
    expected: {foo: 1},
  },

  {
    comment: 'Value in array add not flattened',
    doc: ['foo', 'sil'],
    patch: [{op: 'add', path: '/1', value: ['bar', 'baz']}],
    expected: ['foo', ['bar', 'baz'], 'sil'],
  },

  {
    comment: 'Remove string key from object, three levels deep, in array and object',
    doc: {foo: 1, baz: [{qux: 'hello'}]},
    patch: [{op: 'remove', path: '/baz/0/qux'}],
    expected: {foo: 1, baz: [{}]},
  },

  {
    comment: 'Insert array into object at first level.',
    doc: {foo: 1, baz: [{qux: 'hello'}]},
    patch: [{op: 'replace', path: '/foo', value: [1, 2, 3, 4]}],
    expected: {foo: [1, 2, 3, 4], baz: [{qux: 'hello'}]},
  },

  {
    comment: 'Replace object key at three levels deep',
    doc: {foo: [1, 2, 3, 4], baz: [{qux: 'hello'}]},
    patch: [{op: 'replace', path: '/baz/0/qux', value: 'world'}],
    expected: {foo: [1, 2, 3, 4], baz: [{qux: 'world'}]},
  },

  {
    comment: 'First level array with one element, replace that element with string',
    doc: ['foo'],
    patch: [{op: 'replace', path: '/0', value: 'bar'}],
    expected: ['bar'],
  },

  {
    comment: 'First level array with one element, replace that element with 0',
    doc: [''],
    patch: [{op: 'replace', path: '/0', value: 0}],
    expected: [0],
  },

  {
    comment: 'First level array with one element, replace that element with true',
    doc: [''],
    patch: [{op: 'replace', path: '/0', value: true}],
    expected: [true],
  },

  {
    comment: 'First level array with one element, replace that element with false',
    doc: [''],
    patch: [{op: 'replace', path: '/0', value: false}],
    expected: [false],
  },

  {
    comment: 'First level array with one element, replace that element with null',
    doc: [''],
    patch: [{op: 'replace', path: '/0', value: null}],
    expected: [null],
  },

  {
    comment: 'Value in array replace not flattened',
    doc: ['foo', 'sil'],
    patch: [{op: 'replace', path: '/1', value: ['bar', 'baz']}],
    expected: ['foo', ['bar', 'baz']],
  },

  {
    comment: 'Replace whole document',
    doc: {foo: 'bar'},
    patch: [{op: 'replace', path: '', value: {baz: 'qux'}}],
    expected: {baz: 'qux'},
  },

  {
    comment: 'Allow spurious patch properties',
    doc: {foo: 1},
    patch: [{op: 'test', path: '/foo', value: 1, spurious: 1} as any],
    expected: {foo: 1},
  },

  {
    comment: 'null value should be valid obj property',
    doc: {foo: null},
    patch: [{op: 'test', path: '/foo', value: null}],
    expected: {foo: null},
  },

  {
    comment: 'null value should be valid obj property to be replaced with something truthy',
    doc: {foo: null},
    patch: [{op: 'replace', path: '/foo', value: 'truthy'}],
    expected: {foo: 'truthy'},
  },

  {
    comment: 'null value should be valid obj property to be moved',
    doc: {foo: null},
    patch: [{op: 'move', from: '/foo', path: '/bar'}],
    expected: {bar: null},
  },

  {
    comment: 'null value should be valid obj property to be copied',
    doc: {foo: null},
    patch: [{op: 'copy', from: '/foo', path: '/bar'}],
    expected: {foo: null, bar: null},
  },

  {
    comment: 'null value should be valid obj property to be removed',
    doc: {foo: null},
    patch: [{op: 'remove', path: '/foo'}],
    expected: {},
  },

  {
    comment: 'null value should still be valid obj property replace other value',
    doc: {foo: 'bar'},
    patch: [{op: 'replace', path: '/foo', value: null}],
    expected: {foo: null},
  },

  {
    comment: 'Test should pass despite rearrangement',
    doc: {foo: {foo: 1, bar: 2}},
    patch: [{op: 'test', path: '/foo', value: {bar: 2, foo: 1}}],
    expected: {foo: {foo: 1, bar: 2}},
  },

  {
    comment: 'Test should pass despite (nested) rearrangement',
    doc: {foo: [{foo: 1, bar: 2}]},
    patch: [{op: 'test', path: '/foo', value: [{bar: 2, foo: 1}]}],
    expected: {foo: [{foo: 1, bar: 2}]},
  },

  {
    comment: 'Test should pass - no error',
    doc: {foo: {bar: [1, 2, 5, 4]}},
    patch: [{op: 'test', path: '/foo', value: {bar: [1, 2, 5, 4]}}],
    expected: {foo: {bar: [1, 2, 5, 4]}},
  },

  {
    comment: 'Test operation shoul not match object for array',
    doc: {foo: {bar: [1, 2, 5, 4]}},
    patch: [{op: 'test', path: '/foo', value: [1, 2]}],
    error: 'TEST',
  },

  {comment: 'Whole document', doc: {foo: 1}, patch: [{op: 'test', path: '', value: {foo: 1}}], disabled: true},

  {comment: 'Empty-string element', doc: {'': 1}, expected: {'': 1}, patch: [{op: 'test', path: '/', value: 1}]},

  {
    comment: 'JSON Pointer spec tests',
    doc: {
      foo: ['bar', 'baz'],
      '': 0,
      'a/b': 1,
      'c%d': 2,
      'e^f': 3,
      'g|h': 4,
      'i\\j': 5,
      'k"l': 6,
      ' ': 7,
      'm~n': 8,
    },
    expected: {
      foo: ['bar', 'baz'],
      '': 0,
      'a/b': 1,
      'c%d': 2,
      'e^f': 3,
      'g|h': 4,
      'i\\j': 5,
      'k"l': 6,
      ' ': 7,
      'm~n': 8,
    },
    patch: [
      {op: 'test', path: '/foo', value: ['bar', 'baz']},
      {op: 'test', path: '/foo/0', value: 'bar'},
      {op: 'test', path: '/', value: 0},
      {op: 'test', path: '/a~1b', value: 1},
      {op: 'test', path: '/c%d', value: 2},
      {op: 'test', path: '/e^f', value: 3},
      {op: 'test', path: '/g|h', value: 4},
      {op: 'test', path: '/i\\j', value: 5},
      {op: 'test', path: '/k"l', value: 6},
      {op: 'test', path: '/ ', value: 7},
      {op: 'test', path: '/m~0n', value: 8},
    ],
  },

  {
    comment: 'Move to same location has no effect',
    doc: {foo: 1},
    patch: [{op: 'move', from: '/foo', path: '/foo'}],
    expected: {foo: 1},
  },

  {
    comment: 'Insert key into first level object',
    doc: {foo: 1, baz: [{qux: 'hello'}]},
    patch: [{op: 'move', from: '/foo', path: '/bar'}],
    expected: {baz: [{qux: 'hello'}], bar: 1},
  },

  {
    comment: 'Insert key into third level object',
    doc: {baz: [{qux: 'hello'}], bar: 1},
    patch: [{op: 'move', from: '/baz/0/qux', path: '/baz/1'}],
    expected: {baz: [{}, 'hello'], bar: 1},
  },

  {
    comment: 'Insert element into array at second level into first position',
    doc: {baz: [{qux: 'hello'}], bar: 1},
    patch: [{op: 'copy', from: '/baz/0', path: '/boo'}],
    expected: {baz: [{qux: 'hello'}], bar: 1, boo: {qux: 'hello'}},
  },

  {
    comment: 'Replacing the root of the document is possible with add',
    doc: {foo: 'bar'},
    patch: [{op: 'add', path: '', value: {baz: 'qux'}}],
    expected: {baz: 'qux'},
  },

  {
    comment: 'Adding to "/-" adds to the end of the array',
    doc: [1, 2],
    patch: [{op: 'add', path: '/-', value: {foo: ['bar', 'baz']}}],
    expected: [1, 2, {foo: ['bar', 'baz']}],
  },

  {
    comment: 'Adding to "/-" adds to the end of the array, even n levels down',
    doc: [1, 2, [3, [4, 5]]],
    patch: [{op: 'add', path: '/2/1/-', value: {foo: ['bar', 'baz']}}],
    expected: [1, 2, [3, [4, 5, {foo: ['bar', 'baz']}]]],
  },

  {
    comment: 'Test remove with bad number should fail',
    doc: {foo: 1, baz: [{qux: 'hello'}]},
    patch: [{op: 'remove', path: '/baz/1e0/qux'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'Test remove on array',
    doc: [1, 2, 3, 4],
    patch: [{op: 'remove', path: '/0'}],
    expected: [2, 3, 4],
  },

  {
    comment: 'Repeated removes',
    doc: [1, 2, 3, 4],
    patch: [
      {op: 'remove', path: '/1'},
      {op: 'remove', path: '/2'},
    ],
    expected: [1, 3],
    skipInJsonOt: true,
  },

  {
    comment: 'Remove with bad index should fail',
    doc: [1, 2, 3, 4],
    patch: [{op: 'remove', path: '/1e0'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'Replace with bad number should fail',
    doc: [''],
    patch: [{op: 'replace', path: '/1e0', value: false}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'Test copy with bad number should fail',
    doc: {baz: [1, 2, 3], bar: 1},
    patch: [{op: 'copy', from: '/baz/1e0', path: '/boo'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'Test move with bad number should fail',
    doc: {foo: 1, baz: [1, 2, 3, 4]},
    patch: [{op: 'move', from: '/baz/1e0', path: '/foo'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: 'Test add with bad number should fail',
    doc: ['foo', 'sil'],
    patch: [{op: 'add', path: '/1e0', value: 'bar'}],
    error: 'INVALID_INDEX',
  },

  {
    comment: "Missing 'value' parameter to test",
    doc: [null],
    patch: [{op: 'test', path: '/0'} as any],
    error: 'OP_VALUE_MISSING',
  },

  {
    comment: 'Missing value parameter to test - where undef is falsy',
    doc: [false],
    patch: [{op: 'test', path: '/0'} as any],
    error: 'OP_VALUE_MISSING',
  },

  {
    comment: 'Missing from parameter to copy',
    doc: [1],
    patch: [{op: 'copy', path: '/-'} as any],
    error: 'OP_FROM_INVALID',
  },

  {
    comment: 'Unrecognized op should fail',
    doc: {foo: 1},
    patch: [{op: 'spam', path: '/foo', value: 1} as any],
    error: 'OP_UNKNOWN',
  },
];

export default testCases;
