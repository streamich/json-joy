import {deepEqual} from '../json-equal/deepEqual';
import {get, toPath, validateJsonPointer} from '../json-pointer';
import {Expr, JsonExpressionCodegenContext, JsonExpressionExecutionContext, Literal, OperatorMap} from './types';
import * as util from './util';

const toNum = util.num;

export const createEvaluate = ({operators}: {operators: OperatorMap}) => {
  const evaluate = (
    expr: Expr | Literal<unknown>,
    ctx: JsonExpressionExecutionContext & JsonExpressionCodegenContext,
  ): unknown => {
    if (!(expr instanceof Array)) return expr;
    if (expr.length === 1) return expr[0];

    const fn = expr[0];

    const def = operators.get(fn);
    if (def) {
      const [name, , arity, fn] = def;
      util.assertArity(name, arity, expr);
      return fn(expr, {...ctx, eval: evaluate});
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
      case '?':
      case 'if': {
        return evaluate(expr[1], ctx) ? evaluate(expr[2], ctx) : evaluate(expr[3], ctx);
      }
      case 'defined': {
        // TODO: rename to "def" or "exists"?
        const pointer = evaluate(expr[1], ctx);
        if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
        validateJsonPointer(pointer);
        const value = get(ctx.data, toPath(pointer));
        return value !== undefined;
      }
      case 'int':
        return ~~(evaluate(expr[1], ctx) as any);
      case 'substr': {
        const str2 = util.str(evaluate(expr[1], ctx));
        const from = toNum(evaluate(expr[2], ctx));
        const length = expr.length > 3 ? toNum(evaluate(expr[3], ctx)) : undefined;
        return str2.substr(from, length);
      }
      case 'matches': {
        const [, a, pattern] = expr;
        if (typeof pattern !== 'string')
          throw new Error('"matches" second argument should be a regular expression string.');
        if (!ctx.createPattern)
          throw new Error('"matches" operator requires ".createPattern()" option to be implemented.');
        const subject = evaluate(a, ctx);
        const fn = ctx.createPattern(pattern);
        return fn(util.str(subject));
      }
    }

    throw new Error('Unknown expression.');
  };

  return evaluate;
};
