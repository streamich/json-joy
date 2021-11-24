import { findByPointer } from "../json-pointer";
import {Expr} from "./types";

export const evaluate = (expr: Expr | unknown, data: unknown): any => {
  if (!(expr instanceof Array)) return expr;
  if (expr.length === 1 && expr[0] instanceof Array) return expr[0];

  const fn = expr[0];

  switch (fn) {
    case '=': return findByPointer(String(expr[1]), data).val;
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
    case 'str': return '' + evaluate(expr[1], data);
  }

  throw new Error('Unknown expression.');
};
