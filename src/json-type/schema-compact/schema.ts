import type {Expr} from '../../json-expression';
import type * as verbose from '../schema/schema';

export type AnyCompactSchema = [kind: 'any', options?: Omit<verbose.AnySchema, 'kind'>];

export type BooleanCompactSchema = [kind: 'bool', options?: Omit<verbose.BooleanSchema, 'kind'>];

export type NumberCompactSchema = [kind: 'num', options?: Omit<verbose.NumberSchema, 'kind'>];

export type StringCompactSchema = [kind: 'str', options?: Omit<verbose.StringSchema, 'kind'>];

export type BinaryCompactSchema<T extends TCompactType> = [
  kind: 'bin',
  type: T,
  options?: Omit<verbose.BinarySchema, 'kind' | 'type'>,
];

export type ArrayCompactSchema<T extends TCompactType> = [
  kind: 'arr',
  type: T,
  options?: Omit<verbose.ArraySchema, 'kind' | 'types'>,
];

export type ConstCompactSchema<V = any> = [
  kind: 'con',
  value: V,
  options?: Omit<verbose.ConstSchema, 'kind' | 'value'>,
];

export type TupleCompactSchema<T extends TCompactType[]> = [
  kind: 'tup',
  types: T,
  options?: Omit<verbose.TupleSchema, 'kind' | 'types'>,
];

export type ObjectCompactSchema<Fields extends ObjectFieldCompactSchema<string, any>[]> = [
  kind: 'obj',
  fields: Fields,
  options?: Omit<verbose.ObjectSchema, 'kind' | 'fields'>,
];

export type ObjectFieldCompactSchema<
  K extends string = string,
  V extends TCompactType = TCompactType,
  Opts extends Omit<verbose.ObjectFieldSchema, 'kind' | 'key' | 'type'> = Omit<verbose.ObjectFieldSchema, 'kind' | 'key' | 'type'>
> = [
  kind: 'field',
  key: K,
  type: V,
  options?: Opts,
];

export type ObjectOptionalFieldCompactSchema<K extends string = string, V extends TCompactType = TCompactType> =
  ObjectFieldCompactSchema<K, V, Omit<verbose.ObjectFieldSchema, 'kind' | 'key' | 'type' | 'optional'> & {optional: true}>;
// export type ObjectOptionalFieldCompactSchema<K extends string = string, V extends TCompactType = TCompactType> = [
//   kind: 'field',
//   key: K,
//   type: V,
//   options?: Omit<verbose.ObjectFieldSchema, 'kind' | 'key' | 'type' | 'optional'> & {optional: true},
// ];

export type MapCompactSchema<T extends TCompactType> = [
  kind: 'map',
  type: T,
  options?: Omit<verbose.MapSchema, 'kind' | 'type'>,
];

export type RefCompactSchema<T extends TCompactType> = [
  kind: 'ref',
  ref: T,
  options?: Omit<verbose.RefSchema, 'kind' | 'ref'>,
];

export type OrCompactSchema<T extends TCompactType[]> = [
  kind: 'or',
  types: T,
  discriminator: Expr,
  options?: Omit<verbose.OrSchema, 'kind' | 'types' | 'discriminator'>,
];

export type FunctionCompactSchema<Req extends TCompactType, Res extends TCompactType> = [
  kind: 'fn',
  req: Req,
  res: Res,
  options?: Omit<verbose.FunctionSchema, 'kind' | 'req' | 'res'>,
];

export type FunctionStreamingCompactSchema<Req extends TCompactType, Res extends TCompactType> = [
  kind: 'fn$',
  req: Req,
  res: Res,
  options?: Omit<verbose.FunctionStreamingSchema, 'kind' | 'req' | 'res'>,
];

export type TCompactType =
  | AnyCompactSchema
  | BooleanCompactSchema
  | NumberCompactSchema
  | StringCompactSchema
  | BinaryCompactSchema<any>
  | ArrayCompactSchema<any>
  | ConstCompactSchema
  | TupleCompactSchema<any>
  | ObjectCompactSchema<any>
  | ObjectFieldCompactSchema<string, any>
  | ObjectOptionalFieldCompactSchema<string, any>
  | MapCompactSchema<any>
  | RefCompactSchema<any>
  | OrCompactSchema<any>
  | FunctionCompactSchema<any, any>
  | FunctionStreamingCompactSchema<any, any>
  ;
