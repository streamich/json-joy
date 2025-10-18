import {printTree} from 'tree-dump/lib/printTree';
import {Walker} from '../../../schema/Walker';
import {TypeBuilder} from '../../TypeBuilder';
import {AliasType} from '../AliasType';
import type {Printable} from 'tree-dump/lib/types';
import type {KeySchema, ModuleSchema, ObjSchema, Schema, TypeMap} from '../../../schema';
import type {Type} from '../../../type';
import type {RefType} from '../RefType';

export class ModuleType implements Printable {
  public static readonly from = (module: ModuleSchema): ModuleType => {
    const type = new ModuleType();
    type.import(module);
    return type;
  };

  public readonly t = new TypeBuilder(this);

  public readonly aliases: Map<string, AliasType<string, any>> = new Map();

  /**
   * @todo Add ability fetch object of given type by its ID, analogous to
   * GraphQL "nodes".
   */
  public readonly alias = <K extends string, T extends Type>(id: K, type: T): AliasType<K, T> => {
    const existingAlias = this.aliases.get(id);
    if (existingAlias) return existingAlias as AliasType<K, T>;
    const alias = new AliasType<K, T>(this, id, type);
    this.aliases.set(id, alias);
    return alias;
  };

  public readonly unalias = <K extends string>(id: K): AliasType<K, Type> => {
    const alias = this.aliases.get(id);
    if (!alias) throw new Error(`Alias [id = ${id}] not found.`);
    return <AliasType<K, Type>>alias;
  };

  public readonly hasAlias = (id: string): boolean => this.aliases.has(id);

  public readonly resolve = <K extends string>(id: K): AliasType<K, Type> => {
    const alias = this.unalias(id);
    return alias.type.kind() === 'ref' ? this.resolve<K>((alias.type as RefType).ref() as K) : alias;
  };

  public exportTypes() {
    const result: Record<string, unknown> = {};
    for (const [id, alias] of this.aliases.entries()) {
      result[id] = alias.getType().getSchema();
    }
    return result;
  }

  public import(module: ModuleSchema): void {
    const map: TypeMap = {};
    for (const alias of module.keys) {
      map[alias.key] = alias.value as Schema;
    }
    const expandObjFields = (aliasOfObj: string | ObjSchema): KeySchema[] => {
      const obj = typeof aliasOfObj === 'string' ? (map[aliasOfObj] as ObjSchema) : aliasOfObj;
      if (!obj || obj.kind !== 'obj') throw new Error('NO_OBJ');
      if (obj.extends) {
        const uniqueFields: Map<string, KeySchema> = new Map();
        for (const parent of obj.extends) {
          const parentFields = expandObjFields(parent);
          for (const field of parentFields) uniqueFields.set(field.key, field);
        }
        delete obj.extends;
        for (const field of obj.keys) uniqueFields.set(field.key, field);
        obj.keys = [...uniqueFields.values()];
      }
      return obj.keys;
    };
    Walker.walk(module, {
      onType: (type) => {
        if (type.kind !== 'obj') return;
        if (type.extends) expandObjFields(type);
      },
    });
    this.importTypes(map);
  }

  public importTypes<Aliases extends TypeMap>(
    aliases: Aliases,
  ): {
    readonly [K in keyof Aliases]: AliasType<
      K extends string ? K : never,
      /** @todo Replace `any` by inferred type here. */ any
    >;
  } {
    const result = {} as any;
    for (const id in aliases) result[id] = this.alias(id, this.t.import(aliases[id]));
    return result;
  }

  public toString(tab: string = '') {
    return (
      'Module' +
      printTree(tab, [
        (tab) =>
          'aliases' +
          printTree(
            tab,
            [...this.aliases.values()].map((alias) => (tab) => alias.toString(tab)),
          ),
      ])
    );
  }
}
