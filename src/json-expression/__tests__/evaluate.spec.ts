import {evaluate} from '../evaluate';
import { Expr } from '../types';

const check = (expression: Expr, data: unknown, expected: unknown) => {
  const res = evaluate(expression, data);
  expect(res).toBe(expected);
};

describe('=', () => {
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
});

describe('&&', () => {
  test('works in base case', () => {
    check(['&&', true, true], null, true);
    check(['&&', true, false], null, false);
    check(['&&', false, true], null, false);
    check(['&&', false, false], null, false);
    check(['and', true, true], null, true);
    check(['and', true, false], null, false);
    check(['and', false, true], null, false);
    check(['and', false, false], null, false);
  });

  test('works with number', () => {
    check(['&&', 1, 1], null, true);
    check(['&&', 1, 0], null, false);
    check(['&&', 0, 1], null, false);
    check(['&&', 0, 0], null, false);
  });

  test('true on multiple truthy values', () => {
    const data = {
      true: true,
      false: false,
      one: 1,
      zero: 0,
    };
    check(['&&', ['=', '/true'], ['=', '/one'], ['=', '/true']], data, true);
    check(['&&', ['=', '/true'], ['=', '/one']], data, true);
  });

  test('false on single falsy value', () => {
    const data = {
      true: true,
      false: false,
      one: 1,
      zero: 0,
    };
    check(['&&', ['=', '/true'], ['=', '/one'], ['=', '/zero']], data, false);
  });
});
