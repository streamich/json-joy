import type * as schema from '../schema';
import type * as classes from './classes';
import type {AliasType} from './classes/AliasType';

export type * from './classes';

export interface BaseType<S extends schema.SchemaBase> {
  getSchema(): S;
}

export type Type =
  | classes.AbsType<any>
  | classes.AnyType
  | classes.ConType<any>
  | classes.BoolType
  | classes.NumType
  | classes.StrType
  | classes.BinType<any>
  | classes.ArrType<any, any, any>
  | classes.ObjType<any>
  | classes.MapType<any>
  | classes.RefType<any>
  | classes.OrType<any>
  | classes.FnType<any, any, any>
  | classes.FnRxType<any, any, any>;

export type SchemaOf<T extends Type | Type[]> = T extends BaseType<infer U> ? U : never;
export type SchemaOfMap<M extends Record<string, Type>> = {
  [K in keyof M]: SchemaOf<M[K]>;
};

export type SchemaOfObjectFieldType<F> = F extends classes.KeyOptType<infer K, infer V>
  ? schema.OptKeySchema<K, SchemaOf<V>>
  : F extends classes.KeyType<infer K, infer V>
    ? schema.KeySchema<K, SchemaOf<V>>
    : never;

export type SchemaOfObjectFields<F> = {
  [K in keyof F]: SchemaOfObjectFieldType<F[K]>;
};

export type FilterFunctions<T> = {
  [K in keyof T as T[K] extends classes.FnType<any, any, any>
    ? K
    : T[K] extends classes.FnRxType<any, any, any>
      ? K
      : never]: T[K] extends classes.FnType<any, any, any>
    ? T[K]
    : T[K] extends classes.FnRxType<any, any, any>
      ? T[K]
      : never;
};

export type TypeOfAlias<T> = T extends AliasType<any, infer T> ? T : T extends Type ? T : never;

export type ResolveType<T> = T extends AliasType<any, infer T>
  ? schema.TypeOf<SchemaOf<T>>
  : T extends Type
    ? schema.TypeOf<SchemaOf<T>>
    : T extends schema.Schema
      ? schema.TypeOf<T>
      : never;

export type infer<T> = ResolveType<T>;
