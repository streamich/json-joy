import type {Display} from "./common";

/**
 * Represents a JSON object type.
 */
export interface TObject extends Display {
  type: 'object';

  /**
   * Sorted list of fields this object contains. Although object fields in JSON
   * are not guaranteed to be in any particular order, this list is sorted so
   * that the order of fields is consistent when generating documentation or code.
   */
  fields: TObjectField[];
}

/**
 * Represents a single field
 */
export interface TObjectField {
  field: string;
  types: Json[];
  isOptional?: boolean;
}

export interface JsonArray {
  type: 'array';
  types: Json[];
}

export interface JsonNumber {
  type: 'number';
  const?: number;
  isInteger?: boolean;
}

export interface JsonString {
  type: 'string';
  const?: string;
}

export interface JsonBoolean {
  type: 'boolean';
  const?: boolean;
}

export interface JsonNull {
  type: 'null';
}

export interface JsonJson {
  type: 'json';
}

// export interface JsonResource {
//   type: 'resource';
//   resource: DocResource;
// }

export type Json = TObject | JsonArray | JsonNumber | JsonString | JsonBoolean | JsonNull | JsonJson;
