export interface JsonSchemaGenericKeywords {
  type?: string | string[];
  title?: string;
  description?: string;
  default?: unknown;
  examples?: unknown[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  $id?: string;
  $ref?: string;
  $defs?: {[name: string]: JsonSchemaValueNode};
}

export interface JsonSchemaString extends JsonSchemaGenericKeywords {
  type: 'string';
  const?: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
}

export interface JsonSchemaNumber extends JsonSchemaGenericKeywords {
  type: 'number' | 'integer';
  const?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
}

export interface JsonSchemaObject extends JsonSchemaGenericKeywords {
  type: 'object';
  properties?: {
    [key: string]: JsonSchemaNode;
  };
  required?: string[];
  additionalProperties?: boolean | JsonSchemaNode;
  patternProperties?: {
    [key: string]: JsonSchemaNode;
  };
  const?: object;
}

export interface JsonSchemaArray extends JsonSchemaGenericKeywords {
  type: 'array';
  items: JsonSchemaNode | false;
  minItems?: number;
  maxItems?: number;
  const?: unknown[];
  prefixItems?: JsonSchemaNode[];
}

export interface JsonSchemaBoolean extends JsonSchemaGenericKeywords {
  type: 'boolean';
  const?: boolean;
}

export interface JsonSchemaNull extends JsonSchemaGenericKeywords {
  type: 'null';
}

export interface JsonSchemaBinary extends JsonSchemaGenericKeywords {
  type: 'binary';
}

export interface JsonSchemaAny extends JsonSchemaGenericKeywords {
  type: Array<'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'>;
}

export interface JsonSchemaRef {
  $ref: string;
}

export interface JsonSchemaOr {
  anyOf: JsonSchemaNode[];
}

export type JsonSchemaValueNode =
  | JsonSchemaAny
  | JsonSchemaNull
  | JsonSchemaBoolean
  | JsonSchemaNumber
  | JsonSchemaString
  | JsonSchemaArray
  | JsonSchemaObject;

export type JsonSchemaNode = JsonSchemaGenericKeywords | JsonSchemaValueNode | JsonSchemaRef | JsonSchemaOr;
