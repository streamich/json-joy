import type {Expr, JsonExpressionCodegenContext, JsonExpressionExecutionContext, Literal, OperatorMap} from './types';
import * as util from './util';

export const createEvaluate = ({operators, createPattern}: {operators: OperatorMap} & JsonExpressionCodegenContext) => {
  const evaluate = (
    expr: Expr | Literal<unknown>,
    ctx: JsonExpressionExecutionContext & JsonExpressionCodegenContext,
  ): unknown => {
    if (!(expr instanceof Array)) return expr;
    if (expr.length === 1) return expr[0];

    const fn = expr[0];
    const def = operators.get(fn);

    try {
      if (def) {
        const [name, , arity, fn] = def;
        util.assertArity(name, arity, expr);
        return fn(expr, {createPattern, ...ctx, eval: evaluate});
      }
      throw new Error('Unknown expression:' + JSON.stringify(expr));
    } catch (err) {
      if (err instanceof Error) throw err;
      const error = new Error('Expression evaluation error.');
      (<any>error).value = err;
      throw error;
    }
  };

  return evaluate;
};
