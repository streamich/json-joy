import {Vars} from '../Vars';
import {JsonExpressionCodegen} from '../codegen';
import {operatorsMap} from '../operators';
import type {Expr, JsonExpressionCodegenContext} from '../types';
import {jsonExpressionCodegenTests} from './jsonExpressionCodegenTests';
import {jsonExpressionEvaluateTests} from './jsonExpressionEvaluateTests';
import {jsonExpressionUnitTests} from './jsonExpressionUnitTests';

const check = (
  expression: Expr,
  expected: unknown,
  data: unknown = null,
  options: JsonExpressionCodegenContext = {},
) => {
  const codegen = new JsonExpressionCodegen({
    ...options,
    expression,
    operators: operatorsMap,
  });
  const fn = codegen.run().compile();
  const result = fn(new Vars(data));
  expect(result).toStrictEqual(expected);
};

jsonExpressionUnitTests(check);
jsonExpressionCodegenTests(check);
jsonExpressionEvaluateTests(check);
