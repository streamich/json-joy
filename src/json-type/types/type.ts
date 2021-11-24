import type {Display, Identifiable} from "./common";

export interface TType extends Display, Partial<Identifiable> {
  /**
   * "t" is short for "type". Double underscore "__" is borrowed from GraphQL,
   * where they use "__typeName". Values are short strings, such as "str", "num",
   * and "bin", borrowed from MessagePack
   */
  __t: string;

  /**
   * List of example usages of this type.
   */
  examples?: TExample[];
}

/**
 * An example of how a value of a given type could look like.
 */
 export interface TExample extends Display {
  value: unknown;
}

/**
 * A type for which an explicit validation function can be applied.
 */
export interface Validatable {
  /** Name of the validation to apply. */
  validator?: string | string[];
}

/**
 * Represents a JSON object type, the "object" type excluding "null" in JavaScript,
 * the "object" type in JSON Schema, and the "obj" type in MessagePack.
 */
export interface TObject extends TType, Validatable {
  __t: 'obj';

  /**
   * Sorted list of fields this object contains. Although object fields in JSON
   * are not guaranteed to be in any particular order, this list is sorted so
   * that the order of fields is consistent when generating documentation or code.
   */
  fields: TObjectField[];

  /**
   * Whether the object may have fields that are not explicitly defined in the
   * "fields" list. This setting is similar to "additionalProperties" in JSON Schema.
   * Defaults to false.
   *
   * To define an object with of unknown shape use the following annotation:
   *
   * ```json
   * {
   *   "__t": "obj",
   *   "fields": [],
   *   "unknownFields": true
   * }
   * ```
   */
  unknownFields?: boolean;
}

/**
 * Represents a single field of an object.
 */
export interface TObjectField {
  /** Key name of the field. */
  key: string;
  /** One or more "one-of" types of the field. */
  type: TType;
  isOptional?: boolean;
}

/**
 * Represents a JSON array.
 */
export interface TArray extends TType, Validatable {
  __t: 'arr';
  /** One or more "one-of" types that array contains. */
  type: TType;
  const?: unknown[];
}

/**
 * Represents a JSON number.
 */
export interface TNumber extends TType, Validatable {
  __t: 'num';

  /**
   * Exact constant value of the number.
   */
  const?: number;

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
  format?: 'i'  | 'u' | 'f' | 'i8' | 'i16' | 'i32' | 'i64' | 'u8' | 'u16' | 'u32' | 'u64' | 'f32' | 'f64';
}

/**
 * Represents a JSON string.
 */
export interface TString extends TType, Validatable {
  __t: 'str';

  /**
   * Exact constant value of the string.
   */
  const?: string;

  /**
   * When set to "ascii" a faster compiled serialization function can be
   * generated for MessagePack serialization.
   */
  format?: 'ascii';

  /**
   * When set to `true`, a faster JSON serialization function can be
   * generated, which does not escape special JSON string characters.
   * See: https://www.json.org/json-en.html
   */
  noJsonEscape?: boolean;
}

/**
 * Represents a JSON boolean.
 */
export interface TBoolean extends TType {
  __t: 'bool';
  const?: boolean;
}

/**
 * Represents a JSON "null" value.
 */
export interface TNull extends TType {
  __t: 'nil';
}

/**
 * Represents a MessagePack binary type.
 */
export interface TBinary extends TType, Validatable {
  __t: 'bin';
}

/**
 * Represents something of which type is not known.
 */
export interface TAny extends TType, Validatable {
  __t: 'any';
}

/**
 * Reference to another type.
 */
export interface TRef extends TType {
  __t: 'ref';

  /** ID of the type it references. */
  ref: string;
}

/**
 * Represents a type that is one of a set of types.
 */
export interface TOr extends TType {
  __t: 'or';

  /** One or more "one-of" types. */
  types: TType[];
}

/**
 * Represents an enum type.
 */
export interface TEnum extends TType {
  __t: 'enum';

  /** List of possible values. */
  values: unknown[];
}

/**
 * Any valid JSON type.
 */
export type TJson = TObject | TArray | TNumber | TString | TBoolean | TNull;
export type TMessagePack = TJson | TBinary;

export type NoT<T extends TType> = Omit<T, '__t'>;
