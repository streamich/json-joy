import type {Display} from "./common";

export interface TType extends Display {
  /**
   * "t" is short for "type". Double underscore "__" is borrowed from GraphQL,
   * where they use "__typeName". Values are short strings, such as "str", "num",
   * and "bin", borrowed from MessagePack
   */
  __t: string;
}

/**
 * Represents a JSON object type.
 */
export interface TObject extends TType {
  __t: 'obj';

  /**
   * Sorted list of fields this object contains. Although object fields in JSON
   * are not guaranteed to be in any particular order, this list is sorted so
   * that the order of fields is consistent when generating documentation or code.
   */
  fields: TObjectField[];
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
export interface TArray extends TType {
  __t: 'arr';
  /** One or more "one-of" types that array contains. */
  type: TType | TType[];
}

/**
 * Represents a JSON number.
 */
export interface TNumber extends TType {
  __t: 'num';
  const?: number;
  isInteger?: boolean;
}

/**
 * Represents a JSON string.
 */
export interface TString extends TType {
  __t: 'str';
  const?: string;
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
  __t: 'null';
}

// export interface JsonResource {
//   type: 'resource';
//   resource: DocResource;
// }

/**
 * Any valid JSON type.
 */
export type TJson = TObject | TArray | TNumber | TString | TBoolean | TNull;

export type NoT<T extends TType> = Omit<T, '__t'>;
