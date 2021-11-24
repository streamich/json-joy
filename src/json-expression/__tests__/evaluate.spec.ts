import {evaluate} from '../evaluate';
import { Expr } from '../types';

const check = (expression: Expr, expected: unknown, data: unknown = null) => {
  const res = evaluate(expression, data);
  expect(res).toStrictEqual(expected);
};

describe('get', () => {
  test('can pick from data', () => {
    const data = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    const expression = ['=', '/a/b/c'];
    const res = evaluate(expression, data);
    expect(res).toBe(1);
  });

  test('can pick from data with "get" expression', () => {
    const data = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    const expression = ['get', '/a/b/c'];
    const res = evaluate(expression, data);
    expect(res).toBe(1);
  });
});

describe('and', () => {
  test('works in base case', () => {
    check(['&&', true, true], true, null);
    check(['&&', true, false], false, null);
    check(['&&', false, true], false, null);
    check(['&&', false, false], false, null);
    check(['and', true, true], true, null);
    check(['and', true, false], false, null);
    check(['and', false, true], false, null);
    check(['and', false, false], false, null);
  });

  test('works with number', () => {
    check(['&&', 1, 1], true, null);
    check(['&&', 1, 0], false, null);
    check(['&&', 0, 1], false, null);
    check(['&&', 0, 0], false, null);
  });

  test('true on multiple truthy values', () => {
    const data = {
      true: true,
      false: false,
      one: 1,
      zero: 0,
    };
    check(['&&', ['=', '/true'], ['=', '/one'], ['=', '/true']], true, data);
    check(['&&', ['=', '/true'], ['=', '/one']], true, data);
  });

  test('false on single falsy value', () => {
    const data = {
      true: true,
      false: false,
      one: 1,
      zero: 0,
    };
    check(['&&', ['=', '/true'], ['=', '/one'], ['=', '/zero']], false, data);
  });
});

describe('or', () => {
  test('works in base case', () => {
    check(['||', true, true], true, null);
    check(['||', true, false], true, null);
    check(['||', false, true], true, null);
    check(['||', false, false], false, null);
    check(['or', true, true], true, null);
    check(['or', true, false], true, null);
    check(['or', false, true], true, null);
    check(['or', false, false], false, null);
  });
});

describe('not', () => {
  test('works in base case', () => {
    check(['!', true], false, null);
    check(['!', false], true, null);
    check(['not', true], false, null);
    check(['not', false], true, null);
  });
});

describe('type', () => {
  test('returns value types', () => {
    check(['type', null], 'null');
    check(['type', 123], 'number');
    check(['type', [[]]], 'array');
    check(['type', {}], 'object');
    check(['type', ''], 'string');
    check(['type', false], 'boolean');
  });
});

describe('defined', () => {
  test('works', () => {
    const data = {foo: 'bar'};
    check(['defined', '/foo'], true, data);
    check(['defined', '/foo2'], false, data);
  });
});

describe('bool', () => {
  test('converts value to boolean', () => {
    check(['bool', null], false);
    check(['bool', 123], true);
  });
});

describe('num', () => {
  test('converts value to number', () => {
    check(['num', '123.4'], 123.4);
    check(['num', {}], 0);
  });
});

describe('int', () => {
  test('converts value to integer', () => {
    check(['int', '123.4'], 123);
  });
});

describe('str', () => {
  test('converts value to string', () => {
    check(['str', 123], '123');
  });
});

describe('starts', () => {
  test('returns true when string starts with another sub-string', () => {
    const data = {a: 'asdf', b: 'as'};
    check(['starts', ['=', '/b'], 'asdf'], true, data);
    check(['starts', ['=', '/b'], ['=', '/a']], true, data);
    check(['starts', ['=', '/b'], ['=', '/b']], true, data);
    check(['starts', ['=', '/b'], 'gg'], false, data);
    check(['starts', ['=', '/a'], ['=', '/b']], false, data);
  });
});

describe('contains', () => {
  test('returns true when string contains another string', () => {
    const data = {a: 'asdf', b: 'as'};
    check(['contains', '456', '123456789'], true, data);
    check(['contains', '1', '123456789'], true, data);
    check(['contains', '9', '123456789'], true, data);
    check(['contains', 'df', '123456789'], false, data);
  });
});

describe('ends', () => {
  test('returns true when string ends with give sub-string', () => {
    const data = {a: 'asdf', b: 'as'};
    check(['ends', '789', '123456789'], true, data);
    check(['ends', '9', '123456789'], true, data);
    check(['ends', '78', '123456789'], false, data);
  });
});

describe('<', () => {
  test('works', () => {
    check(['<', 1, 2], true);
    check(['<', 1, 1.1], true);
    check(['<', 1, 1], false);
  });
});

describe('<=', () => {
  test('works', () => {
    check(['<=', 1, 2], true);
    check(['<=', 1, 1], true);
    check(['<=', 1, 0], false);
  });
});

describe('>', () => {
  test('works', () => {
    check(['>', 2, 1], true);
    check(['>', 1, 1], false);
  });
});

describe('>=', () => {
  test('works', () => {
    check(['>=', 2, 1], true);
    check(['>=', 1, 1], true);
    check(['>=', 0, 1], false);
  });
});

describe('scenarios', () => {
  test('can filter messages', () => {
    const data = {
      chan: 'slides-123',
      data: {
        type: 'cursor-move',
        username: 'uk/hardy',
        pos: [309, 123],
      },
    };

    const expression1: Expr = ['and',
      ['==', ['get', '/chan'], 'slides-123'],
      ['==', ['get', '/data/type'], 'cursor-move'],
      ['>', ['=', '/data/pos/0'], 300],
      ['starts', 'uk/', ['=', '/data/username']],
    ];
    check(expression1, true, data);

    const expression2: Expr = ['and',
      ['==', ['get', '/chan'], 'slides-123'],
      ['==', ['get', '/data/type'], 'cursor-move'],
      ['>', ['=', '/data/pos/1'], 555],
      ['starts', 'uk/', ['=', '/data/username']],
    ];
    check(expression2, false, data);
  });
});
