import type {Schema, TypeOf} from '../schema';
import type {SchemaOf, Type} from '../type';
import type {TypeAlias} from './TypeAlias';

/** A custom user provided validator. */
export interface CustomValidator {
  /** Name of the validator. */
  name: string;

  /**
   * Receives the value that needs to be validated, returns a truthy value representing an error
   * or throws an error when validation fails. When validation succeeds, returns a falsy value.
   */
  fn: (value: any) => unknown;
}

export type TypeOfAlias<T> = T extends TypeAlias<any, infer T> ? T : T extends Type ? T : never;

export type ResolveType<T> =
  T extends TypeAlias<any, infer T>
    ? TypeOf<SchemaOf<T>>
    : T extends Type
      ? TypeOf<SchemaOf<T>>
      : T extends Schema
        ? TypeOf<T>
        : never;
