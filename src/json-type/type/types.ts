import type * as schema from '../schema';
import type * as classes from './classes';

export type * from './classes';

export interface BaseType<S extends schema.TType> {
  getSchema(): S;
}

export type Type =
  | classes.AnyType
  | classes.ConstType<any>
  | classes.BooleanType
  | classes.NumberType
  | classes.StringType
  | classes.BinaryType<any>
  | classes.ArrayType<any>
  | classes.TupleType<any>
  | classes.ObjectType<any>
  | classes.MapType<any>
  | classes.RefType<any>
  | classes.OrType<any>
  | classes.FunctionType<any, any>
  | classes.FunctionStreamingType<any, any>;

export type SchemaOf<T extends Type | Type[]> = T extends BaseType<infer U> ? U : never;
export type SchemaOfMap<M extends Record<string, Type>> = {[K in keyof M]: SchemaOf<M[K]>};

export type SchemaOfObjectFieldType<F> =
  F extends classes.ObjectOptionalFieldType<infer K, infer V>
    ? schema.ObjectOptionalFieldSchema<K, SchemaOf<V>>
    : F extends classes.ObjectFieldType<infer K, infer V>
      ? schema.ObjectFieldSchema<K, SchemaOf<V>>
      : never;

export type SchemaOfObjectFields<F> = {[K in keyof F]: SchemaOfObjectFieldType<F[K]>};

export type TypeMap = {[name: string]: schema.Schema};

export type FilterFunctions<T> = {
  [K in keyof T as T[K] extends classes.FunctionType<any, any>
    ? K
    : T[K] extends classes.FunctionStreamingType<any, any>
      ? K
      : never]: T[K] extends classes.FunctionType<any, any>
    ? T[K]
    : T[K] extends classes.FunctionStreamingType<any, any>
      ? T[K]
      : never;
};
