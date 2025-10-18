import type {Display} from './common';
import type {ObjSchema, Schema, SchemaBase, SchemaExample} from './schema';

const validateDisplay = ({title, description, intro}: Display): void => {
  if (title !== undefined && typeof title !== 'string') throw new Error('INVALID_TITLE');
  if (description !== undefined && typeof description !== 'string') throw new Error('INVALID_DESCRIPTION');
  if (intro !== undefined && typeof intro !== 'string') throw new Error('INVALID_INTRO');
};

const validateTExample = (example: SchemaExample): void => {
  validateDisplay(example);
};

export const validateTType = (tType: SchemaBase, kind: string): void => {
  validateDisplay(tType);
  // const {id} = tType;
  // if (id !== undefined && typeof id !== 'string') throw new Error('INVALID_ID');
  if (tType.kind !== kind) throw new Error('INVALID_TYPE');
  const {examples} = tType;
  if (examples) {
    if (!Array.isArray(examples)) throw new Error('INVALID_EXAMPLES');
    examples.forEach(validateTExample);
  }
};

const validateMinMax = (min: number | undefined, max: number | undefined) => {
  if (min !== undefined) {
    if (typeof min !== 'number') throw new Error('MIN_TYPE');
    if (min < 0) throw new Error('MIN_NEGATIVE');
    if (min % 1 !== 0) throw new Error('MIN_DECIMAL');
  }
  if (max !== undefined) {
    if (typeof max !== 'number') throw new Error('MAX_TYPE');
    if (max < 0) throw new Error('MAX_NEGATIVE');
    if (max % 1 !== 0) throw new Error('MAX_DECIMAL');
  }
  if (min !== undefined && max !== undefined && min > max) throw new Error('MIN_MAX');
};

const validateAnySchema = (schema: any): void => {
  validateTType(schema, 'any');
};

const validateBoolSchema = (schema: any): void => {
  validateTType(schema, 'bool');
};

const validateNumSchema = (schema: any): void => {
  validateTType(schema, 'num');
  const {format, gt, gte, lt, lte} = schema;
  if (gt !== undefined && typeof gt !== 'number') throw new Error('GT_TYPE');
  if (gte !== undefined && typeof gte !== 'number') throw new Error('GTE_TYPE');
  if (lt !== undefined && typeof lt !== 'number') throw new Error('LT_TYPE');
  if (lte !== undefined && typeof lte !== 'number') throw new Error('LTE_TYPE');
  if (gt !== undefined && gte !== undefined) throw new Error('GT_GTE');
  if (lt !== undefined && lte !== undefined) throw new Error('LT_LTE');
  if ((gt !== undefined || gte !== undefined) && (lt !== undefined || lte !== undefined))
    if ((gt ?? gte)! > (lt ?? lte)!) throw new Error('GT_LT');
  if (format !== undefined) {
    if (typeof format !== 'string') throw new Error('FORMAT_TYPE');
    if (!format) throw new Error('FORMAT_EMPTY');
    switch (format) {
      case 'i':
      case 'u':
      case 'f':
      case 'i8':
      case 'i16':
      case 'i32':
      case 'i64':
      case 'u8':
      case 'u16':
      case 'u32':
      case 'u64':
      case 'f32':
      case 'f64':
        break;
      default:
        throw new Error('FORMAT_INVALID');
    }
  }
};

const validateStrSchema = (schema: any): void => {
  validateTType(schema, 'str');
  const {min, max, ascii, noJsonEscape, format} = schema;

  validateMinMax(min, max);

  if (ascii !== undefined) {
    if (typeof ascii !== 'boolean') throw new Error('ASCII');
  }
  if (noJsonEscape !== undefined) {
    if (typeof noJsonEscape !== 'boolean') throw new Error('NO_JSON_ESCAPE_TYPE');
  }
  if (format !== undefined) {
    if (format !== 'ascii' && format !== 'utf8') {
      throw new Error('INVALID_STRING_FORMAT');
    }
    // If both format and ascii are specified, they should be consistent
    if (ascii !== undefined && format === 'ascii' && !ascii) {
      throw new Error('FORMAT_ASCII_MISMATCH');
    }
  }
};

const binaryFormats = new Set(['bencode', 'bson', 'cbor', 'ion', 'json', 'msgpack', 'resp3', 'ubjson']);

const validateBinSchema = (schema: any): void => {
  validateTType(schema, 'bin');
  const {min, max, format} = schema;
  validateMinMax(min, max);
  if (format !== undefined) {
    if (!binaryFormats.has(format)) throw new Error('FORMAT');
  }
  validateSchema(schema.type);
};

const validateArrSchema = (schema: any): void => {
  validateTType(schema, 'arr');
  const {min, max} = schema;
  validateMinMax(min, max);
  if (!('head' in schema) && !('type' in schema) && !('tail' in schema)) throw new Error('EMPTY_ARR');
  if ('tail' in schema && !('type' in schema)) throw new Error('LONE_TAIL');
  const {head, type, tail} = schema;
  if (type) validateSchema(type);
  if (head) for (const h of head) validateSchema(h);
  if (tail) for (const t of tail) validateSchema(t);
};

const validateConSchema = (schema: any): void => {
  validateTType(schema, 'con');
};

const validateObjSchema = (schema: ObjSchema): void => {
  validateTType(schema, 'obj');
  const {keys, decodeUnknownKeys, encodeUnknownKeys} = schema;
  if (!Array.isArray(keys)) throw new Error('KEYS_TYPE');
  if (decodeUnknownKeys !== undefined && typeof decodeUnknownKeys !== 'boolean')
    throw new Error('DECODE_UNKNOWN_KEYS_TYPE');
  if (encodeUnknownKeys !== undefined && typeof encodeUnknownKeys !== 'boolean')
    throw new Error('ENCODE_UNKNOWN_KEYS_TYPE');
  for (const key of keys) validateSchema(key);
};

const validateKeySchema = (schema: any): void => {
  validateTType(schema, 'key');
  const {key, optional} = schema;
  if (typeof key !== 'string') throw new Error('KEY_TYPE');
  if (optional !== undefined && typeof optional !== 'boolean') throw new Error('OPTIONAL_TYPE');
  validateSchema(schema.value);
};

const validateMapSchema = (schema: any): void => {
  validateTType(schema, 'map');
  validateSchema(schema.value);
  if (schema.key) {
    validateSchema(schema.key);
  }
};

const validateRefSchema = (schema: any): void => {
  validateTType(schema, 'ref');
  const {ref} = schema;
  if (typeof ref !== 'string') throw new Error('REF_TYPE');
  if (!ref) throw new Error('REF_EMPTY');
};

const validateOrSchema = (schema: any): void => {
  validateTType(schema, 'or');
  const {types, discriminator} = schema;
  if (!discriminator || (discriminator[0] === 'num' && discriminator[1] === -1)) throw new Error('DISCRIMINATOR');
  if (!Array.isArray(types)) throw new Error('TYPES_TYPE');
  if (!types.length) throw new Error('TYPES_LENGTH');
  for (const type of types) validateSchema(type);
};

const validateFunctionSchema = (schema: any): void => {
  validateTType(schema, 'fn');
  validateSchema(schema.req);
  validateSchema(schema.res);
};

const validateFunctionStreamingSchema = (schema: any): void => {
  validateTType(schema, 'fn$');
  validateSchema(schema.req);
  validateSchema(schema.res);
};

/**
 * Main router function that validates a schema based on its kind.
 * This replaces the individual validateSchema() methods from type classes.
 */
export const validateSchema = (schema: Schema): void => {
  if (typeof schema !== 'object') throw new Error('INVALID_SCHEMA');
  switch (schema.kind) {
    case 'any':
      validateAnySchema(schema);
      break;
    case 'bool':
      validateBoolSchema(schema);
      break;
    case 'num':
      validateNumSchema(schema);
      break;
    case 'str':
      validateStrSchema(schema);
      break;
    case 'bin':
      validateBinSchema(schema);
      break;
    case 'arr':
      validateArrSchema(schema);
      break;
    case 'con':
      validateConSchema(schema);
      break;
    case 'obj':
      validateObjSchema(schema);
      break;
    case 'key':
      validateKeySchema(schema);
      break;
    case 'map':
      validateMapSchema(schema);
      break;
    case 'ref':
      validateRefSchema(schema);
      break;
    case 'or':
      validateOrSchema(schema);
      break;
    case 'fn':
      validateFunctionSchema(schema);
      break;
    case 'fn$':
      validateFunctionStreamingSchema(schema);
      break;
    default:
      throw new Error(`Unknown schema kind: ${(schema as any).kind}`);
  }
};
