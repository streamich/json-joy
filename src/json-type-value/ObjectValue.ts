import {Value} from './Value';
import {toText} from '../json-type/typescript/toText';
import type {ResolveType} from '../json-type';
import type * as classes from '../json-type/type';
import type * as ts from '../json-type/typescript/types';

type UnObjectType<T> = T extends classes.ObjectType<infer U> ? U : never;
type UnObjectFieldTypeVal<T> = T extends classes.ObjectFieldType<any, infer U> ? U : never;

// export type MergeObjectsTypes<A, B> =
//   A extends classes.ObjectType<infer A2>
//     ? B extends classes.ObjectType<infer B2>
//       ? classes.ObjectType<[...A2, ...B2]> :
//     never :
//   never;

// export type MergeObjectValues<A, B> =
//   A extends ObjectValue<infer A2>
//     ? B extends ObjectValue<infer B2>
//       ? ObjectValue<MergeObjectsTypes<A2, B2>> :
//     never :
//   never;

export class ObjectValue<T extends classes.ObjectType<any>> extends Value<T> {
  public field<F extends classes.ObjectFieldType<any, any>>(field: F, data: ResolveType<UnObjectFieldTypeVal<F>>): ObjectValue<classes.ObjectType<[...UnObjectType<T>, F]>> {
    const extendedData = {...this.data, [field.key]: data};
    const type = this.type;
    const system = type.system;
    if (!system) throw new Error('NO_SYSTEM');
    const extendedType = system.t.Object(...type.fields, field);
    return new ObjectValue(extendedType, extendedData) as any;
  }

  public prop<K extends string, V extends classes.Type>(key: K, type: V, data: ResolveType<V>) {
    const system = type.system;
    if (!system) throw new Error('NO_SYSTEM');
    return this.field(system.t.prop(key, type), data);
  }

  public merge<O extends ObjectValue<any>>(obj: O): ObjectValue<classes.ObjectType<[...UnObjectType<T>, ...UnObjectType<O['type']>]>> {
    const extendedData = {...this.data, ...obj.data};
    const type = this.type;
    const system = type.system;
    if (!system) throw new Error('NO_SYSTEM');
    const extendedType = system.t.Object(...type.fields, ...obj.type.fields);
    return new ObjectValue(extendedType, extendedData) as any;
  }

  public toTypeScriptAst(): ts.TsTypeLiteral {
    const node: ts.TsTypeLiteral = {
      node: 'TypeLiteral',
      members: [],
    };
    const data = this.data as Record<string, classes.Type>;
    for (const [name, type] of Object.entries(data)) {
      const schema = type.getSchema();
      const property: ts.TsPropertySignature = {
        node: 'PropertySignature',
        name,
        type: type.toTypeScriptAst(),
      };
      if (schema.title) property.comment = schema.title;
      node.members.push(property);
    }
    return node;
  }

  public toTypeScriptModuleAst(): ts.TsModuleDeclaration {
    const node: ts.TsModuleDeclaration = {
      node: 'ModuleDeclaration',
      name: 'Router',
      export: true,
      statements: [
        {
          node: 'TypeAliasDeclaration',
          name: 'Routes',
          type: this.toTypeScriptAst(),
          export: true,
        },
      ],
    };
    const system = this.type.system;
    if (!system) throw new Error('system is undefined');
    for (const alias of system.aliases.values()) node.statements.push({...alias.toTypeScriptAst(), export: true});
    return node;
  }

  public toTypeScript(): string {
    return toText(this.toTypeScriptModuleAst());
  }
}
