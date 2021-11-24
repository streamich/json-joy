import {deepEqual} from "../json-equal/deepEqual";
import {findByPointer} from "../json-pointer";
import {Expr} from "./types";

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

const toNumber = (value: unknown): number => +(value as number) || 0;

export interface JsonExpressionContext {
  data: unknown;
  createPattern?: (pattern: string) => (value: string) => boolean;
}

export const evaluate = (expr: Expr | unknown, ctx: JsonExpressionContext): any => {
  if (!(expr instanceof Array)) return expr;
  if (expr.length === 1 && expr[0] instanceof Array) return expr[0];

  const fn = expr[0];

  switch (fn) {
    case '=':
    case '<-':
    case 'get': {
      const value = evaluate(expr[1], ctx);
      return findByPointer(String(value), ctx.data).val;
    }
    case '==':
    case 'eq': {
      const left = toNumber(evaluate(expr[1], ctx));
      const right = toNumber(evaluate(expr[2], ctx));
      return deepEqual(left, right);
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
    case 'type': {
      const res = evaluate(expr[1], ctx);
      if (res === null) return 'null';
      if (res instanceof Array) return 'array';
      return typeof res;
    }
    case 'defined': {
      const pointer = evaluate(expr[1], ctx);
      const value = findByPointer(String(pointer), ctx.data).val;
      return value !== undefined;
    }
    case 'bool': return !!evaluate(expr[1], ctx);
    case 'num': return toNumber(evaluate(expr[1], ctx));
    case 'int': return ~~evaluate(expr[1], ctx);
    case 'str': return toString(evaluate(expr[1], ctx));
    case 'starts': {
      const inner = evaluate(expr[1], ctx);
      const outer = evaluate(expr[2], ctx);
      return toString(outer).indexOf(toString(inner)) === 0;
    }
    case 'contains': {
      const inner = evaluate(expr[1], ctx);
      const outer = evaluate(expr[2], ctx);
      return toString(outer).indexOf(toString(inner)) > -1;
    }
    case 'ends': {
      const inner = toString(evaluate(expr[1], ctx));
      const outer = toString(evaluate(expr[2], ctx));
      return outer.indexOf(inner) === (outer.length - inner.length);
    }
    case '<': {
      const left = toNumber(evaluate(expr[1], ctx));
      const right = toNumber(evaluate(expr[2], ctx));
      return left < right;
    }
    case '<=': {
      const left = toNumber(evaluate(expr[1], ctx));
      const right = toNumber(evaluate(expr[2], ctx));
      return left <= right;
    }
    case '>': {
      const left = toNumber(evaluate(expr[1], ctx));
      const right = toNumber(evaluate(expr[2], ctx));
      return left > right;
    }
    case '>=': {
      const left = toNumber(evaluate(expr[1], ctx));
      const right = toNumber(evaluate(expr[2], ctx));
      return left >= right;
    }
  }

  throw new Error('Unknown expression.');
};
