import {deepEqual} from '../json-equal/deepEqual';
import {get, toPath, validateJsonPointer} from '../json-pointer';
import {Expr, JsonExpressionCodegenContext, JsonExpressionExecutionContext} from './types';
import * as util from './util';

const toNumber = util.num;

export const evaluate = (
  expr: Expr | unknown,
  ctx: JsonExpressionExecutionContext & JsonExpressionCodegenContext,
): unknown => {
  if (!(expr instanceof Array)) return expr;
  if (expr.length === 1 && expr[0] instanceof Array) return expr[0];

  const fn = expr[0];

  switch (fn) {
    // Arithmetic operators
    case '+':
    case 'add': {
      util.assertVariadicArity('+', expr);
      return expr.slice(1).reduce((acc, e) => util.num(evaluate(e, ctx)) + acc, 0);
    }
    case '-':
    case 'subtract': {
      util.assertVariadicArity('-', expr);
      return expr.slice(2).reduce((acc, e) => acc - util.num(evaluate(e, ctx)), util.num(evaluate(expr[1], ctx)));
    }
    case '*':
    case 'multiply': {
      util.assertVariadicArity('*', expr);
      return expr.slice(1).reduce((acc, e) => util.num(evaluate(e, ctx)) * acc, 1);
    }
    case '/':
    case 'divide': {
      util.assertVariadicArity('/', expr);
      let result = util.num(evaluate(expr[1], ctx));
      for (let i = 2; i < expr.length; i++)
        result = util.slash(result, util.num(evaluate(expr[i], ctx)));
      return result;
    }
    case '%':
    case 'mod': {
      util.assertVariadicArity('%', expr);
      let result = util.num(evaluate(expr[1], ctx));
      for (let i = 2; i < expr.length; i++)
        result = util.mod(result, util.num(evaluate(expr[i], ctx)));
      return result;
    }
    case 'min': {
      util.assertVariadicArity('min', expr);
      return Math.min(...expr.slice(1).map((e) => util.num(evaluate(e, ctx))));
    }
    case 'max': {
      util.assertVariadicArity('max', expr);
      return Math.max(...expr.slice(1).map((e) => util.num(evaluate(e, ctx))));
    }
    case 'round': {
      util.assertArity('round', 1, expr);
      return Math.round(util.num(evaluate(expr[1], ctx)));
    }
    case 'ceil': {
      util.assertArity('ceil', 1, expr);
      return Math.ceil(util.num(evaluate(expr[1], ctx)));
    }
    case 'floor': {
      util.assertArity('floor', 1, expr);
      return Math.floor(util.num(evaluate(expr[1], ctx)));
    }
    case 'abs': {
      util.assertArity('abs', 1, expr);
      return Math.abs(util.num(evaluate(expr[1], ctx)));
    }
    case 'sqrt': {
      util.assertArity('sqrt', 1, expr);
      return Math.sqrt(util.num(evaluate(expr[1], ctx)));
    }
    case 'exp': {
      util.assertArity('exp', 1, expr);
      return Math.exp(util.num(evaluate(expr[1], ctx)));
    }
    case 'ln': {
      util.assertArity('ln', 1, expr);
      return Math.log(util.num(evaluate(expr[1], ctx)));
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
    case '==':
    case 'eq': {
      const left = evaluate(expr[1], ctx);
      const right = evaluate(expr[2], ctx);
      return deepEqual(left, right);
    }
    case 'in': {
      const v2 = evaluate(expr[2], ctx);
      if (!(v2 instanceof Array) || !v2.length) return false;
      const v1 = evaluate(expr[1], ctx);
      return v2.some((item: unknown) => deepEqual(item, v1));
    }
    case '!=':
    case 'ne': {
      const left = evaluate(expr[1], ctx);
      const right = evaluate(expr[2], ctx);
      return !deepEqual(left, right);
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
      return toNumber(evaluate(expr[1], ctx));
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
      const from = util.num(evaluate(expr[2], ctx));
      const length = expr.length > 3 ? util.num(evaluate(expr[3], ctx)) : undefined;
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
    case '<': {
      const left = util.num(evaluate(expr[1], ctx));
      const right = util.num(evaluate(expr[2], ctx));
      return left < right;
    }
    case '<=': {
      const left = util.num(evaluate(expr[1], ctx));
      const right = util.num(evaluate(expr[2], ctx));
      return left <= right;
    }
    case '>': {
      const left = util.num(evaluate(expr[1], ctx));
      const right = util.num(evaluate(expr[2], ctx));
      return left > right;
    }
    case '>=': {
      const left = util.num(evaluate(expr[1], ctx));
      const right = util.num(evaluate(expr[2], ctx));
      return left >= right;
    }
    case '><': {
      const val = util.num(evaluate(expr[1], ctx));
      const min = util.num(evaluate(expr[2], ctx));
      const max = util.num(evaluate(expr[3], ctx));
      return util.betweenNeNe(val, min, max);
    }
    case '=><': {
      const val = util.num(evaluate(expr[1], ctx));
      const min = util.num(evaluate(expr[2], ctx));
      const max = util.num(evaluate(expr[3], ctx));
      return util.betweenEqNe(val, min, max);
    }
    case '><=': {
      const val = util.num(evaluate(expr[1], ctx));
      const min = util.num(evaluate(expr[2], ctx));
      const max = util.num(evaluate(expr[3], ctx));
      return util.betweenNeEq(val, min, max);
    }
    case '=><=': {
      const val = util.num(evaluate(expr[1], ctx));
      const min = util.num(evaluate(expr[2], ctx));
      const max = util.num(evaluate(expr[3], ctx));
      return util.betweenEqEq(val, min, max);
    }
  }

  throw new Error('Unknown expression.');
};
