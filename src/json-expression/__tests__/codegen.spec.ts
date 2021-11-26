import {JsonExpressionCodegen} from '../codegen';
import {Expr} from '../types';

const check = (expression: Expr, expected: unknown, data: unknown = null) => {
  const codegen = new JsonExpressionCodegen({
    expression,
  });
  const fn = codegen.run().compile();
  // console.log(codegen.generate().js);
  // console.log(fn.toString());
  const result = fn({data});
  expect(result).toStrictEqual(expected);
};

describe('get', () => {
  test('can pick from object', () => {
    check(['get', '/foo'], 'bar', {foo: 'bar'});
    check(['=', '/foo'], 'bar', {foo: 'bar'});
    check(['=', '/baz'], undefined, {foo: 'bar'});
  });

  test('can pick using expression', () => {
    check(['get', ['get', '/pointer']], 'bar', {foo: 'bar', pointer: '/foo'});
  });

  test('can pick itself recursively', () => {
    check(['=', ['=', '/pointer']], '/pointer', {foo: 'bar', pointer: '/pointer'});
  });
});

describe('eq', () => {
  test('on two literals', () => {
    check(['==', 1, 2], false);
    check(['==', {foo: 'bar'}, {foo: 'bar'}], true);
    check(['==', {foo: 'bar'}, {foo: 'baz'}], false);
    check(['==', [[]], [[]]], true);
  });

  test('literal and expression', () => {
    check(['eq', 3, ['=', '/foo']], false);
    check(['eq', 'bar', ['eq', 1, 1]], false);
    check(['eq', true, ['eq', 1, 1]], true);
  });

  test('together with get', () => {
    check(['eq', 3, ['=', '/foo']], true, {foo: 3});
  });
});

describe('ne', () => {
  test('on two literals', () => {
    check(['!=', 1, 2], true);
    check(['!=', {foo: 'bar'}, {foo: 'bar'}], false);
    check(['!=', {foo: 'bar'}, {foo: 'baz'}], true);
    check(['!=', [[]], [[]]], false);
  });

  test('literal and expression', () => {
    check(['ne', 3, ['=', '/foo']], true);
    check(['ne', 'bar', ['eq', 1, 1]], true);
    check(['!=', true, ['eq', 1, 1]], false);
  });

  test('together with get', () => {
    check(['ne', 3, ['=', '/foo']], false, {foo: 3});
  });
});

describe('not', () => {
  test('on two literals', () => {
    check(['!', ['==', 1, 2]], true);
    check(['!', ['==', {foo: 'bar'}, {foo: 'bar'}]], false);
    check(['not', ['==', {foo: 'bar'}, {foo: 'baz'}]], true);
    check(['not', ['==', [[]], [[]]]], false);
  });

  test('literal and expression', () => {
    check(['!', ['eq', 3, ['=', '/foo']]], true);
    check(['not', ['eq', 'bar', ['eq', 1, 1]]], true);
    check(['not', ['eq', true, ['eq', 1, 1]]], false);
  });

  test('together with get', () => {
    check(['!', ['eq', 3, ['=', '/foo']]], false, {foo: 3});
  });
});

describe('if', () => {
  test('works as ternary conditional expression', () => {
    check(['if', true, 1, 2], 1);
    check(['if', false, 1, 2], 2);
    check(['?', true, 1, 2], 1);
    check(['?', false, 1, 2], 2);
  });

  test('all operands are expressions', () => {
    const data = {
      foo: 1,
      bar: 2,
      baz: 3,
    };
    check(['if', ['=', '/foo'], ['=', '/bar'], ['=', '/baz']], 2, data);
    check(['if', ['>', ['=', '/foo'], 10], ['=', '/bar'], ['=', '/baz']], 3, data);
  });
});

describe('and', () => {
  test('two operand case', () => {
    check(['and', true, true], true);
    check(['and', true, false], false);
    check(['and', false, false], false);
    check(['and', false, true], false);
    check(['&&', true, true], true);
    check(['&&', true, false], false);
    check(['&&', false, false], false);
    check(['&&', false, true], false);
  });

  test('two operand case', () => {
    check(['and', 1, 1], true);
    check(['and', 1, 0], false);
    check(['and', 0, 1], false);
    check(['and', 0, 0], false);
  });

  test('three operand case', () => {
    check(['and', true, true, true], true);
    check(['and', true, false, true], false);
  });

  test('operands are expressions', () => {
    check(['and', ['get', '/0'], ['get', '/0']], true, [1, 0]);
    check(['and', ['get', '/0'], ['get', '/1']], false, [1, 0]);
    check(['and', ['get', '/0'], 1], true, [1, 0]);
    check(['and', ['get', '/0'], 0], false, [1, 0]);
  });
});

describe('or', () => {
  test('two operand case', () => {
    check(['or', true, true], true);
    check(['or', true, false], true);
    check(['or', false, false], false);
    check(['or', false, true], true);
    check(['||', true, true], true);
    check(['||', true, false], true);
    check(['||', false, false], false);
    check(['||', false, true], true);
  });

  test('two operand case', () => {
    check(['or', 1, 1], true);
    check(['or', 1, 0], true);
    check(['or', 0, 1], true);
    check(['or', 0, 0], false);
  });

  test('three operand case', () => {
    check(['or', true, true, true], true);
    check(['or', true, false, true], true);
    check(['or', false, false, false], false);
  });

  test('operands are expressions', () => {
    check(['or', ['get', '/0'], ['get', '/0']], true, [1, 0]);
    check(['or', ['get', '/0'], ['get', '/1']], true, [1, 0]);
    check(['or', ['get', '/0'], 1], true, [1, 0]);
    check(['or', ['get', '/0'], 0], true, [1, 0]);
    check(['or', ['get', '/1'], 0], false, [1, 0]);
  });
});
