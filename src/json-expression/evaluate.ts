import {deepEqual} from "../json-equal/deepEqual";
import {get, toPath} from "../json-pointer";
import {validateJsonPointer} from '../json-pointer';
import {Expr, JsonExpressionCodegenContext, JsonExpressionExecutionContext} from "./types";
import {betweenEqEq, betweenEqNe, betweenNeEq, betweenNeNe, contains, ends, isLiteral, num, slash, starts, str, throwOnUndef, type} from "./util";

const toNumber = num;

export const evaluate = (expr: Expr | unknown, ctx: JsonExpressionExecutionContext & JsonExpressionCodegenContext): any => {
  if (!(expr instanceof Array)) return expr;
  if (expr.length === 1 && expr[0] instanceof Array) return expr[0];

  const fn = expr[0];

  switch (fn) {
    case '=':
    case 'get': {
      const pointer = evaluate(expr[1], ctx);
      if (expr[2] !== undefined && !isLiteral(expr[2]))
        throw new Error('"get" operator expects a default value to be a literal.');
      const def = evaluate(expr[2], ctx);
      if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
      validateJsonPointer(pointer);
      return throwOnUndef(get(ctx.data, toPath(pointer)), def);
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
      return expr.slice(1).every(e => evaluate(e, ctx));
    case '||':
    case 'or':
      return expr.slice(1).some(e => evaluate(e, ctx));
    case '!':
    case 'not':
      return !evaluate(expr[1], ctx);
    case 'type': return type(evaluate(expr[1], ctx));
    case 'defined': {
      const pointer = evaluate(expr[1], ctx);
      if (typeof pointer !== 'string') throw new Error('Invalid JSON pointer.');
      validateJsonPointer(pointer);
      const value = get(ctx.data, toPath(pointer));
      return value !== undefined;
    }
    case 'bool': return !!evaluate(expr[1], ctx);
    case 'num': return toNumber(evaluate(expr[1], ctx));
    case 'int': return ~~evaluate(expr[1], ctx);
    case 'str': return str(evaluate(expr[1], ctx));
    case 'starts': {
      const subject = evaluate(expr[1], ctx);
      const test = evaluate(expr[2], ctx);
      return starts(subject, test);
    }
    case 'contains': {
      const subject = evaluate(expr[1], ctx);
      const test = evaluate(expr[2], ctx);
      return contains(subject, test);
    }
    case 'ends': {
      const subject = evaluate(expr[1], ctx);
      const test = evaluate(expr[2], ctx);
      return ends(subject, test);
    }
    case 'cat':
    case '.': {
      return expr.slice(1).map(e => evaluate(e, ctx)).join('');
    }
    case 'substr': {
      const str2 = str(evaluate(expr[1], ctx));
      const from = num(evaluate(expr[2], ctx));
      const length = expr.length > 3 ? num(evaluate(expr[3], ctx)) : undefined;
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
      return fn(str(subject));
    }
    case '<': {
      const left = num(evaluate(expr[1], ctx));
      const right = num(evaluate(expr[2], ctx));
      return left < right;
    }
    case '<=': {
      const left = num(evaluate(expr[1], ctx));
      const right = num(evaluate(expr[2], ctx));
      return left <= right;
    }
    case '>': {
      const left = num(evaluate(expr[1], ctx));
      const right = num(evaluate(expr[2], ctx));
      return left > right;
    }
    case '>=': {
      const left = num(evaluate(expr[1], ctx));
      const right = num(evaluate(expr[2], ctx));
      return left >= right;
    }
    case '><': {
      const val = num(evaluate(expr[1], ctx));
      const min = num(evaluate(expr[2], ctx));
      const max = num(evaluate(expr[3], ctx));
      return betweenNeNe(val, min, max);
    }
    case '=><': {
      const val = num(evaluate(expr[1], ctx));
      const min = num(evaluate(expr[2], ctx));
      const max = num(evaluate(expr[3], ctx));
      return betweenEqNe(val, min, max);
    }
    case '><=': {
      const val = num(evaluate(expr[1], ctx));
      const min = num(evaluate(expr[2], ctx));
      const max = num(evaluate(expr[3], ctx));
      return betweenNeEq(val, min, max);
    }
    case '=><=': {
      const val = num(evaluate(expr[1], ctx));
      const min = num(evaluate(expr[2], ctx));
      const max = num(evaluate(expr[3], ctx));
      return betweenEqEq(val, min, max);
    }
    case 'min': {
      return Math.min(...expr.slice(1).map(e => num(evaluate(e, ctx))));
    }
    case 'max': {
      return Math.max(...expr.slice(1).map(e => num(evaluate(e, ctx))));
    }
    case '+': {
      return expr.slice(1).reduce((acc, e) => num(evaluate(e, ctx)) + acc, 0);
    }
    case '-': {
      return expr.slice(2).reduce((acc, e) => acc - num(evaluate(e, ctx)), num(evaluate(expr[1], ctx)));
    }
    case '*': {
      return expr.slice(1).reduce((acc, e) => num(evaluate(e, ctx)) * acc, 1);
    }
    case '/': {
      return slash(evaluate(expr[1], ctx), evaluate(expr[2], ctx));
    }
    case '%': {
      return num(evaluate(expr[1], ctx) % evaluate(expr[2], ctx));
    }
    case 'round': {
      return Math.round(num(evaluate(expr[1], ctx)));
    }
    case 'ceil': {
      return Math.ceil(num(evaluate(expr[1], ctx)));
    }
    case 'floor': {
      return Math.floor(num(evaluate(expr[1], ctx)));
    }
  }

  throw new Error('Unknown expression.');
};
