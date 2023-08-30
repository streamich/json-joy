import {Vars} from '../Vars';
import {JsonExpressionCodegen} from '../codegen';
import {operatorsMap} from '../operators';
import {Expr, JsonExpressionCodegenContext} from '../types';

const compile = (
  expression: Expr,
  options: JsonExpressionCodegenContext = {},
) => {
  const codegen = new JsonExpressionCodegen({
    ...options,
    expression,
    operators: operatorsMap,
  });
  const fn = codegen.run().compile();
  return (data: unknown) => fn({vars: new Vars(data)});
};

test('can execute expression twice with different inputs', () => {
  const fn = compile(['+', 1, ['$', '']]);
  expect(fn(2)).toBe(3);
  expect(fn(3)).toBe(4);
});
