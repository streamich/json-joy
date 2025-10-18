import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import {AvroEncoder} from './AvroEncoder';
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
  AvroNullSchema,
} from './types';

/**
 * Apache Avro binary encoder with schema validation and encoding.
 * Encodes values according to provided Avro schemas with proper validation.
 * Based on https://avro.apache.org/docs/1.12.0/specification/
 */
export class AvroSchemaEncoder {
  private encoder: AvroEncoder;
  private validator: AvroSchemaValidator;
  private namedSchemas = new Map<string, AvroNamedSchema>();

  constructor(public readonly writer: IWriter & IWriterGrowable) {
    this.encoder = new AvroEncoder(writer);
    this.validator = new AvroSchemaValidator();
  }

  /**
   * Encodes a value according to the provided schema.
   */
  public encode(value: unknown, schema: AvroSchema, selectedIndex?: number): Uint8Array {
    this.writer.reset();
    this.namedSchemas.clear();

    // Validate schema first
    if (!this.validator.validateSchema(schema)) {
      throw new Error('Invalid Avro schema');
    }

    // Validate value against schema
    if (!this.validator.validateValue(value, schema)) {
      throw new Error('Value does not conform to schema');
    }

    this.collectNamedSchemas(schema);

    if (Array.isArray(schema) && selectedIndex !== undefined) {
      this.writeUnion(value, schema, selectedIndex);
    } else {
      this.writeValue(value, schema);
    }

    return this.writer.flush();
  }

  /**
   * Writes a null value with schema validation.
   */
  public writeNull(schema: AvroNullSchema | AvroSchema): void {
    this.validateSchemaType(schema, 'null');
    this.encoder.writeNull();
  }

  /**
   * Writes a boolean value with schema validation.
   */
  public writeBoolean(value: boolean, schema: AvroSchema): void {
    this.validateSchemaType(schema, 'boolean');
    this.encoder.writeBoolean(value);
  }

  /**
   * Writes an int value with schema validation.
   */
  public writeInt(value: number, schema: AvroSchema): void {
    this.validateSchemaType(schema, 'int');
    if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) {
      throw new Error('Value is not a valid 32-bit integer');
    }
    this.encoder.writeInt(value);
  }

  /**
   * Writes a long value with schema validation.
   */
  public writeLong(value: number | bigint, schema: AvroSchema): void {
    this.validateSchemaType(schema, 'long');
    this.encoder.writeLong(value);
  }

  /**
   * Writes a float value with schema validation.
   */
  public writeFloat(value: number, schema: AvroSchema): void {
    this.validateSchemaType(schema, 'float');
    this.encoder.writeFloat(value);
  }

  /**
   * Writes a double value with schema validation.
   */
  public writeDouble(value: number, schema: AvroSchema): void {
    this.validateSchemaType(schema, 'double');
    this.encoder.writeDouble(value);
  }

  /**
   * Writes a bytes value with schema validation.
   */
  public writeBytes(value: Uint8Array, schema: AvroSchema): void {
    this.validateSchemaType(schema, 'bytes');
    this.encoder.writeBin(value);
  }

  /**
   * Writes a string value with schema validation.
   */
  public writeString(value: string, schema: AvroSchema): void {
    this.validateSchemaType(schema, 'string');
    this.encoder.writeStr(value);
  }

  /**
   * Writes a record value with schema validation.
   */
  public writeRecord(value: Record<string, unknown>, schema: AvroRecordSchema): void {
    if (typeof schema === 'object' && schema.type !== 'record') {
      throw new Error('Schema is not a record schema');
    }

    const recordSchema = this.resolveSchema(schema) as AvroRecordSchema;
    if (recordSchema.type !== 'record') {
      throw new Error('Schema is not a record schema');
    }

    for (let i = 0; i < recordSchema.fields.length; i++) {
      const field = recordSchema.fields[i];
      const fieldValue = value[field.name];
      if (fieldValue !== undefined) {
        this.writeValue(fieldValue, field.type);
      } else if (field.default !== undefined) {
        this.writeValue(field.default, field.type);
      } else {
        throw new Error(`Missing required field: ${field.name}`);
      }
    }
  }

  /**
   * Writes an enum value with schema validation.
   */
  public writeEnum(value: string, schema: AvroEnumSchema): void {
    if (typeof schema === 'object' && schema.type !== 'enum') {
      throw new Error('Schema is not an enum schema');
    }

    const enumSchema = this.resolveSchema(schema) as AvroEnumSchema;
    if (enumSchema.type !== 'enum') {
      throw new Error('Schema is not an enum schema');
    }

    const index = enumSchema.symbols.indexOf(value);
    if (index === -1) {
      throw new Error(`Invalid enum value: ${value}`);
    }

    this.writeVarIntSigned(this.encodeZigZag32(index));
  }

  /**
   * Writes an array value with schema validation.
   */
  public writeArray(value: unknown[], schema: AvroArraySchema): void {
    if (typeof schema === 'object' && schema.type !== 'array') {
      throw new Error('Schema is not an array schema');
    }

    const arraySchema = this.resolveSchema(schema) as AvroArraySchema;
    if (arraySchema.type !== 'array') {
      throw new Error('Schema is not an array schema');
    }

    // Write array length
    this.writeVarIntUnsigned(value.length);

    // Write array items
    const length = value.length;
    for (let i = 0; i < length; i++) {
      this.writeValue(value[i], arraySchema.items);
    }

    // Write end-of-array marker
    this.writeVarIntUnsigned(0);
  }

  /**
   * Writes a map value with schema validation.
   */
  public writeMap(value: Record<string, unknown>, schema: AvroMapSchema): void {
    if (typeof schema === 'object' && schema.type !== 'map') {
      throw new Error('Schema is not a map schema');
    }

    const mapSchema = this.resolveSchema(schema) as AvroMapSchema;
    if (mapSchema.type !== 'map') {
      throw new Error('Schema is not a map schema');
    }

    const entries = Object.entries(value);

    // Write map length
    this.writeVarIntUnsigned(entries.length);

    // Write map entries
    const length = entries.length;
    for (let i = 0; i < length; i++) {
      const entry = entries[i];
      this.encoder.writeStr(entry[0]);
      this.writeValue(entry[1], mapSchema.values);
    }

    // Write end-of-map marker
    this.writeVarIntUnsigned(0);
  }

  /**
   * Writes a union value with schema validation.
   */
  public writeUnion(value: unknown, schema: AvroUnionSchema, selectedIndex?: number): void {
    if (!Array.isArray(schema)) {
      throw new Error('Schema is not a union schema');
    }

    let index = selectedIndex;
    if (index === undefined) {
      // Find the first matching schema in the union
      index = schema.findIndex((subSchema) => this.validator.validateValue(value, subSchema));
      if (index === -1) {
        throw new Error('Value does not match any schema in the union');
      }
    }

    if (index < 0 || index >= schema.length) {
      throw new Error('Invalid union index');
    }

    // Write union index
    this.writeVarIntSigned(this.encodeZigZag32(index));

    // Write the value according to the selected schema
    this.writeValue(value, schema[index]);
  }

  /**
   * Writes a fixed value with schema validation.
   */
  public writeFixed(value: Uint8Array, schema: AvroFixedSchema): void {
    if (typeof schema === 'object' && schema.type !== 'fixed') {
      throw new Error('Schema is not a fixed schema');
    }

    const fixedSchema = this.resolveSchema(schema) as AvroFixedSchema;
    if (fixedSchema.type !== 'fixed') {
      throw new Error('Schema is not a fixed schema');
    }

    if (value.length !== fixedSchema.size) {
      throw new Error(`Fixed value length ${value.length} does not match schema size ${fixedSchema.size}`);
    }

    this.writer.buf(value, value.length);
  }

  /**
   * Generic number writing with schema validation.
   */
  public writeNumber(value: number, schema: AvroSchema): void {
    const resolvedSchema = this.resolveSchema(schema);
    const schemaType =
      typeof resolvedSchema === 'string'
        ? resolvedSchema
        : Array.isArray(resolvedSchema)
          ? 'union'
          : resolvedSchema.type;

    switch (schemaType) {
      case 'int':
        this.writeInt(value, schema);
        break;
      case 'long':
        this.writeLong(value, schema);
        break;
      case 'float':
        this.writeFloat(value, schema);
        break;
      case 'double':
        this.writeDouble(value, schema);
        break;
      default:
        throw new Error(`Schema type ${schemaType} is not a numeric type`);
    }
  }

  /**
   * Writes a value according to its schema.
   */
  private writeValue(value: unknown, schema: AvroSchema): void {
    const resolvedSchema = this.resolveSchema(schema);

    if (typeof resolvedSchema === 'string') {
      switch (resolvedSchema) {
        case 'null':
          this.encoder.writeNull();
          break;
        case 'boolean':
          this.encoder.writeBoolean(value as boolean);
          break;
        case 'int':
          this.encoder.writeInt(value as number);
          break;
        case 'long':
          this.encoder.writeLong(value as number | bigint);
          break;
        case 'float':
          this.encoder.writeFloat(value as number);
          break;
        case 'double':
          this.encoder.writeDouble(value as number);
          break;
        case 'bytes':
          this.encoder.writeBin(value as Uint8Array);
          break;
        case 'string':
          this.encoder.writeStr(value as string);
          break;
        default:
          throw new Error(`Unknown primitive type: ${resolvedSchema}`);
      }
      return;
    }

    if (Array.isArray(resolvedSchema)) {
      this.writeUnion(value, resolvedSchema);
      return;
    }

    switch (resolvedSchema.type) {
      case 'record':
        this.writeRecord(value as Record<string, unknown>, resolvedSchema);
        break;
      case 'enum':
        this.writeEnum(value as string, resolvedSchema);
        break;
      case 'array':
        this.writeArray(value as unknown[], resolvedSchema);
        break;
      case 'map':
        this.writeMap(value as Record<string, unknown>, resolvedSchema);
        break;
      case 'fixed':
        this.writeFixed(value as Uint8Array, resolvedSchema);
        break;
      default:
        throw new Error(`Unknown schema type: ${(resolvedSchema as any).type}`);
    }
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

  /**
   * Writes a variable-length integer using Avro's encoding (for lengths)
   */
  private writeVarIntUnsigned(value: number): void {
    const writer = this.writer;
    let n = value >>> 0; // Convert to unsigned 32-bit
    while (n >= 0x80) {
      writer.u8((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    writer.u8(n & 0x7f);
  }

  /**
   * Writes a variable-length integer using Avro's encoding (for signed values with zigzag)
   */
  private writeVarIntSigned(value: number): void {
    const writer = this.writer;
    let n = value >>> 0; // Convert to unsigned 32-bit
    while (n >= 0x80) {
      writer.u8((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    writer.u8(n & 0x7f);
  }

  /**
   * Encodes a 32-bit integer using zigzag encoding
   */
  private encodeZigZag32(value: number): number {
    return (value << 1) ^ (value >> 31);
  }
}
