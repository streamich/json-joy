import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {XdrDecoder} from './XdrDecoder';
import {XdrUnion} from './XdrUnion';
import type {IReader, IReaderResettable} from '@jsonjoy.com/buffers/lib';
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

/**
 * XDR (External Data Representation) schema-aware decoder.
 * Decodes values according to provided XDR schemas with proper validation.
 * Based on RFC 4506 specification.
 */
export class XdrSchemaDecoder {
  private decoder: XdrDecoder;

  constructor(public readonly reader: IReader & IReaderResettable = new Reader()) {
    this.decoder = new XdrDecoder(reader);
  }

  /**
   * Decodes a value according to the provided schema.
   */
  public decode(data: Uint8Array, schema: XdrSchema): unknown {
    this.reader.reset(data);
    return this.readValue(schema);
  }

  /**
   * Reads a value according to its schema.
   */
  private readValue(schema: XdrSchema): unknown {
    switch (schema.type) {
      // Primitive types
      case 'void':
        return this.decoder.readVoid();
      case 'int':
        return this.decoder.readInt();
      case 'unsigned_int':
        return this.decoder.readUnsignedInt();
      case 'boolean':
        return this.decoder.readBoolean();
      case 'hyper':
        return this.decoder.readHyper();
      case 'unsigned_hyper':
        return this.decoder.readUnsignedHyper();
      case 'float':
        return this.decoder.readFloat();
      case 'double':
        return this.decoder.readDouble();
      case 'quadruple':
        return this.decoder.readQuadruple();
      case 'enum':
        return this.readEnum(schema as XdrEnumSchema);

      // Wide primitive types
      case 'opaque':
        return this.readOpaque(schema as XdrOpaqueSchema);
      case 'vopaque':
        return this.readVarlenOpaque(schema as XdrVarlenOpaqueSchema);
      case 'string':
        return this.readString(schema as XdrStringSchema);

      // Composite types
      case 'array':
        return this.readArray(schema as XdrArraySchema);
      case 'varray':
        return this.readVarlenArray(schema as XdrVarlenArraySchema);
      case 'struct':
        return this.readStruct(schema as XdrStructSchema);
      case 'union':
        return this.readUnion(schema as XdrUnionSchema);
      case 'optional':
        return this.readOptional(schema as XdrOptionalSchema);
      case 'const':
        // Constants are not decoded; they have no runtime representation
        return undefined;

      default:
        throw new Error(`Unknown schema type: ${(schema as any).type}`);
    }
  }

  /**
   * Reads an enum value according to the enum schema.
   */
  private readEnum(schema: XdrEnumSchema): string | number {
    const value = this.decoder.readEnum();

    // Find the enum name for this value
    for (const [name, enumValue] of Object.entries(schema.values)) {
      if (enumValue === value) {
        return name;
      }
    }

    // If no matching name found, return the numeric value
    return value;
  }

  /**
   * Reads opaque data according to the opaque schema.
   */
  private readOpaque(schema: XdrOpaqueSchema): Uint8Array {
    return this.decoder.readOpaque(schema.size);
  }

  /**
   * Reads variable-length opaque data according to the schema.
   */
  private readVarlenOpaque(schema: XdrVarlenOpaqueSchema): Uint8Array {
    const data = this.decoder.readVarlenOpaque();

    // Check size constraint if specified
    if (schema.size !== undefined && data.length > schema.size) {
      throw new Error(`Variable-length opaque data size ${data.length} exceeds maximum ${schema.size}`);
    }

    return data;
  }

  /**
   * Reads a string according to the string schema.
   */
  private readString(schema: XdrStringSchema): string {
    const str = this.decoder.readString();

    // Check size constraint if specified
    if (schema.size !== undefined && str.length > schema.size) {
      throw new Error(`String length ${str.length} exceeds maximum ${schema.size}`);
    }

    return str;
  }

  /**
   * Reads a fixed-size array according to the array schema.
   */
  private readArray(schema: XdrArraySchema): unknown[] {
    return this.decoder.readArray(schema.size, () => this.readValue(schema.elements));
  }

  /**
   * Reads a variable-length array according to the schema.
   */
  private readVarlenArray(schema: XdrVarlenArraySchema): unknown[] {
    const array = this.decoder.readVarlenArray(() => this.readValue(schema.elements));

    // Check size constraint if specified
    if (schema.size !== undefined && array.length > schema.size) {
      throw new Error(`Variable-length array size ${array.length} exceeds maximum ${schema.size}`);
    }

    return array;
  }

  /**
   * Reads a struct according to the struct schema.
   */
  private readStruct(schema: XdrStructSchema): Record<string, unknown> {
    const struct: Record<string, unknown> = {};

    for (const [fieldSchema, fieldName] of schema.fields) {
      struct[fieldName] = this.readValue(fieldSchema);
    }

    return struct;
  }

  /**
   * Reads a union according to the union schema.
   */
  private readUnion(schema: XdrUnionSchema): XdrUnion {
    // Read discriminant
    const discriminant = this.decoder.readInt();

    // Find matching arm
    for (const [armDiscriminant, armSchema] of schema.arms) {
      if (armDiscriminant === discriminant) {
        const value = this.readValue(armSchema);
        return new XdrUnion(discriminant, value);
      }
    }

    // If no matching arm found, try default
    if (schema.default) {
      const value = this.readValue(schema.default);
      return new XdrUnion(discriminant, value);
    }

    throw new Error(`No matching union arm for discriminant: ${discriminant}`);
  }

  /**
   * Reads optional-data according to the optional schema (RFC 1832 Section 3.19).
   * Optional-data is syntactic sugar for a union with boolean discriminant.
   * Returns null if opted is FALSE, otherwise returns the decoded value.
   */
  private readOptional(schema: XdrOptionalSchema): unknown | null {
    const opted = this.decoder.readBoolean();
    if (!opted) return null;
    return this.readValue(schema.element);
  }
}
