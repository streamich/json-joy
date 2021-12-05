export interface JsonSchemaGenericKeywords {
  title?: string;
  description?: string;
  default?: unknown;
  examples?: unknown[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  const?: unknown;

  $id?: string;
  $defs?: {[name: string]: JsonSchemaValueNode};
}

export interface JsonSchemaString extends JsonSchemaGenericKeywords {
  type: 'string';
  const?: string;
}

export interface JsonSchemaNumber extends JsonSchemaGenericKeywords {
  type: 'number' | 'integer';
  const?: number;
}

export interface JsonSchemaObject extends JsonSchemaGenericKeywords {
  type: 'object';
  properties?: {
    [key: string]: JsonSchemaNode;
  },
  required?: string[],
  additionalProperties?: boolean | JsonSchemaNode;
  const?: object;
}

export interface JsonSchemaArray extends JsonSchemaGenericKeywords {
  type: 'array';
  items: JsonSchemaNode | false;
  minItems?: number;
  maxItems?: number;
  const?: unknown[];
}

export interface JsonSchemaBoolean extends JsonSchemaGenericKeywords {
  type: 'boolean';
  const?: boolean;
}

export interface JsonSchemaNull extends JsonSchemaGenericKeywords {
  type: 'null';
}

export interface JsonSchemaAny extends JsonSchemaGenericKeywords {
  type: Array<'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'>;
}

export interface JsonSchemaRef {
  $ref: string;
}

export type JsonSchemaValueNode =
  | JsonSchemaString
  | JsonSchemaNumber
  | JsonSchemaObject
  | JsonSchemaArray
  | JsonSchemaBoolean
  | JsonSchemaNull
  | JsonSchemaAny

export type JsonSchemaNode =
  | JsonSchemaValueNode
  | JsonSchemaRef;
