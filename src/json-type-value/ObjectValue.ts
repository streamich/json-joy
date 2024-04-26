import {Value} from './Value';
import {toText} from '../json-type/typescript/toText';
import {TypeSystem} from '../json-type/system/TypeSystem';
import {printTree} from 'sonic-forest/lib/print/printTree';
import type {ResolveType} from '../json-type';
import type * as classes from '../json-type/type';
import type * as ts from '../json-type/typescript/types';
import type {TypeBuilder} from '../json-type/type/TypeBuilder';
import type {Printable} from 'sonic-forest/lib/print/types';

export type UnObjectType<T> = T extends classes.ObjectType<infer U> ? U : never;
export type UnObjectValue<T> = T extends ObjectValue<infer U> ? U : never;
export type UnObjectFieldTypeVal<T> = T extends classes.ObjectFieldType<any, infer U> ? U : never;
export type ObjectFieldToTuple<F> = F extends classes.ObjectFieldType<infer K, infer V> ? [K, V] : never;
export type ToObject<T> = T extends [string, unknown][] ? {[K in T[number] as K[0]]: K[1]} : never;
export type ObjectValueToTypeMap<F> = ToObject<{[K in keyof F]: ObjectFieldToTuple<F[K]>}>;
export type TuplesToFields<T> = T extends PropDefinition<infer K, infer V>[] ? classes.ObjectFieldType<K, V>[] : never;

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

type PropDefinition<K extends string, V extends classes.Type> = [key: K, val: V, data: ResolveType<V>];
type PropDef = <K extends string, V extends classes.Type>(key: K, val: V, data: ResolveType<V>) => PropDefinition<K, V>;

export class ObjectValue<T extends classes.ObjectType<any>> extends Value<T> implements Printable {
  public static create = (system: TypeSystem = new TypeSystem()) => new ObjectValue(system.t.obj, {});

  public get system(): TypeSystem {
    return (this.type as T).getSystem();
  }

  public get t(): TypeBuilder {
    return this.system.t;
  }

  public keys(): string[] {
    const type = this.type as T;
    return type.fields.map((field: classes.ObjectFieldType<string, any>) => field.key);
  }

  public get<K extends keyof ObjectValueToTypeMap<UnObjectType<T>>>(
    key: K,
  ): Value<
    ObjectValueToTypeMap<UnObjectType<T>>[K] extends classes.Type
      ? ObjectValueToTypeMap<UnObjectType<T>>[K]
      : classes.Type
  > {
    const field = this.type.getField(<string>key);
    if (!field) throw new Error('NO_FIELD');
    const type = field.value;
    const data = this.data[<string>key];
    return new Value(type, data) as any;
  }

  public field<F extends classes.ObjectFieldType<any, any>>(
    field: F | ((t: TypeBuilder) => F),
    data: ResolveType<UnObjectFieldTypeVal<F>>,
  ): ObjectValue<classes.ObjectType<[...UnObjectType<T>, F]>> {
    field = typeof field === 'function' ? field((this.type as classes.ObjectType<any>).getSystem().t) : field;
    const extendedData = {...this.data, [field.key]: data};
    const type = this.type;
    const system = type.system;
    if (!system) throw new Error('NO_SYSTEM');
    const extendedType = system.t.Object(...type.fields, field);
    return new ObjectValue(extendedType, extendedData as any) as any;
  }

  public prop<K extends string, V extends classes.Type>(
    key: K,
    type: V | ((t: TypeBuilder) => V),
    data: ResolveType<V>,
  ) {
    const system = (this.type as classes.ObjectType<any>).getSystem();
    const t = system.t;
    type = typeof type === 'function' ? type(t) : type;
    return this.field(t.prop(key, type), data);
  }

  public merge<O extends ObjectValue<any>>(
    obj: O,
  ): ObjectValue<classes.ObjectType<[...UnObjectType<T>, ...UnObjectType<O['type']>]>> {
    const extendedData = {...this.data, ...obj.data};
    const type = this.type;
    const system = type.system;
    if (!system) throw new Error('NO_SYSTEM');
    const extendedType = system.t.Object(...type.fields, ...obj.type.fields);
    return new ObjectValue(extendedType, extendedData) as any;
  }

  public extend<R extends PropDefinition<any, any>[]>(
    inp: (t: TypeBuilder, prop: PropDef, system: TypeSystem) => R,
  ): ObjectValue<classes.ObjectType<[...UnObjectType<T>, ...TuplesToFields<R>]>> {
    const system = this.type.getSystem();
    const r: PropDef = (key, val, data) => [key, val, data];
    const extension = inp(system.t, r, system);
    const type = this.type;
    const extendedFields: classes.ObjectFieldType<any, any>[] = [...type.fields];
    const extendedData = {...this.data};
    for (const [key, val, data] of extension) {
      extendedFields.push(system.t.prop(key, val));
      extendedData[key] = data;
    }
    const extendedType = system.t.Object(...extendedFields);
    return new ObjectValue(extendedType, <any>extendedData) as any;
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

  public toString(tab: string = ''): string {
    return this.constructor.name + printTree(tab, [(tab) => this.type.toString(tab)]);
  }
}
