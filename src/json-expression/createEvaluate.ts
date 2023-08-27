import {deepEqual} from '../json-equal/deepEqual';
import {get, toPath, validateJsonPointer} from '../json-pointer';
import {Expr, JsonExpressionCodegenContext, JsonExpressionExecutionContext, Literal, OperatorMap} from './types';
import * as util from './util';

const toNum = util.num;

export const createEvaluate = ({operators}: {operators: OperatorMap}) => {
  const binaryOperands = (
    operator: string,
    expr: Expr,
    ctx: JsonExpressionExecutionContext & JsonExpressionCodegenContext
  ): [left: unknown, right: unknown] => {
    util.assertFixedArity(operator, 2, expr);
    const left = evaluate(expr[1], ctx);
    const right = evaluate(expr[2], ctx);
    return [left, right];
  };

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
      case '==':
      case 'eq': {
        const [left, right] = binaryOperands('==', expr as Expr, ctx);
        return deepEqual(left, right);
      }
      case '!=':
      case 'ne': {
        const [left, right] = binaryOperands('!=', expr as Expr, ctx);
        return !deepEqual(left, right);
      }
      case '>':
      case 'gt': {
        const [left, right] = binaryOperands('>', expr as Expr, ctx);
        return <any>left > <any>right;
      }
      case '>=':
      case 'ge': {
        const [left, right] = binaryOperands('>=', expr as Expr, ctx);
        return <any>left >= <any>right;
      }
      case '<':
      case 'lt': {
        const [left, right] = binaryOperands('<', expr as Expr, ctx);
        return <any>left < <any>right;
      }
      case '<=':
      case 'le': {
        const [left, right] = binaryOperands('<=', expr as Expr, ctx);
        return <any>left <= <any>right;
      }
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
      case '&&':
      case 'and':
        return expr.slice(1).every((e) => evaluate(e, ctx));
      case '||':
      case 'or':
        return expr.slice(1).some((e) => evaluate(e, ctx));
      case '!':
      case 'not':
        return !evaluate(expr[1], ctx);
      case 'type':
        return util.type(evaluate(expr[1], ctx));
      case 'defined': {
        // TODO: rename to "def" or "exists"?
        const pointer = evaluate(expr[1], ctx);
        if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
        validateJsonPointer(pointer);
        const value = get(ctx.data, toPath(pointer));
        return value !== undefined;
      }
      case 'bool':
        return !!evaluate(expr[1], ctx);
      case 'num':
        return toNum(evaluate(expr[1], ctx));
      case 'int':
        return ~~(evaluate(expr[1], ctx) as any);
      case 'str':
        return util.str(evaluate(expr[1], ctx));
      case 'starts': {
        const subject = evaluate(expr[1], ctx);
        const test = evaluate(expr[2], ctx);
        return util.starts(subject, test);
      }
      case 'contains': {
        const subject = evaluate(expr[1], ctx);
        const test = evaluate(expr[2], ctx);
        return util.contains(subject, test);
      }
      case 'ends': {
        const subject = evaluate(expr[1], ctx);
        const test = evaluate(expr[2], ctx);
        return util.ends(subject, test);
      }
      case 'cat':
      case '.': {
        return expr
          .slice(1)
          .map((e) => evaluate(e, ctx))
          .join('');
      }
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
      case '><': {
        const val = toNum(evaluate(expr[1], ctx));
        const min = toNum(evaluate(expr[2], ctx));
        const max = toNum(evaluate(expr[3], ctx));
        return util.betweenNeNe(val, min, max);
      }
      case '=><': {
        const val = toNum(evaluate(expr[1], ctx));
        const min = toNum(evaluate(expr[2], ctx));
        const max = toNum(evaluate(expr[3], ctx));
        return util.betweenEqNe(val, min, max);
      }
      case '><=': {
        const val = toNum(evaluate(expr[1], ctx));
        const min = toNum(evaluate(expr[2], ctx));
        const max = toNum(evaluate(expr[3], ctx));
        return util.betweenNeEq(val, min, max);
      }
      case '=><=': {
        const val = toNum(evaluate(expr[1], ctx));
        const min = toNum(evaluate(expr[2], ctx));
        const max = toNum(evaluate(expr[3], ctx));
        return util.betweenEqEq(val, min, max);
      }
    }

    throw new Error('Unknown expression.');
  };

  return evaluate;
};
