import {type ArrType, KeyOptType, type ObjType, type RefType, type Type} from '../type';
import type * as jtd from './types';

const NUMS_TYPE_MAPPING = new Map<string, jtd.JtdType>([
  ['u8', 'uint8'],
  ['u16', 'uint16'],
  ['u32', 'uint32'],
  ['i8', 'int8'],
  ['i16', 'int16'],
  ['i32', 'int32'],
  ['f32', 'float32'],
]);

/**
 * Main router function that converts any Schema to JTD form.
 * Uses a switch statement to route to the appropriate converter logic.
 */
export function toJtdForm(type: Type): jtd.JtdForm {
  const typeName = type.kind();

  switch (typeName) {
    case 'any': {
      const form: jtd.JtdEmptyForm = {nullable: true};
      return form;
    }
    case 'bool': {
      const form: jtd.JtdTypeForm = {type: 'boolean'};
      return form;
    }
    case 'con': {
      const constSchema = type.getSchema();
      const value = constSchema.value;
      const valueType = typeof value;
      switch (valueType) {
        case 'boolean':
        case 'string':
          return {type: valueType};
        case 'number': {
          if (value !== Math.round(value)) return {type: 'float64'};
          if (value >= 0) {
            if (value <= 255) return {type: 'uint8'};
            if (value <= 65535) return {type: 'uint16'};
            if (value <= 4294967295) return {type: 'uint32'};
          } else {
            if (value >= -128) return {type: 'int8'};
            if (value >= -32768) return {type: 'int16'};
            if (value >= -2147483648) return {type: 'int32'};
          }
          return {type: 'float64'};
        }
      }
      const form: jtd.JtdEmptyForm = {nullable: false};
      return form;
    }
    case 'num': {
      const numSchema = type.getSchema();
      return {
        type: (NUMS_TYPE_MAPPING.get(numSchema.format || '') ?? 'float64') as jtd.JtdType,
      };
    }
    case 'str': {
      return {type: 'string'};
    }
    case 'arr': {
      const arr = type as ArrType;
      if (arr._type) {
        return {
          elements: toJtdForm(arr._type),
        };
      } else {
        return {nullable: true};
      }
    }
    case 'obj': {
      const obj = type as ObjType;
      const form: jtd.JtdPropertiesForm = {};

      if (obj.keys && obj.keys.length > 0) {
        form.properties = {};
        form.optionalProperties = {};

        for (const field of obj.keys) {
          const fieldName = field.key;
          const fieldType = field.val;

          if (fieldType) {
            const fieldJtd = toJtdForm(fieldType);
            // Check if field is optional
            if (field instanceof KeyOptType) {
              form.optionalProperties[fieldName] = fieldJtd;
            } else {
              form.properties[fieldName] = fieldJtd;
            }
          }
        }
      }

      // Handle additional properties - check the schema for unknownFields
      if (obj.schema.decodeUnknownKeys === false) {
        form.additionalProperties = false;
      }

      return form;
    }
    case 'map': {
      const mapSchema = type.getSchema();
      return {
        values: toJtdForm(mapSchema.value),
      };
    }
    case 'ref': {
      const ref = type as RefType;
      return {
        ref: ref.ref(),
      };
    }
    // case 'or':
    // case 'bin':
    // case 'fn':
    // case 'fn$':
    default: {
      const form: jtd.JtdEmptyForm = {nullable: false};
      return form;
    }
  }
}
