import type * as schema from '../schema';
import {type ArrType, type FnRxType, type FnType, type MapType, ObjType, type OrType} from '../type/classes';
import type {AliasType} from '../type/classes/AliasType';
import type {Type} from '../type/types';
import type * as ts from './types';

const augmentWithComment = (
  type: schema.Schema | schema.KeySchema,
  node: ts.TsDeclaration | ts.TsPropertySignature | ts.TsTypeLiteral,
) => {
  if (type.title || type.description) {
    let comment = '';
    if (type.title) comment += '# ' + type.title;
    if (type.title && type.description) comment += '\n\n';
    if (type.description) comment += type.description;
    node.comment = comment;
  }
};

/**
 * Main router function that converts any Schema to TypeScript AST.
 * Uses a switch statement to route to the appropriate converter logic.
 */
export function toTypeScriptAst(type: Type): ts.TsType {
  const typeName = type.kind();

  switch (typeName) {
    case 'any': {
      const node: ts.TsAnyKeyword = {node: 'AnyKeyword'};
      return node;
    }
    case 'bool': {
      const node: ts.TsBooleanKeyword = {node: 'BooleanKeyword'};
      return node;
    }
    case 'con': {
      const constSchema = type.getSchema() as schema.ConSchema;
      const value = constSchema.value;
      const valueType = typeof value;
      switch (valueType) {
        case 'boolean': {
          if (value === true) {
            const node: ts.TsTrueKeyword = {node: 'TrueKeyword'};
            return node;
          } else {
            const node: ts.TsFalseKeyword = {node: 'FalseKeyword'};
            return node;
          }
        }
        case 'string': {
          const node: ts.TsStringLiteral = {
            node: 'StringLiteral',
            text: value as string,
          };
          return node;
        }
        case 'number': {
          const node: ts.TsNumericLiteral = {
            node: 'NumericLiteral',
            text: String(value),
          };
          return node;
        }
        case 'object': {
          if (value === null) {
            const node: ts.TsNullKeyword = {node: 'NullKeyword'};
            return node;
          }
          // For complex objects, fallback to object keyword
          const node: ts.TsObjectKeyword = {node: 'ObjectKeyword'};
          return node;
        }
      }
      // Fallback for other value types
      const node: ts.TsObjectKeyword = {node: 'ObjectKeyword'};
      return node;
    }
    case 'num': {
      const node: ts.TsNumberKeyword = {node: 'NumberKeyword'};
      return node;
    }
    case 'str': {
      const node: ts.TsStringKeyword = {node: 'StringKeyword'};
      return node;
    }
    case 'bin': {
      const node: ts.TsGenericTypeAnnotation = {
        node: 'GenericTypeAnnotation',
        id: {
          node: 'Identifier',
          name: 'Uint8Array',
        },
      };
      return node;
    }
    case 'arr': {
      const arr = type as ArrType;
      const {_head = [], _type, _tail = []} = arr;
      if (_head.length || _tail.length) {
        const node: ts.TsTupleType = {
          node: 'TupleType',
          elements: [],
        };
        for (const headType of _head) {
          node.elements.push(toTypeScriptAst(headType) as ts.TsType);
        }
        if (_type) {
          const rest: ts.RestType = {
            node: 'RestType',
            type: {
              node: 'ArrType',
              elementType: toTypeScriptAst(_type) as ts.TsType,
            } as ts.TsArrType,
          };
          node.elements.push(rest);
        }
        for (const tailType of _tail) {
          node.elements.push(toTypeScriptAst(tailType) as ts.TsType);
        }
        return node;
      }
      const node: ts.TsArrType = {
        node: 'ArrType',
        elementType: toTypeScriptAst(arr._type) as ts.TsType,
      };
      return node;
    }
    case 'obj': {
      const obj = type as ObjType<any>;
      const objSchema = type.getSchema() as schema.ObjSchema;
      const node: ts.TsTypeLiteral = {
        node: 'TypeLiteral',
        members: [],
      };

      // Handle fields
      if (obj.keys && obj.keys.length > 0) {
        for (const field of obj.keys) {
          const member: ts.TsPropertySignature = {
            node: 'PropertySignature',
            name: field.key,
            type: toTypeScriptAst(field.val) as ts.TsType,
          };
          if (field.optional === true) {
            member.optional = true;
          }
          // Add comment using the same logic as the original augmentWithComment
          const fieldSchema = field.schema;
          if (fieldSchema.title || fieldSchema.description) {
            let comment = '';
            if (fieldSchema.title) comment += '# ' + fieldSchema.title;
            if (fieldSchema.title && fieldSchema.description) comment += '\n\n';
            if (fieldSchema.description) comment += fieldSchema.description;
            member.comment = comment;
          }
          node.members.push(member);
        }
      }

      // Handle unknown/additional fields
      if (objSchema.decodeUnknownKeys || (objSchema as any).encodeUnknownKeys) {
        node.members.push({
          node: 'IndexSignature',
          type: {node: 'UnknownKeyword'},
        });
      }

      // Add comment to the type literal itself using the same logic as augmentWithComment
      augmentWithComment(objSchema, node);

      return node;
    }
    case 'map': {
      const map = type as MapType;
      const node: ts.TsTypeReference = {
        node: 'TypeReference',
        typeName: 'Record',
        typeArguments: [{node: 'StringKeyword'}, toTypeScriptAst(map._value)],
      };
      return node;
    }
    case 'or': {
      const or = type as OrType;
      const node: ts.TsUnionType = {
        node: 'UnionType',
        types: or.types.map((type: any) => toTypeScriptAst(type)),
      };
      return node;
    }
    case 'ref': {
      const refSchema = type.getSchema();
      const node: ts.TsGenericTypeAnnotation = {
        node: 'GenericTypeAnnotation',
        id: {
          node: 'Identifier',
          name: refSchema.ref,
        },
      };
      return node;
    }
    case 'fn': {
      const fn = type as FnType<any, any>;
      const node: ts.TsFnType = {
        node: 'FnType',
        parameters: [
          {
            node: 'Parameter',
            name: {
              node: 'Identifier',
              name: 'request',
            },
            type: toTypeScriptAst(fn.req),
          },
        ],
        type: {
          node: 'TypeReference',
          typeName: {
            node: 'Identifier',
            name: 'Promise',
          },
          typeArguments: [toTypeScriptAst(fn.res)],
        },
      };
      return node;
    }
    case 'fn$': {
      const fn = type as FnRxType<any, any>;
      const node: ts.TsFnType = {
        node: 'FnType',
        parameters: [
          {
            node: 'Parameter',
            name: {
              node: 'Identifier',
              name: 'request$',
            },
            type: {
              node: 'TypeReference',
              typeName: {
                node: 'Identifier',
                name: 'Observable',
              },
              typeArguments: [toTypeScriptAst(fn.req)],
            },
          },
        ],
        type: {
          node: 'TypeReference',
          typeName: {
            node: 'Identifier',
            name: 'Observable',
          },
          typeArguments: [toTypeScriptAst(fn.res)],
        },
      };
      return node;
    }
    default: {
      // Fallback for unknown types
      const node: ts.TsUnknownKeyword = {node: 'UnknownKeyword'};
      return node;
    }
  }
}

export const aliasToTs = (alias: AliasType<any, any>): ts.TsInterfaceDeclaration | ts.TsTypeAliasDeclaration => {
  const type = alias.type;
  if (type instanceof ObjType) {
    const ast = toTypeScriptAst(type) as ts.TsTypeLiteral;
    const node: ts.TsInterfaceDeclaration = {
      node: 'InterfaceDeclaration',
      name: alias.id,
      members: ast.members,
    };
    return node;
  } else {
    const node: ts.TsTypeAliasDeclaration = {
      node: 'TypeAliasDeclaration',
      name: alias.id,
      type: toTypeScriptAst(type),
    };
    // TODO: Figure out if this is still needed, and possibly bring it back.
    // augmentWithComment(type, node);
    return node;
  }
};

export const objToModule = (obj: ObjType<any>): ts.TsModuleDeclaration => {
  const node: ts.TsModuleDeclaration = {
    node: 'ModuleDeclaration',
    name: 'Router',
    export: true,
    statements: [
      {
        node: 'TypeAliasDeclaration',
        name: 'Routes',
        type: toTypeScriptAst(obj),
        export: true,
      },
    ],
  };
  const system = obj.system;
  if (!system) throw new Error('system is undefined');
  for (const alias of system.aliases.values()) node.statements.push({...aliasToTs(alias.type), export: true});
  return node;
};
