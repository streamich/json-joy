import { findByPointer } from "../json-pointer";
import {Expr} from "./types";

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

export const evaluate = (expr: Expr | unknown, data: unknown): any => {
  if (!(expr instanceof Array)) return expr;
  if (expr.length === 1 && expr[0] instanceof Array) return expr[0];

  const fn = expr[0];

  switch (fn) {
    case '=':
    case 'get':
      return findByPointer(String(expr[1]), data).val;
    case '&&':
    case 'and':
      return expr.slice(1).every(e => evaluate(e, data));
    case '||':
    case 'or':
      return expr.slice(1).some(e => evaluate(e, data));
    case '!':
    case 'not':
      return !evaluate(expr[1], data);
    case 'type': {
      const res = evaluate(expr[1], data);
      if (res === null) return 'null';
      if (res instanceof Array) return 'array';
      return typeof res;
    }
    case 'bool': return !!evaluate(expr[1], data);
    case 'num': return +evaluate(expr[1], data) || 0;
    case 'int': return ~~evaluate(expr[1], data);
    case 'str': return toString(evaluate(expr[1], data));
    case 'starts': {
      const inner = evaluate(expr[1], data);
      const outer = evaluate(expr[2], data);
      return toString(outer).indexOf(toString(inner)) === 0;
    }
    case 'contains': {
      const inner = evaluate(expr[1], data);
      const outer = evaluate(expr[2], data);
      return toString(outer).indexOf(toString(inner)) > -1;
    }
    case 'ends': {
      const inner = toString(evaluate(expr[1], data));
      const outer = toString(evaluate(expr[2], data));
      return outer.indexOf(inner) === (outer.length - inner.length);
    }
  }

  throw new Error('Unknown expression.');
};
