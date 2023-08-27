import {deepEqual} from '../json-equal/deepEqual';
import {toPath, get as get_} from '../json-pointer';
import {Expression, OperatorDefinition, OperatorMap} from './types';

export const get = (path: string, data: unknown) => get_(data, toPath(path));

export const throwOnUndef = (value: unknown, def?: unknown) => {
  if (value !== undefined) return value;
  if (def === undefined) throw new Error('NOT_FOUND');
  return def;
};

export const type = (value: unknown): string => {
  // TODO: Shall "null" be of type "const"?
  if (value === null) return 'null';
  if (value instanceof Array) return 'array';
  if (value instanceof Uint8Array) return 'binary';
  return typeof value;
};

export const str = (value: unknown): string => {
  if (typeof value !== 'object') return '' + value;
  return JSON.stringify(value);
};

export const starts = (outer: unknown, inner: unknown): boolean => {
  return str(outer).startsWith(str(inner));
};

export const contains = (outer: unknown, inner: unknown): boolean => {
  return str(outer).indexOf(str(inner)) > -1;
};

export const ends = (outer: unknown, inner: unknown): boolean => {
  return str(outer).endsWith(str(inner));
};

export const isInContainer = (what: unknown, container: unknown[]): boolean => {
  const length = container.length;
  for (let i = 0; i < length; i++) if (deepEqual(container[i], what)) return true;
  return false;
};

export const num = (value: unknown): number => +(value as number) || 0;
export const int = (value: unknown): number => ~~(value as number);

export const cmp = (a: any, b: any): 1 | -1 | 0 => a > b ? 1 : a < b ? -1 : 0;

export const betweenNeNe = (val: any, min: any, max: any): boolean => val > min && val < max;
export const betweenNeEq = (val: any, min: any, max: any): boolean => val > min && val <= max;
export const betweenEqNe = (val: any, min: any, max: any): boolean => val >= min && val < max;
export const betweenEqEq = (val: any, min: any, max: any): boolean => val >= min && val <= max;

export const slash = (a: unknown, b: unknown) => {
  const divisor = num(b);
  if (divisor === 0) throw new Error('DIVISION_BY_ZERO');
  const res = num(a) / divisor;
  return Number.isFinite(res) ? res : 0;
};

export const mod = (a: unknown, b: unknown) => {
  const divisor = num(b);
  if (divisor === 0) throw new Error('DIVISION_BY_ZERO');
  const res = num(a) % divisor;
  return Number.isFinite(res) ? res : 0;
};

export const substr = (probablyString: string | unknown, from: number | unknown, to: number | unknown) =>
  str(probablyString).slice(int(from), int(to));

export const isLiteral = (value: unknown): boolean => {
  if (value instanceof Array) return value.length === 1 && value[0] instanceof Array;
  else return true;
};

export const literal = <T = unknown>(value: T): T | [T] => (value instanceof Array ? [value] : value);

export const assertFixedArity = (operator: string, arity: number, expr: Expression): void => {
  if (expr.length !== arity + 1) throw new Error(`"${operator}" operator expects ${arity} operands.`);
};

export const assertVariadicArity = (operator: string, expr: Expression): void => {
  if (expr.length < 3) throw new Error(`"${operator}" operator expects at least two operands.`);
};

export const assertArity = (operator: string, arity: number, expr: Expression): void => {
  if (arity !== -1) assertFixedArity(operator, arity, expr);
  else assertVariadicArity(operator, expr);
};

export const operatorsToMap = (operators: OperatorDefinition<Expression>[]): OperatorMap => {
  const map: OperatorMap = new Map();
  for (const operator of operators) {
    const [name, aliases] = operator;
    map.set(name, operator);
    for (const alias of aliases) map.set(alias, operator);
  }
  return map;
};
