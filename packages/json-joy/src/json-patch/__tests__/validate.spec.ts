import {validateOperations, validateOperation} from '../validate';

describe('operations', () => {
  test('throws on not an array', () => {
    expect(() => validateOperations(123 as any)).toThrowErrorMatchingInlineSnapshot(`"Not a array."`);
  });

  test('throws on empty array', () => {
    expect(() => validateOperations([])).toThrowErrorMatchingInlineSnapshot(`"Empty operation patch."`);
  });

  test('throws on invalid operation type', () => {
    expect(() => validateOperations([123 as any])).toThrowErrorMatchingInlineSnapshot(
      `"Error in operation [index = 0] (OP_INVALID)."`,
    );
  });

  test('throws on no operation path', () => {
    expect(() => validateOperations([{} as any])).toThrowErrorMatchingInlineSnapshot(
      `"Error in operation [index = 0] (OP_PATH_INVALID)."`,
    );
  });

  test('throws on no operation code', () => {
    expect(() => validateOperations([{path: ''} as any])).toThrowErrorMatchingInlineSnapshot(
      `"Error in operation [index = 0] (OP_UNKNOWN)."`,
    );
  });

  test('throws on invalid operation code', () => {
    expect(() => validateOperations([{path: '', op: '123'} as any])).toThrowErrorMatchingInlineSnapshot(
      `"Error in operation [index = 0] (OP_UNKNOWN)."`,
    );
  });

  test('succeeds on valid operation', () => {
    validateOperations([{op: 'add', path: '/adsf', value: 123}]);
  });

  test('throws on second invalid operation', () => {
    expect(() =>
      validateOperations([{op: 'add', path: '/adsf', value: 123}, {op: 'test', path: '/adsf'} as any]),
    ).toThrowErrorMatchingInlineSnapshot(`"Error in operation [index = 1] (OP_VALUE_MISSING)."`);
  });

  test('throws if JSON pointer does not start with forward slash', () => {
    expect(() =>
      validateOperations([
        {op: 'add', path: '/adsf', value: 123},
        {op: 'test', path: 'adsf', value: 1},
      ]),
    ).toThrowErrorMatchingInlineSnapshot(`"Error in operation [index = 1] (POINTER_INVALID)."`);
  });
});

describe('add', () => {
  test('throws with no path', () => {
    expect(() => validateOperation({op: 'add'} as any, false)).toThrowErrorMatchingInlineSnapshot(`"OP_PATH_INVALID"`);
  });

  test('throws with invalid path', () => {
    expect(() => validateOperation({op: 'add', path: 123} as any, false)).toThrowErrorMatchingInlineSnapshot(
      `"OP_PATH_INVALID"`,
    );
  });

  test('throws with invalid value', () => {
    expect(() =>
      validateOperation({op: 'add', path: '', value: undefined} as any, false),
    ).toThrowErrorMatchingInlineSnapshot(`"OP_VALUE_MISSING"`);
  });

  test('succeeds on valid operation', () => {
    validateOperation({op: 'add', path: '', value: 123}, false);
  });
});

describe('remove', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'remove', path: ''}, false);
  });

  test('throws on invalid path', () => {
    expect(() => validateOperation({op: 'remove', path: 'asdf'}, false)).toThrowErrorMatchingInlineSnapshot(
      `"POINTER_INVALID"`,
    );
  });

  test('throws on invalid path - 2', () => {
    expect(() => validateOperation({op: 'remove', path: 123} as any, false)).toThrowErrorMatchingInlineSnapshot(
      `"OP_PATH_INVALID"`,
    );
  });
});

describe('replace', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'replace', path: '', value: 'adsf', oldValue: 'adsf'}, false);
  });
});

describe('copy', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'copy', from: '', path: ''}, false);
  });
});

describe('move', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'move', from: '/', path: '/foo/bar'}, false);
    validateOperation({op: 'move', from: '/foo/bar', path: '/foo'}, false);
  });

  test('cannot move into its own children', () => {
    expect(() =>
      validateOperation({op: 'move', from: '/foo', path: '/foo/bar'}, false),
    ).toThrowErrorMatchingInlineSnapshot(`"Cannot move into own children."`);
  });
});

describe('test', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'test', path: '/foo/bar', value: null}, false);
  });
});

describe('test_exists', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'defined', path: ''}, false);
    validateOperation({op: 'defined', path: '/'}, false);
    validateOperation({op: 'defined', path: '/foo/bar'}, false);
  });
});

describe('test_type', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'test_type', path: '/foo', type: ['number']}, false);
    validateOperation({op: 'test_type', path: '/foo', type: ['number', 'array']}, false);
    validateOperation({op: 'test_type', path: '/foo', type: ['number', 'string']}, false);
    validateOperation({op: 'test_type', path: '/foo', type: ['number', 'boolean']}, false);
    validateOperation({op: 'test_type', path: '/foo', type: ['number', 'integer']}, false);
    validateOperation({op: 'test_type', path: '/foo', type: ['number', 'null']}, false);
    validateOperation({op: 'test_type', path: '/foo', type: ['number', 'object']}, false);
    validateOperation({op: 'test_type', path: '/foo', type: ['number', 'string']}, false);
  });

  test('throws on no types provided', () => {
    expect(() =>
      validateOperation({op: 'test_type', path: '/foo', type: []}, false),
    ).toThrowErrorMatchingInlineSnapshot(`"Empty type list."`);
  });

  test('throws on invalid type', () => {
    expect(() =>
      validateOperation({op: 'test_type', path: '/foo', type: ['monkey'] as any}, false),
    ).toThrowErrorMatchingInlineSnapshot(`"Invalid type."`);
    expect(() =>
      validateOperation({op: 'test_type', path: '/foo', type: ['number', 'monkey'] as any}, false),
    ).toThrowErrorMatchingInlineSnapshot(`"Invalid type."`);
  });
});

describe('test_string', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'test_string', path: '/foo', pos: 0, str: 'adsf', not: true}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 0, str: 'adsf', not: false}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 0, str: 'adsf'}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 0, str: '', not: true}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 0, str: '', not: false}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 0, str: ''}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 123, str: 'adsf', not: true}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 123, str: 'adsf', not: false}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 123, str: 'adsf'}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 123, str: '', not: true}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 123, str: '', not: false}, false);
    validateOperation({op: 'test_string', path: '/foo', pos: 123, str: ''}, false);
  });
});

describe('test_string_len', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'test_string_len', path: '/foo', len: 1, not: false}, false);
    validateOperation({op: 'test_string_len', path: '/foo', len: 0, not: false}, false);
    validateOperation({op: 'test_string_len', path: '/foo', len: 1, not: true}, false);
    validateOperation({op: 'test_string_len', path: '/foo', len: 0, not: true}, false);
    validateOperation({op: 'test_string_len', path: '/foo', len: 1}, false);
    validateOperation({op: 'test_string_len', path: '/foo', len: 0}, false);
  });
});

describe('flip', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'flip', path: ''}, false);
    validateOperation({op: 'flip', path: '/'}, false);
    validateOperation({op: 'flip', path: '/foo'}, false);
    validateOperation({op: 'flip', path: '/foo/bar'}, false);
    validateOperation({op: 'flip', path: '/foo/123/bar'}, false);
  });
});

describe('inc', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'inc', path: '/foo/bar', inc: -0}, false);
    validateOperation({op: 'inc', path: '/foo/bar', inc: 0}, false);
    validateOperation({op: 'inc', path: '/foo/bar', inc: 1}, false);
    validateOperation({op: 'inc', path: '/foo/bar', inc: 1.5}, false);
    validateOperation({op: 'inc', path: '/foo/bar', inc: -1}, false);
    validateOperation({op: 'inc', path: '/foo/bar', inc: -1.5}, false);
    validateOperation({op: 'inc', path: '', inc: 0}, false);
    validateOperation({op: 'inc', path: '', inc: 1}, false);
    validateOperation({op: 'inc', path: '', inc: 1.5}, false);
    validateOperation({op: 'inc', path: '', inc: -1}, false);
    validateOperation({op: 'inc', path: '', inc: -1.5}, false);
  });
});

describe('str_ins', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'str_ins', path: '/foo/bar', pos: 0, str: ''}, false);
    validateOperation({op: 'str_ins', path: '/foo/bar', pos: 0, str: 'asdf'}, false);
    validateOperation({op: 'str_ins', path: '/foo/bar', pos: 1, str: ''}, false);
    validateOperation({op: 'str_ins', path: '/foo/bar', pos: 1, str: 'asdf'}, false);
  });
});

describe('str_del', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'str_del', path: '/foo/bar', pos: 0, str: ''}, false);
    validateOperation({op: 'str_del', path: '/foo/bar', pos: 0, str: 'asdf'}, false);
    validateOperation({op: 'str_del', path: '/foo/bar', pos: 0, len: 0}, false);
    validateOperation({op: 'str_del', path: '/foo/bar', pos: 0, len: 4}, false);
  });
});

describe('extend', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'extend', path: '/foo/bar', props: {}, deleteNull: true}, false);
    validateOperation({op: 'extend', path: '/foo/bar', props: {}, deleteNull: false}, false);
    validateOperation({op: 'extend', path: '/foo/bar', props: {}}, false);
    validateOperation({op: 'extend', path: '/foo/bar', props: {foo: 'bar'}, deleteNull: true}, false);
    validateOperation({op: 'extend', path: '/foo/bar', props: {foo: 'bar'}, deleteNull: false}, false);
    validateOperation({op: 'extend', path: '/foo/bar', props: {foo: 'bar'}}, false);
  });
});

describe('merge', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'merge', path: '/foo/bar', pos: 1, props: {}}, false);
    validateOperation({op: 'merge', path: '/foo/bar', pos: 2, props: {}}, false);
    validateOperation({op: 'merge', path: '/foo/bar', pos: 1, props: {foo: 'bar'}}, false);
    validateOperation({op: 'merge', path: '/foo/bar', pos: 2, props: {foo: 'bar'}}, false);
    validateOperation({op: 'merge', path: '/foo/bar', pos: 1, props: {foo: null}}, false);
    validateOperation({op: 'merge', path: '/foo/bar', pos: 2, props: {foo: null}}, false);
    validateOperation({op: 'merge', path: '/foo/bar', pos: 1}, false);
    validateOperation({op: 'merge', path: '/foo/bar', pos: 2}, false);
  });
});

describe('split', () => {
  test('succeeds on valid operation', () => {
    validateOperation({op: 'split', path: '/foo/bar', pos: 0}, false);
    validateOperation({op: 'split', path: '/foo/bar', pos: 2}, false);
    validateOperation({op: 'split', path: '/foo/bar', pos: 0, props: {}}, false);
    validateOperation({op: 'split', path: '/foo/bar', pos: 2, props: {}}, false);
    validateOperation({op: 'split', path: '/foo/bar', pos: 0, props: {foo: 'bar'}}, false);
    validateOperation({op: 'split', path: '/foo/bar', pos: 2, props: {foo: '123'}}, false);
    validateOperation({op: 'split', path: '/foo/bar', pos: 2, props: {foo: null}}, false);
  });
});

describe('contains', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'contains', path: '/foo/bar', value: 'asdf'}]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'contains', path: '/foo/bar', value: 123 as any}])).toThrow();
    expect(() =>
      validateOperations([{op: 'contains', path: '/foo/bar', value: 'adsf', ignore_case: 1 as any}]),
    ).toThrow();
  });
});

describe('ends', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'ends', path: '/foo/bar', value: 'asdf'}]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'ends', path: '/foo/bar', value: 123 as any}])).toThrow();
    expect(() => validateOperations([{op: 'ends', path: '/foo/bar', value: 'adsf', ignore_case: 1 as any}])).toThrow();
  });
});

describe('starts', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'starts', path: '/foo/bar', value: 'asdf'}]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'starts', path: '/foo/bar', value: 123 as any}])).toThrow();
    expect(() =>
      validateOperations([{op: 'starts', path: '/foo/bar', value: 'adsf', ignore_case: 1 as any}]),
    ).toThrow();
  });
});

describe('matches', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'matches', path: '/foo/bar', value: 'asdf'}], true);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'matches', path: '/foo/bar', value: 123 as any}], true)).toThrow();
    expect(() =>
      validateOperations([{op: 'matches', path: '/foo/bar', value: 'adsf', ignore_case: 1 as any}], true),
    ).toThrow();
  });
});

describe('defined', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'defined', path: '/foo/bar'}]);
  });
});

describe('undefined', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'undefined', path: '/foo/bar'}]);
  });
});

describe('in', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'in', path: '/foo/bar', value: ['asdf']}]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'in', path: '/foo/bar', value: 123 as any}], true)).toThrow();
    expect(() => validateOperations([{op: 'in', path: '/foo/bar', value: 'adsf' as any}], true)).toThrow();
  });
});

describe('more', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'more', path: '/foo/bar', value: 5}]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'more', path: '/foo/bar', value: 'adsf' as any}], true)).toThrow();
  });
});

describe('less', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'less', path: '/foo/bar', value: 5}]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'less', path: '/foo/bar', value: 'adsf' as any}], true)).toThrow();
  });
});

describe('type', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'type', path: '/foo/bar', value: 'number'}]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'type', path: '/foo/bar', value: 123 as any}], true)).toThrow();
  });
});

describe('and', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'and', path: '/foo/bar', apply: [{op: 'test', path: '/foo', value: 123}]}]);
    validateOperations([
      {op: 'and', path: '/foo/bar', apply: [{op: 'not', path: '', apply: [{op: 'test', path: '/foo', value: 123}]}]},
    ]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'and', path: '/foo/bar', apply: []}])).toThrow();
    expect(() =>
      validateOperations([{op: 'and', path: '/foo/bar', apply: [{op: 'replace', path: '/foo', value: 123} as any]}]),
    ).toThrow();
  });
});

describe('not', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'not', path: '/foo/bar', apply: [{op: 'test', path: '/foo', value: 123}]}]);
    validateOperations([
      {op: 'not', path: '/foo/bar', apply: [{op: 'not', path: '', apply: [{op: 'test', path: '/foo', value: 123}]}]},
    ]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'not', path: '/foo/bar', apply: []}])).toThrow();
    expect(() =>
      validateOperations([{op: 'not', path: '/foo/bar', apply: [{op: 'replace', path: '/foo', value: 123} as any]}]),
    ).toThrow();
  });
});

describe('or', () => {
  test('succeeds on valid operation', () => {
    validateOperations([{op: 'or', path: '/foo/bar', apply: [{op: 'test', path: '/foo', value: 123}]}]);
    validateOperations([
      {op: 'or', path: '/foo/bar', apply: [{op: 'not', path: '', apply: [{op: 'test', path: '/foo', value: 123}]}]},
    ]);
  });

  test('throws on invalid operation', () => {
    expect(() => validateOperations([{op: 'or', path: '/foo/bar', apply: []}])).toThrow();
    expect(() =>
      validateOperations([{op: 'or', path: '/foo/bar', apply: [{op: 'replace', path: '/foo', value: 123} as any]}]),
    ).toThrow();
  });
});
