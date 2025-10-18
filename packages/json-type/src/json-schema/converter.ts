import type * as schema from '../schema';
import type {AliasType} from '../type';
import type {AbsType} from '../type/classes/AbsType';
import type {AnyType} from '../type/classes/AnyType';
import type {ArrType} from '../type/classes/ArrType';
import type {BinType} from '../type/classes/BinType';
import type {BoolType} from '../type/classes/BoolType';
import type {ConType} from '../type/classes/ConType';
import type {MapType} from '../type/classes/MapType';
import {TypeExportContext} from '../type/classes/ModuleType/TypeExportContext';
import type {NumType} from '../type/classes/NumType';
import type {ObjType} from '../type/classes/ObjType';
import type {OrType} from '../type/classes/OrType';
import type {RefType} from '../type/classes/RefType';
import type {StrType} from '../type/classes/StrType';
import type {
  JsonSchemaAny,
  JsonSchemaArray,
  JsonSchemaBinary,
  JsonSchemaBoolean,
  JsonSchemaGenericKeywords,
  JsonSchemaNode,
  JsonSchemaNumber,
  JsonSchemaObject,
  JsonSchemaOr,
  JsonSchemaRef,
  JsonSchemaString,
  JsonSchemaValueNode,
} from './types';

export const aliasToJsonSchema = (alias: AliasType<any, any>): JsonSchemaGenericKeywords => {
  const node: JsonSchemaGenericKeywords = {
    $id: alias.id,
    $ref: '#/$defs/' + alias.id,
    $defs: {},
  };
  const ctx = new TypeExportContext();
  ctx.visitRef(alias.id);
  node.$defs![alias.id] = typeToJsonSchema(alias.type, ctx) as JsonSchemaValueNode;
  let ref: string | undefined;
  while ((ref = ctx.nextMentionedRef())) {
    ctx.visitRef(ref);
    node.$defs![ref] = typeToJsonSchema(alias.system.resolve(ref).type, ctx) as JsonSchemaValueNode;
  }
  return node;
};

/**
 * Extracts the base JSON Schema properties that are common to all types.
 * This replaces the logic from AbsType.toJsonSchema().
 */
function getBaseJsonSchema(type: AbsType<any>, ctx?: TypeExportContext): JsonSchemaGenericKeywords {
  const typeSchema = type.getSchema();
  const jsonSchema: JsonSchemaGenericKeywords = {};

  if (typeSchema.title) jsonSchema.title = typeSchema.title;
  if (typeSchema.description) jsonSchema.description = typeSchema.description;
  if (typeSchema.examples) {
    jsonSchema.examples = typeSchema.examples.map((example: schema.SchemaExample) => example.value);
  }

  return jsonSchema;
}

/**
 * Main router function that converts a type to JSON Schema using a switch statement.
 * This replaces the individual toJsonSchema() methods on each type class.
 */
export function typeToJsonSchema(type: AbsType<any>, ctx?: TypeExportContext): JsonSchemaNode {
  const typeName = type.kind();

  switch (typeName) {
    case 'any':
      return anyToJsonSchema(type as AnyType, ctx);
    case 'arr':
      return arrayToJsonSchema(type as ArrType<any, any, any>, ctx);
    case 'bin':
      return binaryToJsonSchema(type as BinType<any>, ctx);
    case 'bool':
      return booleanToJsonSchema(type as BoolType, ctx);
    case 'con':
      return constToJsonSchema(type as ConType<any>, ctx);
    case 'map':
      return mapToJsonSchema(type as MapType<any>, ctx);
    case 'num':
      return numberToJsonSchema(type as NumType, ctx);
    case 'obj':
      return objectToJsonSchema(type as ObjType<any>, ctx);
    case 'or':
      return orToJsonSchema(type as OrType<any>, ctx);
    case 'ref':
      return refToJsonSchema(type as RefType<any>, ctx);
    case 'str':
      return stringToJsonSchema(type as StrType, ctx);
    default:
      // Fallback to base implementation for unknown types
      return getBaseJsonSchema(type, ctx);
  }
}

// Individual converter functions for each type

function anyToJsonSchema(type: AnyType, ctx?: TypeExportContext): JsonSchemaAny {
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaAny = {
    type: ['string', 'number', 'boolean', 'null', 'array', 'object'] as const,
  };

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}

function arrayToJsonSchema(type: ArrType<any, any, any>, ctx?: TypeExportContext): JsonSchemaArray {
  // TODO: Handle head and tail tuples.
  //   function tupleToJsonSchema(type: TupType<any>, ctx?: TypeExportContext): JsonSchemaArray {
  //   const baseSchema = getBaseJsonSchema(type, ctx);
  //   const types = (type as any).types;
  //   const result: JsonSchemaArray = {
  //     type: 'array',
  //     items: false,
  //     prefixItems: types.map((t: any) => typeToJsonSchema(t, ctx)),
  //   };

  //   // Add base properties
  //   Object.assign(result, baseSchema);

  //   return result;
  // }
  const schema = type.getSchema();
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaArray = {
    type: 'array',
    items: typeToJsonSchema(type._type, ctx),
  };

  // Add base properties
  Object.assign(result, baseSchema);

  if (schema.min !== undefined) result.minItems = schema.min;
  if (schema.max !== undefined) result.maxItems = schema.max;

  return result;
}

function binaryToJsonSchema(type: BinType<any>, ctx?: TypeExportContext): JsonSchemaBinary {
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaBinary = {
    type: 'binary' as any,
  };

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}

function booleanToJsonSchema(type: BoolType, ctx?: TypeExportContext): JsonSchemaBoolean {
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaBoolean = {
    type: 'boolean',
  };

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}

function constToJsonSchema(type: ConType<any>, ctx?: TypeExportContext): JsonSchemaNode {
  const schema = type.getSchema();
  const baseSchema = getBaseJsonSchema(type, ctx);
  const value = schema.value;

  if (typeof value === 'string') {
    const result: JsonSchemaString = {
      type: 'string',
      const: value,
    };
    Object.assign(result, baseSchema);
    return result;
  } else if (typeof value === 'number') {
    const result: JsonSchemaNumber = {
      type: 'number',
      const: value,
    };
    Object.assign(result, baseSchema);
    return result;
  } else if (typeof value === 'boolean') {
    const result: JsonSchemaBoolean = {
      type: 'boolean',
      const: value,
    };
    Object.assign(result, baseSchema);
    return result;
  } else if (value === null) {
    const result: any = {
      type: 'null',
      const: null,
    };
    Object.assign(result, baseSchema);
    return result;
  } else if (typeof value === 'undefined') {
    // For undefined values, we return a special schema
    const result: any = {
      type: 'undefined',
      const: undefined,
    };
    Object.assign(result, baseSchema);
    return result;
  } else if (Array.isArray(value)) {
    const result: JsonSchemaArray = {
      type: 'array',
      const: value,
      items: false,
    };
    Object.assign(result, baseSchema);
    return result;
  } else if (typeof value === 'object') {
    const result: JsonSchemaObject = {
      type: 'object',
      const: value,
    };
    Object.assign(result, baseSchema);
    return result;
  }

  return baseSchema;
}

function mapToJsonSchema(type: MapType<any>, ctx?: TypeExportContext): JsonSchemaObject {
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaObject = {
    type: 'object',
    patternProperties: {
      '.*': typeToJsonSchema(type._value, ctx),
    },
  };

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}

function numberToJsonSchema(type: NumType, ctx?: TypeExportContext): JsonSchemaNumber {
  const schema = type.getSchema();
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaNumber = {
    type: 'number',
  };

  // Check if it's an integer format
  const ints = new Set(['i8', 'i16', 'i32', 'u8', 'u16', 'u32']);
  if (schema.format && ints.has(schema.format)) {
    result.type = 'integer';
  }

  // Add base properties
  Object.assign(result, baseSchema);

  if (schema.gt !== undefined) result.exclusiveMinimum = schema.gt;
  if (schema.gte !== undefined) result.minimum = schema.gte;
  if (schema.lt !== undefined) result.exclusiveMaximum = schema.lt;
  if (schema.lte !== undefined) result.maximum = schema.lte;

  return result;
}

function objectToJsonSchema(type: ObjType<any>, ctx?: TypeExportContext): JsonSchemaObject {
  const schema = type.getSchema();
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaObject = {
    type: 'object',
    properties: {},
  };

  const required = [];
  const fields = type.keys;
  for (const field of fields) {
    result.properties![field.key] = typeToJsonSchema(field.val, ctx);
    if (!field.optional) {
      required.push(field.key);
    }
  }

  if (required.length) result.required = required;
  if (schema.decodeUnknownKeys === false) result.additionalProperties = false;

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}

function orToJsonSchema(type: OrType<any>, ctx?: TypeExportContext): JsonSchemaOr {
  const baseSchema = getBaseJsonSchema(type, ctx);
  const types = (type as any).types;
  const result: JsonSchemaOr = {
    anyOf: types.map((t: any) => typeToJsonSchema(t, ctx)),
  };

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}

function refToJsonSchema(type: RefType<any>, ctx?: TypeExportContext): JsonSchemaRef {
  const schema = type.getSchema();
  const baseSchema = getBaseJsonSchema(type, ctx);
  const ref = schema.ref;

  if (ctx) ctx.mentionRef(ref);

  const result: JsonSchemaRef = {
    $ref: `#/$defs/${ref}`,
  };

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}

function stringToJsonSchema(type: StrType, ctx?: TypeExportContext): JsonSchemaString {
  const schema = type.getSchema();
  const baseSchema = getBaseJsonSchema(type, ctx);
  const result: JsonSchemaString = {
    type: 'string',
  };

  if (schema.min !== undefined) result.minLength = schema.min;
  if (schema.max !== undefined) result.maxLength = schema.max;

  // Add format to JSON Schema if specified
  if (schema.format) {
    if (schema.format === 'ascii') {
      // JSON Schema doesn't have an "ascii" format, but we can use a pattern
      // ASCII characters are from 0x00 to 0x7F (0-127)
      result.pattern = '^[\\x00-\\x7F]*$';
    }
    // UTF-8 is the default for JSON Schema strings, so we don't need to add anything special
  } else if (schema.ascii) {
    // Backward compatibility: if ascii=true, add pattern
    result.pattern = '^[\\x00-\\x7F]*$';
  }

  // Add base properties
  Object.assign(result, baseSchema);

  return result;
}
