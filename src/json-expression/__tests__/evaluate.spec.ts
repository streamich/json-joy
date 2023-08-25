import {evaluate} from '../evaluate';
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
  const res = evaluate(expression, {...options, data});
  expect(res).toStrictEqual(expected);
};

jsonExpressionUnitTests(check);
jsonExpressionEvaluateTests(check);
jsonExpressionCodegenTests(check, {skipOperandArityTests: true});
