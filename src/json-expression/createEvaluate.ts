import {deepEqual} from '../json-equal/deepEqual';
import {get, toPath, validateJsonPointer} from '../json-pointer';
import {Expr, JsonExpressionCodegenContext, JsonExpressionExecutionContext, Literal, OperatorMap} from './types';
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

      switch (fn) {
        case '=':
        case 'get': {
          const pointer = evaluate(expr[1], ctx);
          if (expr[2] !== undefined && !util.isLiteral(expr[2]))
            throw new Error('"get" operator expects a default value to be a literal.');
          const def = evaluate(expr[2], ctx);
          if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
          validateJsonPointer(pointer);
          return util.throwOnUndef(get(ctx.data, toPath(pointer)), def);
        }
        case 'in': {
          const v2 = evaluate(expr[2], ctx);
          if (!(v2 instanceof Array) || !v2.length) return false;
          const v1 = evaluate(expr[1], ctx);
          return v2.some((item: unknown) => deepEqual(item, v1));
        }
        case 'defined': {
          // TODO: rename to "def" or "exists"?
          const pointer = evaluate(expr[1], ctx);
          if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
          validateJsonPointer(pointer);
          const value = get(ctx.data, toPath(pointer));
          return value !== undefined;
        }
      }

      throw new Error('Unknown expression.');
    } catch (err) {
      if (err instanceof Error) throw err;
      const error = new Error('Expression evaluation error.');
      (<any>error).value = err;
      throw error;
    }
  };

  return evaluate;
};
