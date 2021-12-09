import {evaluate} from '../evaluate';
import {Expr, JsonExpressionCodegenContext} from '../types';
import {jsonExpressionCodegenTests} from './jsonExpressionCodegenTests';
import {jsonExpressionEvaluateTests} from './jsonExpressionEvaluateTests';

const check = (
  expression: Expr,
  expected: unknown,
  data: unknown = null,
  options: JsonExpressionCodegenContext = {},
) => {
  const res = evaluate(expression, {...options, data});
  expect(res).toStrictEqual(expected);
};

jsonExpressionEvaluateTests(check);
jsonExpressionCodegenTests(check, {skipOperandArityTests: true});
