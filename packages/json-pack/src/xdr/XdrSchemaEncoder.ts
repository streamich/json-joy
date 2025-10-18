import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib';
import {XdrEncoder} from './XdrEncoder';
import {XdrUnion} from './XdrUnion';
import type {
  XdrSchema,
  XdrEnumSchema,
  XdrOpaqueSchema,
  XdrVarlenOpaqueSchema,
  XdrStringSchema,
  XdrArraySchema,
  XdrVarlenArraySchema,
  XdrStructSchema,
  XdrUnionSchema,
  XdrOptionalSchema,
} from './types';

export class XdrSchemaEncoder {
  private encoder: XdrEncoder;

  constructor(public readonly writer: IWriter & IWriterGrowable) {
    this.encoder = new XdrEncoder(writer);
  }

  public encode(value: unknown, schema: XdrSchema): Uint8Array {
    this.writer.reset();
    this.writeValue(value, schema);
    return this.writer.flush();
  }

  public writeVoid(schema: XdrSchema): void {
    this.validateSchemaType(schema, 'void');
    this.encoder.writeVoid();
  }

  public writeInt(value: number, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'int');
    if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) {
      throw new Error('Value is not a valid 32-bit signed integer');
    }
    this.encoder.writeInt(value);
  }

  public writeUnsignedInt(value: number, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'unsigned_int');
    if (!Number.isInteger(value) || value < 0 || value > 4294967295) {
      throw new Error('Value is not a valid 32-bit unsigned integer');
    }
    this.encoder.writeUnsignedInt(value);
  }

  public writeBoolean(value: boolean, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'boolean');
    this.encoder.writeBoolean(value);
  }

  public writeHyper(value: number | bigint, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'hyper');
    this.encoder.writeHyper(value);
  }

  public writeUnsignedHyper(value: number | bigint, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'unsigned_hyper');
    if ((typeof value === 'number' && value < 0) || (typeof value === 'bigint' && value < BigInt(0))) {
      throw new Error('Value is not a valid unsigned integer');
    }
    this.encoder.writeUnsignedHyper(value);
  }

  public writeFloat(value: number, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'float');
    this.encoder.writeFloat(value);
  }

  public writeDouble(value: number, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'double');
    this.encoder.writeDouble(value);
  }

  public writeQuadruple(value: number, schema: XdrSchema): void {
    this.validateSchemaType(schema, 'quadruple');
    this.encoder.writeQuadruple(value);
  }

  public writeEnum(value: string, schema: XdrEnumSchema): void {
    if (schema.type !== 'enum') {
      throw new Error('Schema is not an enum schema');
    }

    if (!(value in schema.values)) {
      throw new Error(`Invalid enum value: ${value}. Valid values are: ${Object.keys(schema.values).join(', ')}`);
    }

    const enumValue = schema.values[value];
    // Per RFC 4506 Section 4.3: "It is an error to encode as an enum any integer other than those that have been given assignments"
    if (!Number.isInteger(enumValue)) {
      throw new Error(`Enum value ${value} has non-integer assignment: ${enumValue}`);
    }

    this.encoder.writeInt(enumValue);
  }

  public writeOpaque(value: Uint8Array, schema: XdrOpaqueSchema): void {
    if (schema.type !== 'opaque') {
      throw new Error('Schema is not an opaque schema');
    }

    if (value.length !== schema.size) {
      throw new Error(`Opaque data length ${value.length} does not match schema size ${schema.size}`);
    }

    this.encoder.writeOpaque(value);
  }

  public writeVarlenOpaque(value: Uint8Array, schema: XdrVarlenOpaqueSchema): void {
    if (schema.type !== 'vopaque') {
      throw new Error('Schema is not a variable-length opaque schema');
    }

    if (schema.size !== undefined && value.length > schema.size) {
      throw new Error(`Opaque data length ${value.length} exceeds maximum size ${schema.size}`);
    }

    this.encoder.writeVarlenOpaque(value);
  }

  public writeString(value: string, schema: XdrStringSchema): void {
    if (schema.type !== 'string') {
      throw new Error('Schema is not a string schema');
    }

    if (schema.size !== undefined && value.length > schema.size) {
      throw new Error(`String length ${value.length} exceeds maximum size ${schema.size}`);
    }

    this.encoder.writeStr(value);
  }

  public writeArray(value: unknown[], schema: XdrArraySchema): void {
    if (schema.type !== 'array') {
      throw new Error('Schema is not an array schema');
    }

    if (value.length !== schema.size) {
      throw new Error(`Array length ${value.length} does not match schema size ${schema.size}`);
    }

    for (const item of value) {
      this.writeValue(item, schema.elements);
    }
  }

  public writeVarlenArray(value: unknown[], schema: XdrVarlenArraySchema): void {
    if (schema.type !== 'varray') {
      throw new Error('Schema is not a variable-length array schema');
    }

    if (schema.size !== undefined && value.length > schema.size) {
      throw new Error(`Array length ${value.length} exceeds maximum size ${schema.size}`);
    }

    this.encoder.writeUnsignedInt(value.length);
    for (const item of value) {
      this.writeValue(item, schema.elements);
    }
  }

  public writeStruct(value: Record<string, unknown>, schema: XdrStructSchema): void {
    if (schema.type !== 'struct') {
      throw new Error('Schema is not a struct schema');
    }

    for (const [fieldSchema, fieldName] of schema.fields) {
      if (!(fieldName in value)) {
        throw new Error(`Missing required field: ${fieldName}`);
      }
      this.writeValue(value[fieldName], fieldSchema);
    }
  }

  public writeUnion(value: unknown, schema: XdrUnionSchema, discriminant: number | string | boolean): void {
    if (schema.type !== 'union') {
      throw new Error('Schema is not a union schema');
    }

    const arm = schema.arms.find(([armDiscriminant]) => armDiscriminant === discriminant);
    if (!arm) {
      if (schema.default) {
        this.writeDiscriminant(discriminant);
        this.writeValue(value, schema.default);
      } else {
        throw new Error(`No matching arm found for discriminant: ${discriminant}`);
      }
    } else {
      this.writeDiscriminant(discriminant);
      this.writeValue(value, arm[1]);
    }
  }

  /**
   * Writes optional-data value (RFC 1832 Section 3.19).
   * Optional-data is syntactic sugar for a union with boolean discriminant.
   * If value is null/undefined, writes FALSE; otherwise writes TRUE and the value.
   */
  public writeOptional(value: unknown, schema: XdrOptionalSchema): void {
    if (schema.type !== 'optional') {
      throw new Error('Schema is not an optional schema');
    }

    if (value === null || value === undefined) {
      this.encoder.writeBoolean(false);
    } else {
      this.encoder.writeBoolean(true);
      this.writeValue(value, schema.element);
    }
  }

  public writeNumber(value: number, schema: XdrSchema): void {
    switch (schema.type) {
      case 'int':
        this.writeInt(value, schema);
        break;
      case 'unsigned_int':
        this.writeUnsignedInt(value, schema);
        break;
      case 'hyper':
        this.writeHyper(value, schema);
        break;
      case 'unsigned_hyper':
        this.writeUnsignedHyper(value, schema);
        break;
      case 'float':
        this.writeFloat(value, schema);
        break;
      case 'double':
        this.writeDouble(value, schema);
        break;
      case 'quadruple':
        this.writeQuadruple(value, schema);
        break;
      default:
        throw new Error(`Schema type ${schema.type} is not a numeric type`);
    }
  }

  private writeValue(value: unknown, schema: XdrSchema): void {
    switch (schema.type) {
      case 'void':
        this.encoder.writeVoid();
        break;
      case 'int':
        this.encoder.writeInt(value as number);
        break;
      case 'unsigned_int':
        this.encoder.writeUnsignedInt(value as number);
        break;
      case 'boolean':
        this.encoder.writeBoolean(value as boolean);
        break;
      case 'hyper':
        this.encoder.writeHyper(value as number | bigint);
        break;
      case 'unsigned_hyper':
        this.encoder.writeUnsignedHyper(value as number | bigint);
        break;
      case 'float':
        this.encoder.writeFloat(value as number);
        break;
      case 'double':
        this.encoder.writeDouble(value as number);
        break;
      case 'quadruple':
        this.encoder.writeQuadruple(value as number);
        break;
      case 'enum':
        this.writeEnum(value as string, schema as XdrEnumSchema);
        break;
      case 'opaque':
        this.writeOpaque(value as Uint8Array, schema as XdrOpaqueSchema);
        break;
      case 'vopaque':
        this.writeVarlenOpaque(value as Uint8Array, schema as XdrVarlenOpaqueSchema);
        break;
      case 'string':
        this.writeString(value as string, schema as XdrStringSchema);
        break;
      case 'array':
        this.writeArray(value as unknown[], schema as XdrArraySchema);
        break;
      case 'varray':
        this.writeVarlenArray(value as unknown[], schema as XdrVarlenArraySchema);
        break;
      case 'struct':
        this.writeStruct(value as Record<string, unknown>, schema as XdrStructSchema);
        break;
      case 'union':
        if (value instanceof XdrUnion) {
          this.writeUnion(value.value, schema as XdrUnionSchema, value.discriminant);
        } else {
          throw new Error('Union values must be wrapped in XdrUnion class');
        }
        break;
      case 'optional':
        this.writeOptional(value, schema as XdrOptionalSchema);
        break;
      case 'const':
        // Constants are not encoded; they are compile-time values
        break;
      default:
        throw new Error(`Unknown schema type: ${(schema as any).type}`);
    }
  }

  private validateSchemaType(schema: XdrSchema, expectedType: string): void {
    if (schema.type !== expectedType) {
      throw new Error(`Expected schema type ${expectedType}, got ${schema.type}`);
    }
  }

  private writeDiscriminant(discriminant: number | string | boolean): void {
    if (typeof discriminant === 'number') {
      this.encoder.writeInt(discriminant);
    } else if (typeof discriminant === 'boolean') {
      this.encoder.writeBoolean(discriminant);
    } else {
      // For string discriminants, we need to know the enum mapping
      // This is a simplified implementation
      throw new Error('String discriminants require enum schema context');
    }
  }
}
