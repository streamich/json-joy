import {TAnyType, TObjectField} from '../json-type';
import {
  TsArrayType,
  TsBooleanKeyword,
  TsDeclaration,
  TsFalseKeyword,
  TsInterfaceDeclaration,
  TsModuleDeclaration,
  TsNullKeyword,
  TsNumberKeyword,
  TsNumericLiteral,
  TsPropertySignature,
  TsStringKeyword,
  TsStringLiteral,
  TsTrueKeyword,
  TsType,
  TsTypeAliasDeclaration,
  TsTypeLiteral,
  TsTypeReference,
  TsUnionType,
  TsUnknownKeyword,
} from './types';

export interface ToTypeScriptAstContext {
  /**
   * Resolves a type reference.
   */
  ref: (id: string) => TAnyType;

  /**
   * This array is mutated an populated with new names types or interfaces.
   */
  statements: TsDeclaration[];
}

interface Identifier {
  name: string;
  namespaces: string[];
}

const parseIdentifier = (id: string): Identifier => {
  const parts = id.split('.');
  return {
    name: parts.pop()!,
    namespaces: parts,
  };
};

const augmentWithComment = (
  type: TAnyType | TObjectField,
  node: TsDeclaration | TsPropertySignature | TsTypeLiteral,
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
 * Converts JSON Type to TypeScript AST declarations.
 *
 * This function is idempotent, if a declaration already exists
 * in the resulting AST, it will not be generated again.
 */
export const exportDeclaration = (ref: string, ctx: ToTypeScriptAstContext): void => {
  const identifier = parseIdentifier(ref);
  let module: TsModuleDeclaration = {
    node: 'ModuleDeclaration',
    name: '',
    statements: ctx.statements,
  };
  for (const namespace of identifier.namespaces) {
    let innerModule: TsModuleDeclaration = module.statements.find(
      (s) => s.node === 'ModuleDeclaration' && s.name === namespace,
    ) as TsModuleDeclaration;
    if (!innerModule) {
      innerModule = {
        node: 'ModuleDeclaration',
        name: namespace,
        statements: [],
      };
      module.statements.push(innerModule);
    }
    module = innerModule;
  }
  const exists = module.statements.find((s) => s.name === identifier.name);
  if (exists) return;
  const type = ctx.ref(ref);
  switch (type.__t) {
    case 'obj': {
      const node: TsInterfaceDeclaration = {
        node: 'InterfaceDeclaration',
        name: identifier.name,
        members: [],
      };
      module.statements.push(node);
      for (const field of type.fields) {
        const member: TsPropertySignature = {
          node: 'PropertySignature',
          name: field.key,
          type: toTsType(field.type as TAnyType, ctx),
        };
        if (field.isOptional) member.optional = true;
        augmentWithComment(field, member);
        node.members.push(member);
      }
      if (type.unknownFields)
        node.members.push({
          node: 'IndexSignature',
          type: {node: 'UnknownKeyword'},
        });
      augmentWithComment(type, node);
      return;
    }
    default: {
      const node: TsTypeAliasDeclaration = {
        node: 'TypeAliasDeclaration',
        name: identifier.name,
        type: toTsType(type, ctx) as TsType,
      };
      augmentWithComment(type, node);
      module.statements.push(node);
      return;
    }
  }
};

const toTsType = (type: TAnyType, ctx: ToTypeScriptAstContext): TsType => {
  switch (type.__t) {
    case 'str': {
      const node: TsStringLiteral | TsStringKeyword =
        typeof type.const === 'string' ? {node: 'StringLiteral', text: type.const} : {node: 'StringKeyword'};
      return node;
    }
    case 'num': {
      const node: TsNumericLiteral | TsNumberKeyword =
        typeof type.const === 'number'
          ? {node: 'NumericLiteral', text: JSON.stringify(type.const)}
          : {node: 'NumberKeyword'};
      return node;
    }
    case 'bool': {
      const node: TsTrueKeyword | TsFalseKeyword | TsBooleanKeyword =
        typeof type.const === 'boolean'
          ? type.const
            ? {node: 'TrueKeyword'}
            : {node: 'FalseKeyword'}
          : {node: 'BooleanKeyword'};
      return node;
    }
    case 'nil': {
      const node: TsNullKeyword = {node: 'NullKeyword'};
      return node;
    }
    case 'arr': {
      const node: TsArrayType = {
        node: 'ArrayType',
        elementType: toTsType(type.type as TAnyType, ctx),
      };
      return node;
    }
    case 'obj': {
      const node: TsTypeLiteral = {
        node: 'TypeLiteral',
        members: [],
      };
      for (const field of type.fields) {
        const member: TsPropertySignature = {
          node: 'PropertySignature',
          name: field.key,
          type: toTsType(field.type as TAnyType, ctx),
        };
        if (field.isOptional) member.optional = true;
        augmentWithComment(field, member);
        node.members.push(member);
      }
      if (type.unknownFields)
        node.members.push({
          node: 'IndexSignature',
          type: {node: 'UnknownKeyword'},
        });
      augmentWithComment(type, node);
      return node;
    }
    case 'enum': {
      const node: TsUnionType = {
        node: 'UnionType',
        types: type.values.map(toTsLiteral),
      };
      return node;
    }
    case 'or': {
      const node: TsUnionType = {
        node: 'UnionType',
        types: type.types.map((t) => toTsType(t as TAnyType, ctx)),
      };
      return node;
    }
    case 'ref': {
      const node: TsTypeReference = {
        node: 'TypeReference',
        typeName: type.ref,
      };
      exportDeclaration(type.ref, ctx);
      return node;
    }
    default: {
      const node: TsUnknownKeyword = {node: 'UnknownKeyword'};
      return node;
    }
  }
};

const toTsLiteral = (value: string | number | boolean | null | unknown): TsType => {
  switch (typeof value) {
    case 'string': {
      const node: TsStringLiteral = {node: 'StringLiteral', text: value};
      return node;
    }
    case 'number': {
      const node: TsNumericLiteral = {node: 'NumericLiteral', text: value.toString()};
      return node;
    }
    case 'boolean': {
      const node: TsTrueKeyword | TsFalseKeyword = {node: value ? 'TrueKeyword' : 'FalseKeyword'};
      return node;
    }
    default: {
      const node: TsUnknownKeyword = {node: 'UnknownKeyword'};
      return node;
    }
  }
};
