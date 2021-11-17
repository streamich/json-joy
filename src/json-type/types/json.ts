import type {Display} from "./common";

/**
 * Represents a JSON object type.
 */
export interface TObject extends Display {
  t: 'obj';

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
export interface TObjectField extends Display {
  /** Key name of the field. */
  key: string;
  /** One or more "one-of" types of the field. */
  types: TJson[];
  isOptional?: boolean;
}

/**
 * Represents a JSON array.
 */
export interface TArray {
  t: 'arr';
  /** One or more "one-of" types that array contains. */
  types: TJson[];
}

/**
 * Represents a JSON number.
 */
export interface TNumber {
  t: 'num';
  const?: number;
  isInteger?: boolean;
}

/**
 * Represents a JSON string.
 */
export interface TString {
  t: 'str';
  const?: string;
}

/**
 * Represents a JSON boolean.
 */
export interface TBoolean {
  t: 'bool';
  const?: boolean;
}

/**
 * Represents a JSON "null" value.
 */
export interface TNull {
  t: 'null';
}

// export interface JsonResource {
//   type: 'resource';
//   resource: DocResource;
// }

export type TJson = TObject | TArray | TNumber | TString | TBoolean | TNull;
