import type {
  AvroSchema,
  AvroNullSchema,
  AvroBooleanSchema,
  AvroIntSchema,
  AvroLongSchema,
  AvroFloatSchema,
  AvroDoubleSchema,
  AvroBytesSchema,
  AvroStringSchema,
  AvroRecordSchema,
  AvroEnumSchema,
  AvroArraySchema,
  AvroMapSchema,
  AvroUnionSchema,
  AvroFixedSchema,
  AvroRecordField,
  AvroNamedSchema,
} from './types';

/**
 * Validates Apache Avro schemas according to the specification.
 * Based on https://avro.apache.org/docs/1.12.0/specification/
 */
export class AvroSchemaValidator {
  private namedSchemas = new Map<string, AvroNamedSchema>();

  /**
   * Validates an Avro schema and resolves named schema references.
   */
  public validateSchema(schema: AvroSchema): boolean {
    this.namedSchemas.clear();
    return this.validateSchemaInternal(schema);
  }

  /**
   * Validates that a value conforms to the given Avro schema.
   */
  public validateValue(value: unknown, schema: AvroSchema): boolean {
    this.namedSchemas.clear();
    this.validateSchemaInternal(schema);
    return this.validateValueAgainstSchema(value, schema);
  }

  private validateSchemaInternal(schema: AvroSchema): boolean {
    if (typeof schema === 'string') {
      // String schema references (either primitive type or named type)
      return this.validateStringSchema(schema);
    }

    if (Array.isArray(schema)) {
      // Union schema
      return this.validateUnionSchema(schema);
    }

    if (typeof schema === 'object' && schema !== null) {
      switch (schema.type) {
        case 'null':
          return this.validateNullSchema(schema as AvroNullSchema);
        case 'boolean':
          return this.validateBooleanSchema(schema as AvroBooleanSchema);
        case 'int':
          return this.validateIntSchema(schema as AvroIntSchema);
        case 'long':
          return this.validateLongSchema(schema as AvroLongSchema);
        case 'float':
          return this.validateFloatSchema(schema as AvroFloatSchema);
        case 'double':
          return this.validateDoubleSchema(schema as AvroDoubleSchema);
        case 'bytes':
          return this.validateBytesSchema(schema as AvroBytesSchema);
        case 'string':
          return this.validateStringTypeSchema(schema as AvroStringSchema);
        case 'record':
          return this.validateRecordSchema(schema as AvroRecordSchema);
        case 'enum':
          return this.validateEnumSchema(schema as AvroEnumSchema);
        case 'array':
          return this.validateArraySchema(schema as AvroArraySchema);
        case 'map':
          return this.validateMapSchema(schema as AvroMapSchema);
        case 'fixed':
          return this.validateFixedSchema(schema as AvroFixedSchema);
        default:
          return false;
      }
    }

    return false;
  }

  private validateStringSchema(schema: string): boolean {
    const primitiveTypes = ['null', 'boolean', 'int', 'long', 'float', 'double', 'bytes', 'string'];
    return primitiveTypes.includes(schema) || this.namedSchemas.has(schema);
  }

  private validateUnionSchema(schema: AvroUnionSchema): boolean {
    if (schema.length === 0) return false;
    const typeSet = new Set<string>();

    for (const subSchema of schema) {
      if (!this.validateSchemaInternal(subSchema)) return false;

      // Union types must be unique
      const typeName = this.getSchemaTypeName(subSchema);
      if (typeSet.has(typeName)) return false;
      typeSet.add(typeName);
    }

    return true;
  }

  private validateNullSchema(schema: AvroNullSchema): boolean {
    return schema.type === 'null';
  }

  private validateBooleanSchema(schema: AvroBooleanSchema): boolean {
    return schema.type === 'boolean';
  }

  private validateIntSchema(schema: AvroIntSchema): boolean {
    return schema.type === 'int';
  }

  private validateLongSchema(schema: AvroLongSchema): boolean {
    return schema.type === 'long';
  }

  private validateFloatSchema(schema: AvroFloatSchema): boolean {
    return schema.type === 'float';
  }

  private validateDoubleSchema(schema: AvroDoubleSchema): boolean {
    return schema.type === 'double';
  }

  private validateBytesSchema(schema: AvroBytesSchema): boolean {
    return schema.type === 'bytes';
  }

  private validateStringTypeSchema(schema: AvroStringSchema): boolean {
    return schema.type === 'string';
  }

  private validateRecordSchema(schema: AvroRecordSchema): boolean {
    if (schema.type !== 'record' || !schema.name || !Array.isArray(schema.fields)) return false;

    const fullName = this.getFullName(schema.name, schema.namespace);
    if (this.namedSchemas.has(fullName)) return false;
    this.namedSchemas.set(fullName, schema);

    const fieldNames = new Set<string>();
    for (const field of schema.fields) {
      if (!this.validateRecordField(field)) return false;
      if (fieldNames.has(field.name)) return false;
      fieldNames.add(field.name);
    }

    return true;
  }

  private validateRecordField(field: AvroRecordField): boolean {
    return typeof field.name === 'string' && field.name.length > 0 && this.validateSchemaInternal(field.type);
  }

  private validateEnumSchema(schema: AvroEnumSchema): boolean {
    if (schema.type !== 'enum' || !schema.name || !Array.isArray(schema.symbols)) return false;

    const fullName = this.getFullName(schema.name, schema.namespace);
    if (this.namedSchemas.has(fullName)) return false;
    this.namedSchemas.set(fullName, schema);

    if (schema.symbols.length === 0) return false;
    const symbolSet = new Set<string>();
    for (const symbol of schema.symbols) {
      if (typeof symbol !== 'string' || symbolSet.has(symbol)) return false;
      symbolSet.add(symbol);
    }

    // Default symbol must be in symbols array if provided
    if (schema.default !== undefined && !schema.symbols.includes(schema.default)) return false;

    return true;
  }

  private validateArraySchema(schema: AvroArraySchema): boolean {
    return schema.type === 'array' && this.validateSchemaInternal(schema.items);
  }

  private validateMapSchema(schema: AvroMapSchema): boolean {
    return schema.type === 'map' && this.validateSchemaInternal(schema.values);
  }

  private validateFixedSchema(schema: AvroFixedSchema): boolean {
    if (schema.type !== 'fixed' || !schema.name || typeof schema.size !== 'number') return false;
    if (schema.size < 0) return false;

    const fullName = this.getFullName(schema.name, schema.namespace);
    if (this.namedSchemas.has(fullName)) return false;
    this.namedSchemas.set(fullName, schema);

    return true;
  }

  private validateValueAgainstSchema(value: unknown, schema: AvroSchema): boolean {
    if (typeof schema === 'string') {
      return this.validateValueAgainstStringSchema(value, schema);
    }

    if (Array.isArray(schema)) {
      // Union - value must match one of the schemas
      return schema.some((subSchema) => this.validateValueAgainstSchema(value, subSchema));
    }

    if (typeof schema === 'object' && schema !== null) {
      switch (schema.type) {
        case 'null':
          return value === null;
        case 'boolean':
          return typeof value === 'boolean';
        case 'int':
          return typeof value === 'number' && Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
        case 'long':
          return (typeof value === 'number' && Number.isInteger(value)) || typeof value === 'bigint';
        case 'float':
        case 'double':
          return typeof value === 'number';
        case 'bytes':
          return value instanceof Uint8Array;
        case 'string':
          return typeof value === 'string';
        case 'record':
          return this.validateValueAgainstRecord(value, schema as AvroRecordSchema);
        case 'enum':
          return this.validateValueAgainstEnum(value, schema as AvroEnumSchema);
        case 'array':
          return this.validateValueAgainstArray(value, schema as AvroArraySchema);
        case 'map':
          return this.validateValueAgainstMap(value, schema as AvroMapSchema);
        case 'fixed':
          return this.validateValueAgainstFixed(value, schema as AvroFixedSchema);
        default:
          return false;
      }
    }

    return false;
  }

  private validateValueAgainstStringSchema(value: unknown, schema: string): boolean {
    switch (schema) {
      case 'null':
        return value === null;
      case 'boolean':
        return typeof value === 'boolean';
      case 'int':
        return typeof value === 'number' && Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
      case 'long':
        return (typeof value === 'number' && Number.isInteger(value)) || typeof value === 'bigint';
      case 'float':
      case 'double':
        return typeof value === 'number';
      case 'bytes':
        return value instanceof Uint8Array;
      case 'string':
        return typeof value === 'string';
      default: {
        // Named schema reference
        const namedSchema = this.namedSchemas.get(schema);
        return namedSchema ? this.validateValueAgainstSchema(value, namedSchema) : false;
      }
    }
  }

  private validateValueAgainstRecord(value: unknown, schema: AvroRecordSchema): boolean {
    if (typeof value !== 'object' || value === null) return false;
    const obj = value as Record<string, unknown>;

    for (const field of schema.fields) {
      const fieldValue = obj[field.name];
      if (fieldValue === undefined && field.default === undefined) return false;
      if (fieldValue !== undefined && !this.validateValueAgainstSchema(fieldValue, field.type)) return false;
    }

    return true;
  }

  private validateValueAgainstEnum(value: unknown, schema: AvroEnumSchema): boolean {
    return typeof value === 'string' && schema.symbols.includes(value);
  }

  private validateValueAgainstArray(value: unknown, schema: AvroArraySchema): boolean {
    if (!Array.isArray(value)) return false;
    return value.every((item) => this.validateValueAgainstSchema(item, schema.items));
  }

  private validateValueAgainstMap(value: unknown, schema: AvroMapSchema): boolean {
    if (typeof value !== 'object' || value === null) return false;
    const obj = value as Record<string, unknown>;
    return Object.values(obj).every((val) => this.validateValueAgainstSchema(val, schema.values));
  }

  private validateValueAgainstFixed(value: unknown, schema: AvroFixedSchema): boolean {
    return value instanceof Uint8Array && value.length === schema.size;
  }

  private getSchemaTypeName(schema: AvroSchema): string {
    if (typeof schema === 'string') return schema;
    if (Array.isArray(schema)) return 'union';
    return schema.type;
  }

  private getFullName(name: string, namespace?: string): string {
    return namespace ? `${namespace}.${name}` : name;
  }
}
