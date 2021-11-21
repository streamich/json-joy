import type {Display, Identifiable} from "./common";

export interface TType extends Display {
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
 * Represents a JSON object type, the "object" type excluding "null" in JavaScript,
 * the "object" type in JSON Schema, and the "obj" type in MessagePack.
 */
export interface TObject extends TType, Partial<Identifiable> {
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
  type: TType | TType[];
  isOptional?: boolean;
}

/**
 * Represents a JSON array.
 */
export interface TArray extends TType, Partial<Identifiable> {
  __t: 'arr';
  /** One or more "one-of" types that array contains. */
  type: TType | TType[];
  const?: unknown[];
}

/**
 * Represents a JSON number.
 */
export interface TNumber extends TType, Partial<Identifiable> {
  __t: 'num';
  const?: number;
  isInteger?: boolean;
}

/**
 * Represents a JSON string.
 */
export interface TString extends TType, Partial<Identifiable> {
  __t: 'str';
  const?: string;
}

/**
 * Represents a JSON boolean.
 */
export interface TBoolean extends TType, Partial<Identifiable> {
  __t: 'bool';
  const?: boolean;
}

/**
 * Represents a JSON "null" value.
 */
export interface TNull extends TType, Partial<Identifiable> {
  __t: 'nil';
}

/**
 * Represents a MessagePack binary type.
 */
export interface TBinary extends TType, Partial<Identifiable> {
  __t: 'bin';
}

/**
 * Represents something of which type is not known.
 */
export interface TAny extends TType, Partial<Identifiable> {
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
 * Any valid JSON type.
 */
export type TJson = TObject | TArray | TNumber | TString | TBoolean | TNull;
export type TMessagePack = TJson | TBinary;

export type NoT<T extends TType> = Omit<T, '__t'>;
