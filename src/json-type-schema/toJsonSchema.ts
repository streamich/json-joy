import {JsonSchemaRef} from '.';
import {TAnyType, TType} from '../json-type';
import {INTS} from '../json-type/util';
import {
  JsonSchemaAny,
  JsonSchemaArray,
  JsonSchemaBoolean,
  JsonSchemaValueNode,
  JsonSchemaNode,
  JsonSchemaNull,
  JsonSchemaNumber,
  JsonSchemaObject,
  JsonSchemaString,
} from './types';

const augmentNode = (type: TType, node: JsonSchemaValueNode) => {
  if (type.title) node.title = type.title;
  if (type.description) node.description = type.description;
  if (type.examples) node.examples = type.examples.map((example) => example.value);
};

export interface ToJsonSchemaContext {
  ref?: (id: string) => TAnyType;
  defs?: {[key: string]: JsonSchemaNode};
}

export const toJsonSchema = (type: TAnyType, ctx: ToJsonSchemaContext): JsonSchemaNode => {
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
      if (type.format) if (INTS.indexOf(type.format) > -1) node.type = 'integer';
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
        items: toJsonSchema(type.type as TAnyType, ctx),
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
        node.properties![field.key] = toJsonSchema(field.type as TAnyType, ctx);
        if (field.isOptional === undefined || !field.isOptional) required.push(field.key);
      }
      if (required.length) (node as any).required = required;
      augmentNode(type, node);
      return node;
    }
    case 'ref': {
      if (!ctx.ref) {
        const node: JsonSchemaRef = {$ref: '/' + type.ref};
        return node;
      } else if (ctx.defs) {
        const node: JsonSchemaRef = {$ref: '#/$defs/' + type.ref};
        if (!ctx.defs[type.ref]) ctx.defs[type.ref] = toJsonSchema(ctx.ref(type.ref), ctx);
        return node;
      }
      return toJsonSchema(ctx.ref(type.ref), ctx);
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
