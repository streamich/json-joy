import {deepEqual} from '../json-equal/deepEqual';
import {toPath, get as get_} from '../json-pointer';
import {Expression, Literal, OperatorDefinition, OperatorMap} from './types';

export const get = (path: string, data: unknown) => get_(data, toPath(path));

export const throwOnUndef = (value: unknown, def?: unknown) => {
  if (value !== undefined) return value;
  if (def === undefined) throw new Error('NOT_FOUND');
  return def;
};

export const type = (value: unknown): string => {
  if (value === null) return 'null';
  if (value instanceof Array) return 'array';
  if (value instanceof Uint8Array) return 'binary';
  return typeof value;
};

export const str = (value: unknown): string => {
  if (typeof value !== 'object') return '' + value;
  return JSON.stringify(value);
};

export const len = (value: unknown): number => {
  switch (typeof value) {
    case 'string':
      return value.length;
    case 'object': {
      if (value instanceof Array) return value.length;
      if (value instanceof Uint8Array) return value.length;
      if (!value) return 0;
      return Object.keys(value).length;
    }
    default:
      return 0;
  }
};

export const asBin = (value: unknown): Uint8Array => {
  if (value instanceof Uint8Array) return value;
  throw new Error('NOT_BINARY');
};

export const u8 = (bin: unknown, pos: unknown) => {
  const buf = asBin(bin);
  const index = int(pos);
  if (index < 0 || index >= buf.length) throw new Error('OUT_OF_BOUNDS');
  return buf[index];
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

export const cmp = (a: any, b: any): 1 | -1 | 0 => (a > b ? 1 : a < b ? -1 : 0);

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
  if (value instanceof Array) return value.length === 1;
  else return true;
};

export const asLiteral = <T>(value: Literal<T>): T => {
  if (value instanceof Array) {
    if (value.length !== 1) throw new Error('Invalid literal.');
    return value[0];
  } else return value;
};

export const literal = <T = unknown>(value: T): T | [T] => (value instanceof Array ? [value] : value);

export const assertFixedArity = (operator: string, arity: number, expr: Expression): void => {
  if (expr.length !== arity + 1) throw new Error(`"${operator}" operator expects ${arity} operands.`);
};

export const assertVariadicArity = (operator: string, expr: Expression): void => {
  if (expr.length < 3) throw new Error(`"${operator}" operator expects at least two operands.`);
};

export const assertArity = (operator: string, arity: number | [min: number, max: number], expr: Expression): void => {
  if (!arity) return;
  if (arity instanceof Array) {
    const [min, max] = arity;
    if (expr.length < min + 1) throw new Error(`"${operator}" operator expects at least ${min} operands.`);
    if (max !== -1 && expr.length > max + 1) throw new Error(`"${operator}" operator expects at most ${max} operands.`);
  } else if (arity !== -1) assertFixedArity(operator, arity, expr);
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

export const parseVar = (name: string): [name: string, pointer: string] => {
  if (name[0] === '/') return ['', name];
  const slashIndex = name.indexOf('/');
  if (slashIndex === -1) return [name, ''];
  return [name.slice(0, slashIndex), name.slice(slashIndex)];
};

const EMAIL_REG =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const HOSTNAME_REG =
  /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
const IP4_REG = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IP6_REG =
  /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i;
const UUID_REG = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const NOT_URI_FRAGMENT_REG = /\/|:/;
const URI_REG =
  /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
const DURATION_REG = /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/;

export const isEmail = (value: unknown): boolean => typeof value === 'string' && EMAIL_REG.test(value);
export const isHostname = (value: unknown): boolean => typeof value === 'string' && HOSTNAME_REG.test(value);
export const isIp4 = (value: unknown): boolean => typeof value === 'string' && IP4_REG.test(value);
export const isIp6 = (value: unknown): boolean => typeof value === 'string' && IP6_REG.test(value);
export const isUuid = (value: unknown): boolean => typeof value === 'string' && UUID_REG.test(value);
export const isUri = (value: unknown): boolean =>
  typeof value === 'string' && NOT_URI_FRAGMENT_REG.test(value) && URI_REG.test(value);
export const isDuration = (value: unknown): boolean => typeof value === 'string' && DURATION_REG.test(value);
