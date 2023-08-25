import {JsonExpressionCodegen} from '../codegen';
import {Expr, JsonExpressionCodegenContext} from '../types';
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
  });
  const fn = codegen.run().compile();
  // console.log(codegen.generate().js);
  // console.log(fn.toString());
  const result = fn({data});
  expect(result).toStrictEqual(expected);
};

jsonExpressionUnitTests(check);
jsonExpressionCodegenTests(check);
jsonExpressionEvaluateTests(check);
