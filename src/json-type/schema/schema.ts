import type {Observable} from 'rxjs';
import type {Mutable} from '@jsonjoy.com/util/lib/types';
import type {Display, Identifiable} from './common';
import type {Expr} from '@jsonjoy.com/json-expression';

export interface TType<Value = unknown> extends Display, Partial<Identifiable> {
  /**
   * The type of the JSON Type node.
   */
  kind: string;

  /**
   * Custom metadata that can be attached to the type. This is useful for
   * documentation generation, and for custom code generators. The `meta` field
   * is not used by the JSON Type system itself.
   */
  meta?: Record<string, unknown>;

  /**
   * List of example usages of this type.
   */
  examples?: TExample<Value>[];

  /**
   * A flag that indicates that this type is deprecated. When a type is
   * deprecated, it should not be used in new code, and existing code should be
   * updated to use a non-deprecated type.
   */
  deprecated?: {
    /**
     * A message that explains why the type is deprecated, and what to use
     * instead.
     */
    description?: string;
  };
}

/**
 * An example of how a value of a given type could look like.
 */
export interface TExample<Value = unknown> extends Display {
  value: Value;
}

/**
 * A type for which an explicit validation function can be applied.
 */
export interface WithValidator {
  /** Name of the validation to apply. */
  validator?: string | string[];
}

/**
 * Represents something of which type is not known.
 */
export interface AnySchema extends TType<unknown>, WithValidator {
  kind: 'any';

  /**
   * Custom metadata that can be attached to the type. This is useful for
   * documentation generation, and for custom code generators.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Represents a JSON boolean.
 */
export interface BooleanSchema extends TType<boolean>, WithValidator {
  kind: 'bool';
}

/**
 * Represents a JSON number.
 */
export interface NumberSchema extends TType<number>, WithValidator {
  kind: 'num';

  /**
   * A more specific format of the number. When this is set, faster compiled
   * serialization functions can generate. "i" stands for signed integer, "u"
   * for unsigned integer, and "f" for float.
   *
   * - "i" is signed integer.
   * - "i8" is 8-bit signed integer.
   * - "i16" is 16-bit signed integer.
   * - "i32" is 32-bit signed integer.
   * - "i64" is 64-bit signed integer.
   * - "u" is unsigned integer.
   * - "u8" is 8-bit unsigned integer.
   * - "u16" is 16-bit unsigned integer.
   * - "u32" is 32-bit unsigned integer.
   * - "u64" is 64-bit unsigned integer.
   * - "f" is float.
   * - "f32" is 32-bit float.
   * - "f64" is 64-bit float.
   */
  format?: 'i' | 'u' | 'f' | 'i8' | 'i16' | 'i32' | 'i64' | 'u8' | 'u16' | 'u32' | 'u64' | 'f32' | 'f64';

  /** Minimum value. */
  gt?: number;

  /** Minimum value, inclusive. */
  gte?: number;

  /** Maximum value. */
  lt?: number;

  /** Maximum value, inclusive. */
  lte?: number;
}

/**
 * Represents a JSON string.
 */
export interface StringSchema extends TType<string>, WithValidator {
  kind: 'str';

  /**
   * When set to true, means that the string can contain only ASCII characters.
   * This enables a range of optimizations, such as using a faster JSON
   * serialization, faster binary serialization.
   */
  ascii?: boolean;

  /**
   * When set to `true`, a faster JSON serialization function can be
   * generated, which does not escape special JSON string characters.
   * See: https://www.json.org/json-en.html
   */
  noJsonEscape?: boolean;

  /** Minimum number of characters. */
  min?: number;

  /** Maximum number of characters. */
  max?: number;
}

/**
 * Represents a binary type.
 */
export interface BinarySchema<T extends TType = any> extends TType, WithValidator {
  kind: 'bin';
  /** Type of value encoded in the binary data. */
  type: T;
  /** Codec used for encoding the binary data. */
  format?: 'json' | 'cbor' | 'msgpack' | 'resp3' | 'ion' | 'bson' | 'ubjson' | 'bencode';
}

/**
 * Represents a JSON array.
 */
export interface ArraySchema<T extends TType = any> extends TType<Array<unknown>>, WithValidator {
  kind: 'arr';
  /** One or more "one-of" types that array contains. */
  type: T;
  /** Minimum number of elements. */
  min?: number;
  /** Maximum number of elements. */
  max?: number;
}

/**
 * Represents a constant value.
 */
export interface ConstSchema<V = any> extends TType, WithValidator {
  /** @todo Rename to "con". */
  kind: 'const';
  /** The value. */
  value: V;
}

/**
 * Represents a JSON array.
 */
export interface TupleSchema<T extends TType[] = any> extends TType, WithValidator {
  kind: 'tup';
  // types: any[] extends T ? never : T;
  types: T;
}

/**
 * Represents a JSON object type, the "object" type excluding "null" in JavaScript,
 * the "object" type in JSON Schema, and the "obj" type in MessagePack.
 */
export interface ObjectSchema<
  Fields extends ObjectFieldSchema<string, TType>[] | readonly ObjectFieldSchema<string, TType>[] = any,
> extends TType<object>,
    WithValidator {
  kind: 'obj';

  /**
   * Sorted list of fields this object contains. Although object fields in JSON
   * are not guaranteed to be in any particular order, this list is sorted so
   * that the order of fields is consistent when generating documentation or code.
   */
  fields: Fields;

  /**
   * Whether the object may have fields that are not explicitly defined in the
   * "fields" list. This setting is similar to "additionalProperties" in JSON
   * Schema. Defaults to false.
   *
   * To define an object with of unknown shape use the following annotation:
   *
   * ```json
   * {
   *   "kind": "obj",
   *   "fields": [],
   *   "unknownFields": true
   * }
   * ```
   *
   * @deprecated
   * @todo Rename ot `decodeUnknownFields`.
   */
  unknownFields?: boolean;

  encodeUnknownFields?: boolean;
}

/**
 * Represents a single field of an object.
 */
export interface ObjectFieldSchema<K extends string = string, V extends TType = TType> extends TType<[K, V]>, Display {
  kind: 'field';
  /** Key name of the field. */
  key: K;
  /** One or more "one-of" types of the field. */
  type: V;
  optional?: boolean;
}

export interface ObjectOptionalFieldSchema<K extends string = string, V extends TType = TType>
  extends ObjectFieldSchema<K, V> {
  optional: true;
}

/**
 * Represents an object, which is treated as a map. All keys are strings and all
 * values are of the same type.
 */
export interface MapSchema<T extends TType = any> extends TType<Record<string, unknown>>, WithValidator {
  kind: 'map';
  /** Type of all values in the map. */
  type: T;
}

/**
 * Reference to another type.
 */
export interface RefSchema<T extends TType = TType> extends TType {
  kind: 'ref';

  /** ID of the type it references. */
  ref: string & T;
}

/**
 * Represents a type that is one of a set of types.
 */
export interface OrSchema<T extends TType[] = TType[]> extends TType {
  kind: 'or';

  /** One or more "one-of" types. */
  types: T;

  discriminator: Expr;
}

export type FunctionValue<Req, Res, Ctx = unknown> = (req: Req, ctx?: Ctx) => Res | Promise<Res>;

export interface FunctionSchema<Req extends TType = TType, Res extends TType = TType> extends TType {
  kind: 'fn';
  req: Req;
  res: Res;
}

export type FunctionStreamingValue<Req, Res, Ctx = unknown> = (req: Observable<Req>, ctx?: Ctx) => Observable<Res>;

export interface FunctionStreamingSchema<Req extends TType = TType, Res extends TType = TType> extends TType {
  kind: 'fn$';
  req: Req;
  res: Res;
}

export interface TypeSystemSchema {
  types: {
    // [alias: string]:
  };
}

/**
 * Any valid JSON type.
 */
export type JsonSchema =
  | BooleanSchema
  | NumberSchema
  | StringSchema
  | BinarySchema
  | ArraySchema
  | ConstSchema
  | TupleSchema
  | ObjectSchema
  | ObjectFieldSchema
  | ObjectOptionalFieldSchema
  | MapSchema;

export type Schema = JsonSchema | RefSchema | OrSchema | AnySchema | FunctionSchema | FunctionStreamingSchema;

export type NoT<T extends TType> = Omit<T, 'kind'>;

export type TypeOf<T> =
  T extends OrSchema<any>
    ? TypeOfValue<T['types'][number]>
    : T extends RefSchema<infer U>
      ? TypeOf<U>
      : T extends AnySchema
        ? unknown
        : TypeOfValue<T>;

export type TypeOfValue<T> = T extends BooleanSchema
  ? boolean
  : T extends NumberSchema
    ? number
    : T extends StringSchema
      ? string
      : T extends ArraySchema<infer U>
        ? TypeOf<U>[]
        : T extends ConstSchema<infer U>
          ? U
          : T extends TupleSchema<infer U>
            ? {[K in keyof U]: TypeOf<U[K]>}
            : T extends ObjectSchema<infer F>
              ? NoEmptyInterface<TypeFields<Mutable<F>>>
              : T extends MapSchema<infer U>
                ? Record<string, TypeOf<U>>
                : T extends BinarySchema
                  ? Uint8Array
                  : T extends FunctionSchema<infer Req, infer Res>
                    ? (req: TypeOf<Req>, ctx?: unknown) => Promise<TypeOf<Res>>
                    : T extends FunctionStreamingSchema<infer Req, infer Res>
                      ? (req$: Observable<TypeOf<Req>>, ctx?: unknown) => Observable<TypeOf<Res>>
                      : never;

export type TypeOfMap<M extends Record<string, Schema>> = {[K in keyof M]: TypeOf<M[K]>};

type TypeFields<F> = TypeOfFieldMap<FieldsAdjustedForOptional<ToObject<{[K in keyof F]: ObjectFieldToTuple<F[K]>}>>>;

type ToObject<T> = T extends [string, unknown][] ? {[K in T[number] as K[0]]: K[1]} : never;

type ObjectFieldToTuple<F> = F extends ObjectFieldSchema<infer K, infer V> ? [K, F] : never;

type NoEmptyInterface<I> = keyof I extends never ? Record<string, never> : I;

type OptionalFields<T> = {[K in keyof T]-?: T[K] extends ObjectOptionalFieldSchema ? K : never}[keyof T];

type RequiredFields<T> = Exclude<keyof T, OptionalFields<T>>;

type FieldsAdjustedForOptional<T> = Pick<T, RequiredFields<T>> & Partial<Pick<T, OptionalFields<T>>>;

type TypeOfFieldMap<T> = {[K in keyof T]: TypeOf<FieldValue<T[K]>>};

type FieldValue<F> = F extends ObjectFieldSchema<any, infer V> ? V : never;

export type OptionalProps<T extends object> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
  }[keyof T],
  undefined
>;

export type Optional<T extends object> = Pick<T, OptionalProps<T>>;
export type Required<T extends object> = Omit<T, OptionalProps<T>>;
