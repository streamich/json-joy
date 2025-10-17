/**
 * Apache Avro schema type definitions based on Avro 1.12.0 specification.
 * Specification: https://avro.apache.org/docs/1.12.0/specification/
 */

// Base schema interface with common properties
export interface AvroBaseSchema {
  /** The schema type */
  type: string;
  /** Optional documentation for the schema */
  doc?: string;
  /** Optional JSON object of string-valued properties */
  [key: string]: any;
}

// Primitive type schemas
export interface AvroNullSchema extends AvroBaseSchema {
  type: 'null';
}

export interface AvroBooleanSchema extends AvroBaseSchema {
  type: 'boolean';
}

export interface AvroIntSchema extends AvroBaseSchema {
  type: 'int';
}

export interface AvroLongSchema extends AvroBaseSchema {
  type: 'long';
}

export interface AvroFloatSchema extends AvroBaseSchema {
  type: 'float';
}

export interface AvroDoubleSchema extends AvroBaseSchema {
  type: 'double';
}

export interface AvroBytesSchema extends AvroBaseSchema {
  type: 'bytes';
}

export interface AvroStringSchema extends AvroBaseSchema {
  type: 'string';
}

// Complex type schemas

export interface AvroRecordField {
  /** Name of the field */
  name: string;
  /** Schema of the field */
  type: AvroSchema;
  /** Optional documentation for the field */
  doc?: string;
  /** Optional default value for the field */
  default?: any;
  /** Optional ordering for the field */
  order?: 'ascending' | 'descending' | 'ignore';
  /** Optional aliases for the field */
  aliases?: string[];
}

export interface AvroRecordSchema extends AvroBaseSchema {
  type: 'record';
  /** Name of the record schema */
  name: string;
  /** Optional namespace for the record */
  namespace?: string;
  /** Array of field definitions */
  fields: AvroRecordField[];
  /** Optional aliases for the record */
  aliases?: string[];
}

export interface AvroEnumSchema extends AvroBaseSchema {
  type: 'enum';
  /** Name of the enum schema */
  name: string;
  /** Optional namespace for the enum */
  namespace?: string;
  /** Array of symbols in the enum */
  symbols: string[];
  /** Optional default symbol */
  default?: string;
  /** Optional aliases for the enum */
  aliases?: string[];
}

export interface AvroArraySchema extends AvroBaseSchema {
  type: 'array';
  /** Schema of the array items */
  items: AvroSchema;
}

export interface AvroMapSchema extends AvroBaseSchema {
  type: 'map';
  /** Schema of the map values */
  values: AvroSchema;
}

export interface AvroUnionSchema extends Array<AvroSchema> {
  /** Union schemas are represented as JSON arrays */
}

export interface AvroFixedSchema extends AvroBaseSchema {
  type: 'fixed';
  /** Name of the fixed schema */
  name: string;
  /** Optional namespace for the fixed */
  namespace?: string;
  /** Size of the fixed-length data in bytes */
  size: number;
  /** Optional aliases for the fixed */
  aliases?: string[];
}

// Union of all primitive schemas
export type AvroPrimitiveSchema =
  | AvroNullSchema
  | AvroBooleanSchema
  | AvroIntSchema
  | AvroLongSchema
  | AvroFloatSchema
  | AvroDoubleSchema
  | AvroBytesSchema
  | AvroStringSchema;

// Union of all complex schemas
export type AvroComplexSchema =
  | AvroRecordSchema
  | AvroEnumSchema
  | AvroArraySchema
  | AvroMapSchema
  | AvroUnionSchema
  | AvroFixedSchema;

// Union of all schema types
export type AvroSchema = AvroPrimitiveSchema | AvroComplexSchema | string;

// Named schemas (record, enum, fixed)
export type AvroNamedSchema = AvroRecordSchema | AvroEnumSchema | AvroFixedSchema;

// Logical types - extensions to primitive types
export interface AvroLogicalTypeSchema extends AvroBaseSchema {
  /** The logical type name */
  logicalType: string;
}

export interface AvroDecimalLogicalType extends AvroLogicalTypeSchema {
  logicalType: 'decimal';
  /** The maximum number of digits in the decimal */
  precision: number;
  /** The number of digits to the right of the decimal point */
  scale?: number;
}

export interface AvroUuidLogicalType extends AvroStringSchema {
  logicalType: 'uuid';
}

export interface AvroDateLogicalType extends AvroIntSchema {
  logicalType: 'date';
}

export interface AvroTimeMillisLogicalType extends AvroIntSchema {
  logicalType: 'time-millis';
}

export interface AvroTimeMicrosLogicalType extends AvroLongSchema {
  logicalType: 'time-micros';
}

export interface AvroTimestampMillisLogicalType extends AvroLongSchema {
  logicalType: 'timestamp-millis';
}

export interface AvroTimestampMicrosLogicalType extends AvroLongSchema {
  logicalType: 'timestamp-micros';
}

export interface AvroLocalTimestampMillisLogicalType extends AvroLongSchema {
  logicalType: 'local-timestamp-millis';
}

export interface AvroLocalTimestampMicrosLogicalType extends AvroLongSchema {
  logicalType: 'local-timestamp-micros';
}

export interface AvroDurationLogicalType extends AvroFixedSchema {
  logicalType: 'duration';
  size: 12;
}
