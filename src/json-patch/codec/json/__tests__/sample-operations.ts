import type {
  OperationAdd,
  OperationAnd,
  OperationContains,
  OperationCopy,
  OperationDefined,
  OperationEnds,
  OperationExtend,
  OperationFlip,
  OperationIn,
  OperationInc,
  OperationLess,
  OperationMatches,
  OperationMerge,
  OperationMore,
  OperationMove,
  OperationNot,
  OperationOr,
  OperationRemove,
  OperationReplace,
  OperationSplit,
  OperationStarts,
  OperationStrDel,
  OperationStrIns,
  OperationTest,
  OperationTestString,
  OperationTestStringLen,
  OperationTestType,
  OperationType,
  OperationUndefined,
} from '../types';

const add1: OperationAdd = {
  op: 'add',
  path: '',
  value: null,
};

const add2: OperationAdd = {
  op: 'add',
  path: '/foo',
  value: 123,
};

const add3: OperationAdd = {
  op: 'add',
  path: '',
  value: false,
};

const add4: OperationAdd = {
  op: 'add',
  path: '/mentions/2',
  value: {
    id: '1234',
    name: 'Joe Jones',
  },
};

const add5: OperationAdd = {
  op: 'add',
  path: '/mentions/2/-',
  value: {
    id: '1234',
    name: 'Joe Jones',
  },
};

const add6: OperationAdd = {
  op: 'add',
  path: '',
  value: {},
};

const add7: OperationAdd = {
  op: 'add',
  path: '/5/a',
  value: [1, null, '3'],
};

const remove1: OperationRemove = {
  op: 'remove',
  path: '',
};

const remove2: OperationRemove = {
  op: 'remove',
  path: '/a/b/c/d/e',
};

const remove3: OperationRemove = {
  op: 'remove',
  path: '/a/b/c/d/e/-',
  oldValue: null,
};

const remove4: OperationRemove = {
  op: 'remove',
  path: '/user/123/name',
  oldValue: {
    firstName: 'John',
    lastName: 'Notjohn',
  },
};

const replace1: OperationReplace = {
  op: 'replace',
  path: '/a',
  value: 'asdf',
};

const replace2: OperationReplace = {
  op: 'replace',
  path: '/a/b/c',
  value: 123,
};

const replace3: OperationReplace = {
  op: 'replace',
  path: '/a/1/-',
  value: {
    foo: 'qux',
  },
  oldValue: {
    foo: 'bar',
  },
};

const copy1: OperationCopy = {
  op: 'copy',
  path: '/foo/bar',
  from: '/foo/quz',
};

const copy2: OperationCopy = {
  op: 'copy',
  path: '',
  from: '',
};

const copy3: OperationCopy = {
  op: 'copy',
  path: '/',
  from: '',
};

const copy4: OperationCopy = {
  op: 'copy',
  path: '/',
  from: '/a/b/1/2/-',
};

const move1: OperationMove = {
  op: 'move',
  path: '',
  from: '',
};

const move2: OperationMove = {
  op: 'move',
  path: '/a/b/',
  from: '/c/d/0',
};

const test1: OperationTest = {
  op: 'test',
  path: '',
  value: null,
};

const test2: OperationTest = {
  op: 'test',
  path: '/ha/hi',
  value: {foo: 'bar'},
};

const test3: OperationTest = {
  op: 'test',
  path: '/ha/1/2',
  value: [1, {a: false}, 'null'],
};

export const jsonPatchOperations = {
  add1,
  add2,
  add3,
  add4,
  add5,
  add6,
  add7,

  remove1,
  remove2,
  remove3,
  remove4,

  replace1,
  replace2,
  replace3,

  copy1,
  copy2,
  copy3,
  copy4,

  move1,
  move2,

  test1,
  test2,
  test3,
};

const defined1: OperationDefined = {
  op: 'defined',
  path: '',
};

const defined2: OperationDefined = {
  op: 'defined',
  path: '/1',
};

const defined3: OperationDefined = {
  op: 'defined',
  path: '/foo',
};

const undefined1: OperationUndefined = {
  op: 'undefined',
  path: '/a/abc',
};

const undefined2: OperationUndefined = {
  op: 'undefined',
  path: '/',
};

const undefined3: OperationUndefined = {
  op: 'undefined',
  path: '/1',
};

const test_type1: OperationTestType = {
  op: 'test_type',
  path: '',
  type: ['array'],
};

const test_type2: OperationTestType = {
  op: 'test_type',
  path: '/a/1',
  type: ['integer', 'boolean'],
};

const test_type3: OperationTestType = {
  op: 'test_type',
  path: '/a/b/c',
  type: ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'],
};

const test_string1: OperationTestString = {
  op: 'test_string',
  path: '/a/b/c',
  pos: 0,
  str: 'asdf',
};

const test_string2: OperationTestString = {
  op: 'test_string',
  path: '/a/1',
  pos: 4,
  str: '',
};

const test_string_len1: OperationTestStringLen = {
  op: 'test_string_len',
  path: '/',
  len: 123,
};

const test_string_len2: OperationTestStringLen = {
  op: 'test_string_len',
  path: '/a/bb/ccc',
  len: 5,
  not: true,
};

const contains1: OperationContains = {
  op: 'contains',
  path: '/a',
  value: '',
};

const contains2: OperationContains = {
  op: 'contains',
  path: '',
  value: 'asdf',
};

const matches1: OperationMatches = {
  op: 'matches',
  path: '/gg',
  value: 'a',
};

const ends1: OperationEnds = {
  op: 'ends',
  path: '/foo',
  value: '',
};

const ends2: OperationEnds = {
  op: 'ends',
  path: '/',
  value: 'asdf',
};

const ends3: OperationEnds = {
  op: 'ends',
  path: '/',
  value: 'asdf',
  ignore_case: true,
};

const starts1: OperationStarts = {
  op: 'starts',
  path: '/foo',
  value: '',
};

const starts2: OperationStarts = {
  op: 'starts',
  path: '/foo',
  value: 'aa',
};

const starts3: OperationStarts = {
  op: 'starts',
  path: '/foo',
  value: 'aa',
  ignore_case: true,
};

const type1: OperationType = {
  op: 'type',
  path: '/1/2/3',
  value: 'array',
};

const type2: OperationType = {
  op: 'type',
  path: '/1/2/3',
  value: 'boolean',
};

const type3: OperationType = {
  op: 'type',
  path: '/1/2/3',
  value: 'integer',
};

const type4: OperationType = {
  op: 'type',
  path: '/1/2/3',
  value: 'null',
};

const type5: OperationType = {
  op: 'type',
  path: '/1/2/3',
  value: 'number',
};

const type6: OperationType = {
  op: 'type',
  path: '/1/2/3',
  value: 'object',
};

const type7: OperationType = {
  op: 'type',
  path: '/1/2/3',
  value: 'string',
};

const in1: OperationIn = {
  op: 'in',
  path: '/',
  value: ['asdf'],
};

const in2: OperationIn = {
  op: 'in',
  path: '/foo/bar',
  value: ['asdf', 132, {a: 'b'}, null],
};

const less1: OperationLess = {
  op: 'less',
  path: '/z',
  value: -0.5,
};

const less2: OperationLess = {
  op: 'less',
  path: '',
  value: 0,
};

const more1: OperationMore = {
  op: 'more',
  path: '',
  value: 1,
};

const more2: OperationMore = {
  op: 'more',
  path: '/a',
  value: -1,
};

const and1: OperationAnd = {
  op: 'and',
  path: '/a',
  apply: [{op: 'test', path: '/b', value: 123}],
};

const and2: OperationAnd = {
  op: 'and',
  path: '/',
  apply: [less2, more1, in1],
};

const and3: OperationAnd = {
  op: 'and',
  path: '/a/1/.',
  apply: [test1, test2, test3],
};

const and4: OperationAnd = {
  op: 'and',
  path: '/a/1/.',
  apply: [
    test1,
    {
      op: 'and',
      path: '/gg/bet',
      apply: [test1, test2],
    },
    test2,
  ],
};

const not1: OperationNot = {
  op: 'not',
  path: '/',
  apply: [less2, more1, in1],
};

const not2: OperationNot = {
  op: 'not',
  path: '/a/1/.',
  apply: [test1, test2, test3],
};

const or1: OperationOr = {
  op: 'or',
  path: '/',
  apply: [less2, more1, in1],
};

const or2: OperationOr = {
  op: 'or',
  path: '/a/1/.',
  apply: [test1, test2, test3],
};

export const jsonPredicateOperations = {
  defined1,
  defined2,
  defined3,

  undefined1,
  undefined2,
  undefined3,

  test_type1,
  test_type2,
  test_type3,

  test_string1,
  test_string2,

  test_string_len1,
  test_string_len2,

  contains1,
  contains2,

  matches1,

  ends1,
  ends2,
  ends3,

  starts1,
  starts2,
  starts3,

  type1,
  type2,
  type3,
  type4,
  type5,
  type6,
  type7,

  in1,
  in2,

  less1,
  less2,

  more1,
  more2,

  and1,
  and2,
  and3,
  and4,

  not1,
  not2,

  or1,
  or2,
};

const str_ins1: OperationStrIns = {
  op: 'str_ins',
  path: '/ads',
  pos: 0,
  str: '',
};

const str_ins2: OperationStrIns = {
  op: 'str_ins',
  path: '/a/b/lkasjdfoiasjdfoiasjdflaksjdflkasjfljasdflkjasdlfjkasdf',
  pos: 823848493,
  str: 'Component model',
};

const str_del1: OperationStrDel = {
  op: 'str_del',
  path: '',
  pos: 0,
  len: 0,
};

const str_del2: OperationStrDel = {
  op: 'str_del',
  path: '/asdfasdfasdfasdfasdfasdfasdfpalsdf902039joij2130j9e2093k2309k203f0sjdf0s9djf0skdfs0dfk092j0239j0mospdkf',
  pos: 92303948,
  len: 84487,
};

const str_del3: OperationStrDel = {
  op: 'str_del',
  path: '/asdf/reg/asdf/asdf/wer/sdaf234/asf/23/asdf2/asdf2',
  pos: 92303948,
  str: 'asdfasdfasdfasdflkasdjflakjsdf',
};

const flip1: OperationFlip = {
  op: 'flip',
  path: '',
};

const flip2: OperationFlip = {
  op: 'flip',
  path: '/asdf/df/dfa/dfasfd/',
};

const inc1: OperationInc = {
  op: 'inc',
  path: '/',
  inc: 1,
};

const inc2: OperationInc = {
  op: 'inc',
  path: '/asdf/sd/d/f',
  inc: -123,
};

const split1: OperationSplit = {
  op: 'split',
  path: '/i',
  pos: 0,
};

const split2: OperationSplit = {
  op: 'split',
  path: '/i/asdf/sdf/d',
  pos: 123,
};

const split3: OperationSplit = {
  op: 'split',
  path: '/i/asdf/sdf/d',
  pos: 123,
  props: {
    foo: 'bar',
    a: 123,
  },
};

const merge1: OperationMerge = {
  op: 'merge',
  path: '',
  pos: 0,
};

const merge2: OperationMerge = {
  op: 'merge',
  path: '/a/b/c',
  pos: 123412341234,
  props: {
    foo: null,
    bar: 23,
    baz: 'asdf',
    quz: true,
    qux: [1, '2', 3, true, false, null],
  },
};

const extend1: OperationExtend = {
  op: 'extend',
  path: '/',
  props: {},
};

const extend2: OperationExtend = {
  op: 'extend',
  path: '/asdf/asdf/asdf',
  props: {
    foo: 'bar',
  },
};

const extend3: OperationExtend = {
  op: 'extend',
  path: '/asdf/asdf/asdf',
  props: {
    foo: 'bar',
    a: null,
    b: true,
  },
  deleteNull: true,
};

export const jsonPatchExtendedOperations = {
  str_ins1,
  str_ins2,

  str_del1,
  str_del2,
  str_del3,

  flip1,
  flip2,

  inc1,
  inc2,

  split1,
  split2,
  split3,

  merge1,
  merge2,

  extend1,
  extend2,
  extend3,
};

export const operations = {
  ...jsonPatchOperations,
  ...jsonPredicateOperations,
  ...jsonPatchExtendedOperations,
};
