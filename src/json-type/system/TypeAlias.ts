import {printTree} from '../../util/print/printTree';
import {ObjectType} from '../type/classes';
import {toText} from '../typescript/toText';
import {JsonSchemaGenericKeywords, JsonSchemaValueNode} from '../../json-schema';
import {TypeExportContext} from './TypeExportContext';
import type {TypeSystem} from '.';
import type {Type} from '../type';
import type {Printable} from '../../util/print/types';
import type * as ts from '../typescript/types';

export class TypeAlias<K extends string, T extends Type> implements Printable {
  public constructor(public readonly system: TypeSystem, public readonly id: K, public readonly type: T) {}

  public getType(): Type {
    return this.type;
  }

  public resolve(): TypeAlias<string, Type> {
    return this.system.resolve(this.id);
  }

  public toString(tab: string = '') {
    return this.id + printTree(tab, [(tab) => this.type.toString(tab)]);
  }

  public toTypeScriptAst(): ts.TsInterfaceDeclaration | ts.TsTypeAliasDeclaration {
    const type = this.type;
    if (type instanceof ObjectType) {
      const ast = this.type.toTypeScriptAst() as ts.TsTypeLiteral;
      const node: ts.TsInterfaceDeclaration = {
        node: 'InterfaceDeclaration',
        name: this.id,
        members: ast.members,
      };
      return node;
    } else {
      const node: ts.TsTypeAliasDeclaration = {
        node: 'TypeAliasDeclaration',
        name: this.id,
        type: type.toTypeScriptAst(),
      };
      // TODO: Figure out if this is still needed, and possibly bring it back.
      // augmentWithComment(type, node);
      return node;
    }
  }

  public toTypeScript(): string {
    return toText(this.toTypeScriptAst());
  }

  public toJsonSchema(): JsonSchemaGenericKeywords {
    const node: JsonSchemaGenericKeywords = {
      $id: this.id,
      $ref: '#/$defs/' + this.id,
      $defs: {},
    };
    const ctx = new TypeExportContext();
    ctx.visitRef(this.id);
    node.$defs![this.id] = this.type.toJsonSchema(ctx) as JsonSchemaValueNode;
    let ref: string | undefined;
    while ((ref = ctx.nextMentionedRef())) {
      ctx.visitRef(ref);
      node.$defs![ref] = this.system.resolve(ref).type.toJsonSchema(ctx) as JsonSchemaValueNode;
    }
    return node;
  }
}
