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
  XdrConstantSchema,
} from './types';

/**
 * XDR schema validator for validating XDR schemas and values according to RFC 4506.
 */
export class XdrSchemaValidator {
  /**
   * Validates an XDR schema structure.
   */
  public validateSchema(schema: XdrSchema): boolean {
    try {
      return this.validateSchemaInternal(schema);
    } catch {
      return false;
    }
  }

  /**
   * Validates if a value conforms to the given XDR schema.
   */
  public validateValue(value: unknown, schema: XdrSchema): boolean {
    try {
      return this.validateValueInternal(value, schema);
    } catch {
      return false;
    }
  }

  private validateSchemaInternal(schema: XdrSchema): boolean {
    if (!schema || typeof schema !== 'object' || !schema.type) {
      return false;
    }

    switch (schema.type) {
      // Primitive types
      case 'void':
      case 'int':
      case 'unsigned_int':
      case 'boolean':
      case 'hyper':
      case 'unsigned_hyper':
      case 'float':
      case 'double':
      case 'quadruple':
        return true;

      case 'enum':
        return this.validateEnumSchema(schema as XdrEnumSchema);

      // Wide primitive types
      case 'opaque':
        return this.validateOpaqueSchema(schema as XdrOpaqueSchema);

      case 'vopaque':
        return this.validateVarlenOpaqueSchema(schema as XdrVarlenOpaqueSchema);

      case 'string':
        return this.validateStringSchema(schema as XdrStringSchema);

      // Composite types
      case 'array':
        return this.validateArraySchema(schema as XdrArraySchema);

      case 'varray':
        return this.validateVarlenArraySchema(schema as XdrVarlenArraySchema);

      case 'struct':
        return this.validateStructSchema(schema as XdrStructSchema);

      case 'union':
        return this.validateUnionSchema(schema as XdrUnionSchema);

      case 'optional':
        return this.validateOptionalSchema(schema as XdrOptionalSchema);

      case 'const':
        return this.validateConstantSchema(schema as XdrConstantSchema);

      default:
        return false;
    }
  }

  private validateEnumSchema(schema: XdrEnumSchema): boolean {
    if (!schema.values || typeof schema.values !== 'object') {
      return false;
    }

    const values = Object.values(schema.values);
    const uniqueValues = new Set(values);

    // Check for duplicate values
    if (values.length !== uniqueValues.size) {
      return false;
    }

    // Check that all values are integers
    return values.every((value) => Number.isInteger(value));
  }

  private validateOpaqueSchema(schema: XdrOpaqueSchema): boolean {
    return typeof schema.size === 'number' && Number.isInteger(schema.size) && schema.size >= 0;
  }

  private validateVarlenOpaqueSchema(schema: XdrVarlenOpaqueSchema): boolean {
    return !schema.size || (typeof schema.size === 'number' && Number.isInteger(schema.size) && schema.size >= 0);
  }

  private validateStringSchema(schema: XdrStringSchema): boolean {
    return !schema.size || (typeof schema.size === 'number' && Number.isInteger(schema.size) && schema.size >= 0);
  }

  private validateArraySchema(schema: XdrArraySchema): boolean {
    if (!schema.elements || typeof schema.size !== 'number' || !Number.isInteger(schema.size) || schema.size < 0) {
      return false;
    }
    return this.validateSchemaInternal(schema.elements);
  }

  private validateVarlenArraySchema(schema: XdrVarlenArraySchema): boolean {
    if (!schema.elements) {
      return false;
    }
    if (schema.size !== undefined) {
      if (typeof schema.size !== 'number' || !Number.isInteger(schema.size) || schema.size < 0) {
        return false;
      }
    }
    return this.validateSchemaInternal(schema.elements);
  }

  private validateStructSchema(schema: XdrStructSchema): boolean {
    if (!Array.isArray(schema.fields)) {
      return false;
    }

    const fieldNames = new Set<string>();
    for (const field of schema.fields) {
      if (!Array.isArray(field) || field.length !== 2) {
        return false;
      }

      const [fieldSchema, fieldName] = field;

      if (typeof fieldName !== 'string' || fieldName === '') {
        return false;
      }

      if (fieldNames.has(fieldName)) {
        return false; // Duplicate field name
      }
      fieldNames.add(fieldName);

      if (!this.validateSchemaInternal(fieldSchema)) {
        return false;
      }
    }

    return true;
  }

  private validateUnionSchema(schema: XdrUnionSchema): boolean {
    if (!Array.isArray(schema.arms) || schema.arms.length === 0) {
      return false;
    }

    const discriminants = new Set();
    for (const arm of schema.arms) {
      if (!Array.isArray(arm) || arm.length !== 2) {
        return false;
      }

      const [discriminant, armSchema] = arm;

      // Check for duplicate discriminants
      if (discriminants.has(discriminant)) {
        return false;
      }
      discriminants.add(discriminant);

      // Validate discriminant type
      if (typeof discriminant !== 'number' && typeof discriminant !== 'string' && typeof discriminant !== 'boolean') {
        return false;
      }

      if (!this.validateSchemaInternal(armSchema)) {
        return false;
      }
    }

    // Validate default schema if present
    if (schema.default && !this.validateSchemaInternal(schema.default)) {
      return false;
    }

    return true;
  }

  private validateOptionalSchema(schema: XdrOptionalSchema): boolean {
    if (!schema.element) {
      return false;
    }

    return this.validateSchemaInternal(schema.element);
  }

  private validateConstantSchema(schema: XdrConstantSchema): boolean {
    if (typeof schema.value !== 'number' || !Number.isInteger(schema.value)) {
      return false;
    }

    return true;
  }

  private validateValueInternal(value: unknown, schema: XdrSchema): boolean {
    switch (schema.type) {
      case 'void':
        return value === null || value === undefined;

      case 'int':
        return typeof value === 'number' && Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;

      case 'unsigned_int':
        return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 4294967295;

      case 'boolean':
        return typeof value === 'boolean';

      case 'hyper':
        return (typeof value === 'number' && Number.isInteger(value)) || typeof value === 'bigint';

      case 'unsigned_hyper':
        return (
          (typeof value === 'number' && Number.isInteger(value) && value >= 0) ||
          (typeof value === 'bigint' && value >= BigInt(0))
        );

      case 'float':
      case 'double':
      case 'quadruple':
        return typeof value === 'number';

      case 'enum': {
        const enumSchema = schema as XdrEnumSchema;
        return typeof value === 'string' && value in enumSchema.values;
      }
      case 'opaque': {
        const opaqueSchema = schema as XdrOpaqueSchema;
        return value instanceof Uint8Array && value.length === opaqueSchema.size;
      }
      case 'vopaque': {
        const vopaqueSchema = schema as XdrVarlenOpaqueSchema;
        return value instanceof Uint8Array && (!vopaqueSchema.size || value.length <= vopaqueSchema.size);
      }
      case 'string': {
        const stringSchema = schema as XdrStringSchema;
        return typeof value === 'string' && (!stringSchema.size || value.length <= stringSchema.size);
      }
      case 'array': {
        const arraySchema = schema as XdrArraySchema;
        return (
          Array.isArray(value) &&
          value.length === arraySchema.size &&
          value.every((item) => this.validateValueInternal(item, arraySchema.elements))
        );
      }
      case 'varray': {
        const varraySchema = schema as XdrVarlenArraySchema;
        return (
          Array.isArray(value) &&
          (!varraySchema.size || value.length <= varraySchema.size) &&
          value.every((item) => this.validateValueInternal(item, varraySchema.elements))
        );
      }
      case 'struct': {
        const structSchema = schema as XdrStructSchema;
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          return false;
        }
        const valueObj = value as Record<string, unknown>;
        return structSchema.fields.every(
          ([fieldSchema, fieldName]) =>
            fieldName in valueObj && this.validateValueInternal(valueObj[fieldName], fieldSchema),
        );
      }
      case 'union': {
        const unionSchema = schema as XdrUnionSchema;
        // For union validation, we need additional context about which arm is selected
        // This is a simplified validation - in practice, the discriminant would be known
        const matchesArm = unionSchema.arms.some(([, armSchema]) => this.validateValueInternal(value, armSchema));
        const matchesDefault = unionSchema.default ? this.validateValueInternal(value, unionSchema.default) : false;
        return matchesArm || matchesDefault;
      }
      case 'optional': {
        const optionalSchema = schema as XdrOptionalSchema;
        // Optional values can be null/undefined or match the element schema
        return value === null || value === undefined || this.validateValueInternal(value, optionalSchema.element);
      }
      case 'const': {
        // Constants have no runtime value validation
        return true;
      }

      default:
        return false;
    }
  }
}
