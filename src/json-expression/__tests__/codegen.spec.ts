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
});