import {TAnyType} from "../json-type";
import {TsDeclaration, TsStringKeyword, TsNumberKeyword, TsBooleanKeyword, TsAnyKeyword, TsTypeAliasDeclaration, TsType, TsInterfaceDeclaration, TsPropertySignature, TsTypeReference, TsModuleDeclaration} from "./types";

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

export const exportDeclaration = (ref: string, ctx: ToTypeScriptAstContext): void => {
  const identifier = parseIdentifier(ref);
  let module: TsModuleDeclaration = {
    node: 'ModuleDeclaration',
    name: '',
    statements: ctx.statements,
  };
  for (const namespace of identifier.namespaces) {
    let innerModule: TsModuleDeclaration = ctx.statements.find(s => s.node === 'ModuleDeclaration' && s.name === namespace) as TsModuleDeclaration;
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
  const type = ctx.ref(ref);
  switch(type.__t) {
    case 'nil':
    case 'bool':
    case 'num':
    case 'str': {
      const node: TsTypeAliasDeclaration = {
        node: 'TypeAliasDeclaration',
        name: ref,
        type: toTypeScriptAst(type, ctx) as TsType,
      };
      module.statements.push(node);
      return;
    }
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
          type: toTypeScriptAst(field.type as TAnyType, ctx),
        };
        node.members.push(member);
      }
      return;
    }
  }
};

/**
 * Converts JSON Type to TypeScript AST.
 * 
 * This function is idempotent, if the output is already available
 * in the resulting AST, it will not generate it again.
 */
export const toTypeScriptAst = (type: TAnyType, ctx: ToTypeScriptAstContext): TsType => {
  switch(type.__t) {
    case 'str': {
      const node: TsStringKeyword = {node: 'StringKeyword'};
      return node;
    }
    case 'num': {
      const node: TsNumberKeyword = {node: 'NumberKeyword'};
      return node;
    }
    case 'bool': {
      const node: TsBooleanKeyword = {node: 'BooleanKeyword'};
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
      const node: TsAnyKeyword = {node: 'AnyKeyword'};
      return node;
    }
  }
};
