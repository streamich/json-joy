import {TAnyType, TNumber, TType} from "../json-type";
import {JsonSchemaAny, JsonSchemaArray, JsonSchemaBoolean, JsonSchemaNode, JsonSchemaNull, JsonSchemaNumber, JsonSchemaObject, JsonSchemaString} from "./types";

const UINTS: TNumber['format'][] = ['u', 'u8', 'u16', 'u32', 'u64'];
const INTS: TNumber['format'][] = ['i', 'i8', 'i16', 'i32', 'i64', ...UINTS];

const augmentNode = (type: TType, node: JsonSchemaNode) => {
  if (type.title) node.title = type.title;
  if (type.description) node.description = type.description;
  if (type.examples) node.examples = type.examples.map(example => example.value);
};

export const toJsonSchema = (type: TAnyType): JsonSchemaNode => {
  switch (type.__t) {
    case 'str': {
      const node: JsonSchemaString = {type: 'string'};
      if (type.const) node.const = type.const;
      augmentNode(type, node);
      return node;
    }
    case 'num': {
      const node: JsonSchemaNumber = {
        type: 'number',
      };
      if (type.format)
        if (INTS.indexOf(type.format) > -1) node.type = 'integer';
      if (type.const) node.const = type.const;
      augmentNode(type, node);
      return node;
    }
    case 'bool': {
      const node: JsonSchemaBoolean = {
        type: 'boolean',
      };
      if (type.const) node.const = type.const;
      augmentNode(type, node);
      return node;
    }
    case 'nil': {
      const node: JsonSchemaNull = {
        type: 'null',
      };
      augmentNode(type, node);
      return node;
    }
    case 'arr': {
      const node: JsonSchemaArray = {
        type: 'array',
        items: toJsonSchema(type.type as TAnyType),
      };
      if (type.const) node.const = type.const;
      augmentNode(type, node);
      return node;
    }
    case 'obj': {
      const node: JsonSchemaObject = {
        type: 'object',
        properties: {},
      };
      const required = [];
      for (const field of type.fields) {
        node.properties![field.key] = toJsonSchema(field.type as TAnyType);
        if (field.isOptional === undefined || !field.isOptional) required.push(field.key);
      }
      if (required.length) (node as any).required = required;
      augmentNode(type, node);
      return node;
    }
    case 'any':
    default: {
      const node: JsonSchemaAny = {
        type: ['string', 'number', 'boolean', 'null', 'array', 'object'],
      };
      augmentNode(type, node);
      return node;
    }
  }
};
