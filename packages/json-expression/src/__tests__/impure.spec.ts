import {Vars} from '../Vars';
import {JsonExpressionCodegen} from '../codegen';
import {operatorsMap} from '../operators';
import type {Expr, JsonExpressionCodegenContext} from '../types';

const compile = (expression: Expr, options: JsonExpressionCodegenContext = {}) => {
  const codegen = new JsonExpressionCodegen({
    ...options,
    expression,
    operators: operatorsMap,
  });
  const fn = codegen.run().compile();
  return (data: unknown) => fn(new Vars(data));
};

test('can execute expression twice with different inputs', () => {
  const fn = compile(['+', 1, ['$', '']]);
  expect(fn(2)).toBe(3);
  expect(fn(3)).toBe(4);
});

test('constant expression is collapsed', () => {
  const fn = compile(['+', 1, 2]);
  expect(fn(2)).toBe(3);
  expect(fn(3)).toBe(3);
});

test('linked in dependencies are linked only once', () => {
  const fn = compile(['/', ['/', ['$', ''], 2], 3]);
  expect(fn(24)).toBe(4);
  // Check that "slash" function is linked only once.
});
