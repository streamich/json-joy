import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {AvroDecoder} from './AvroDecoder';
import {AvroSchemaValidator} from './AvroSchemaValidator';
import type {
  AvroSchema,
  AvroRecordSchema,
  AvroEnumSchema,
  AvroArraySchema,
  AvroMapSchema,
  AvroUnionSchema,
  AvroFixedSchema,
  AvroNamedSchema,
} from './types';

/**
 * Apache Avro binary decoder with schema validation and decoding.
 * Decodes values according to provided Avro schemas with proper validation.
 * Based on https://avro.apache.org/docs/1.12.0/specification/
 */
export class AvroSchemaDecoder {
  private decoder: AvroDecoder;
  private validator: AvroSchemaValidator;
  private namedSchemas = new Map<string, AvroNamedSchema>();

  constructor(public readonly reader: Reader = new Reader()) {
    this.decoder = new AvroDecoder();
    this.decoder.reader = reader;
    this.validator = new AvroSchemaValidator();
  }

  /**
   * Decodes a value according to the provided schema.
   */
  public decode(data: Uint8Array, schema: AvroSchema): unknown {
    this.reader.reset(data);
    this.namedSchemas.clear();

    // Validate schema first
    if (!this.validator.validateSchema(schema)) {
      throw new Error('Invalid Avro schema');
    }

    this.collectNamedSchemas(schema);
    return this.readValue(schema);
  }

  /**
   * Reads a value according to its schema.
   */
  private readValue(schema: AvroSchema): unknown {
    const resolvedSchema = this.resolveSchema(schema);

    if (typeof resolvedSchema === 'string') {
      switch (resolvedSchema) {
        case 'null':
          return this.decoder.readNull();
        case 'boolean':
          return this.decoder.readBoolean();
        case 'int':
          return this.decoder.readInt();
        case 'long':
          return this.decoder.readLong();
        case 'float':
          return this.decoder.readFloat();
        case 'double':
          return this.decoder.readDouble();
        case 'bytes':
          return this.decoder.readBytes();
        case 'string':
          return this.decoder.readString();
        default:
          throw new Error(`Unknown primitive type: ${resolvedSchema}`);
      }
    }

    if (Array.isArray(resolvedSchema)) {
      return this.readUnion(resolvedSchema);
    }

    switch (resolvedSchema.type) {
      case 'record':
        return this.readRecord(resolvedSchema);
      case 'enum':
        return this.readEnum(resolvedSchema);
      case 'array':
        return this.readArray(resolvedSchema);
      case 'map':
        return this.readMap(resolvedSchema);
      case 'fixed':
        return this.readFixed(resolvedSchema);
      default:
        throw new Error(`Unknown schema type: ${(resolvedSchema as any).type}`);
    }
  }

  /**
   * Reads a record value according to the record schema.
   */
  private readRecord(schema: AvroRecordSchema): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (let i = 0; i < schema.fields.length; i++) {
      const field = schema.fields[i];
      try {
        result[field.name] = this.readValue(field.type);
      } catch (error) {
        throw new Error(`Error reading field '${field.name}': ${(error as Error).message}`);
      }
    }

    return result;
  }

  /**
   * Reads an enum value according to the enum schema.
   */
  private readEnum(schema: AvroEnumSchema): string {
    const index = this.decoder.readEnum();

    if (index < 0 || index >= schema.symbols.length) {
      throw new Error(`Invalid enum index ${index} for enum with ${schema.symbols.length} symbols`);
    }

    return schema.symbols[index];
  }

  /**
   * Reads an array value according to the array schema.
   */
  private readArray(schema: AvroArraySchema): unknown[] {
    return this.decoder.readArray(() => this.readValue(schema.items));
  }

  /**
   * Reads a map value according to the map schema.
   */
  private readMap(schema: AvroMapSchema): Record<string, unknown> {
    return this.decoder.readMap(() => this.readValue(schema.values));
  }

  /**
   * Reads a union value according to the union schema.
   */
  private readUnion(schema: AvroUnionSchema): unknown {
    const schemaReaders = schema.map((subSchema) => () => this.readValue(subSchema));
    const result = this.decoder.readUnion(schemaReaders);
    return result.value;
  }

  /**
   * Reads a fixed value according to the fixed schema.
   */
  private readFixed(schema: AvroFixedSchema): Uint8Array {
    return this.decoder.readFixed(schema.size);
  }

  /**
   * Reads a null value with schema validation.
   */
  public readNull(schema: AvroSchema): null {
    this.validateSchemaType(schema, 'null');
    return this.decoder.readNull();
  }

  /**
   * Reads a boolean value with schema validation.
   */
  public readBoolean(schema: AvroSchema): boolean {
    this.validateSchemaType(schema, 'boolean');
    return this.decoder.readBoolean();
  }

  /**
   * Reads an int value with schema validation.
   */
  public readInt(schema: AvroSchema): number {
    this.validateSchemaType(schema, 'int');
    const value = this.decoder.readInt();
    if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) {
      throw new Error('Decoded value is not a valid 32-bit integer');
    }
    return value;
  }

  /**
   * Reads a long value with schema validation.
   */
  public readLong(schema: AvroSchema): number | bigint {
    this.validateSchemaType(schema, 'long');
    return this.decoder.readLong();
  }

  /**
   * Reads a float value with schema validation.
   */
  public readFloat(schema: AvroSchema): number {
    this.validateSchemaType(schema, 'float');
    return this.decoder.readFloat();
  }

  /**
   * Reads a double value with schema validation.
   */
  public readDouble(schema: AvroSchema): number {
    this.validateSchemaType(schema, 'double');
    return this.decoder.readDouble();
  }

  /**
   * Reads a bytes value with schema validation.
   */
  public readBytes(schema: AvroSchema): Uint8Array {
    this.validateSchemaType(schema, 'bytes');
    return this.decoder.readBytes();
  }

  /**
   * Reads a string value with schema validation.
   */
  public readString(schema: AvroSchema): string {
    this.validateSchemaType(schema, 'string');
    return this.decoder.readString();
  }

  private validateSchemaType(schema: AvroSchema, expectedType: string): void {
    const resolvedSchema = this.resolveSchema(schema);
    const actualType =
      typeof resolvedSchema === 'string'
        ? resolvedSchema
        : Array.isArray(resolvedSchema)
          ? 'union'
          : resolvedSchema.type;

    if (actualType !== expectedType) {
      throw new Error(`Expected schema type ${expectedType}, got ${actualType}`);
    }
  }

  private resolveSchema(schema: AvroSchema): AvroSchema {
    if (typeof schema === 'string') {
      const namedSchema = this.namedSchemas.get(schema);
      return namedSchema || schema;
    }
    return schema;
  }

  private collectNamedSchemas(schema: AvroSchema): void {
    if (typeof schema === 'string' || Array.isArray(schema)) {
      return;
    }

    if (typeof schema === 'object' && schema !== null) {
      switch (schema.type) {
        case 'record': {
          const recordSchema = schema as AvroRecordSchema;
          const recordFullName = this.getFullName(recordSchema.name, recordSchema.namespace);
          this.namedSchemas.set(recordFullName, recordSchema);
          recordSchema.fields.forEach((field) => this.collectNamedSchemas(field.type));
          break;
        }
        case 'enum': {
          const enumSchema = schema as AvroEnumSchema;
          const enumFullName = this.getFullName(enumSchema.name, enumSchema.namespace);
          this.namedSchemas.set(enumFullName, enumSchema);
          break;
        }
        case 'fixed': {
          const fixedSchema = schema as AvroFixedSchema;
          const fixedFullName = this.getFullName(fixedSchema.name, fixedSchema.namespace);
          this.namedSchemas.set(fixedFullName, fixedSchema);
          break;
        }
        case 'array':
          this.collectNamedSchemas((schema as AvroArraySchema).items);
          break;
        case 'map':
          this.collectNamedSchemas((schema as AvroMapSchema).values);
          break;
      }
    }
  }

  private getFullName(name: string, namespace?: string): string {
    return namespace ? `${namespace}.${name}` : name;
  }
}
