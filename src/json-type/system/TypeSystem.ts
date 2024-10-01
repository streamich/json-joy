import {TypeAlias} from './TypeAlias';
import {TypeBuilder} from '../type/TypeBuilder';
import {RefType} from '../type/classes';
import {printTree} from 'tree-dump/lib/printTree';
import type {CustomValidator} from './types';
import type {Type, TypeMap} from '../type';
import type {Printable} from 'tree-dump/lib/types';

export class TypeSystem implements Printable {
  public readonly t = new TypeBuilder(this);

  public readonly aliases: Map<string, TypeAlias<string, any>> = new Map();

  /**
   * @todo Add ability fetch object of given type by its ID, analogous to
   * GraphQL "nodes".
   */
  public readonly alias = <K extends string, T extends Type>(id: K, type: T): TypeAlias<K, T> => {
    const existingAlias = this.aliases.get(id);
    if (existingAlias) return existingAlias as TypeAlias<K, T>;
    const alias = new TypeAlias<K, T>(this, id, type);
    this.aliases.set(id, alias);
    return alias;
  };

  public readonly unalias = <K extends string>(id: K): TypeAlias<K, Type> => {
    const alias = this.aliases.get(id);
    if (!alias) throw new Error(`Alias [id = ${id}] not found.`);
    return <TypeAlias<K, Type>>alias;
  };

  public readonly hasAlias = (id: string): boolean => this.aliases.has(id);

  public readonly resolve = <K extends string>(id: K): TypeAlias<K, Type> => {
    const alias = this.unalias(id);
    return alias.type instanceof RefType ? this.resolve<K>(alias.type.getRef() as K) : alias;
  };

  protected readonly customValidators: Map<string, CustomValidator> = new Map();

  public readonly addCustomValidator = (validator: CustomValidator): void => {
    if (this.customValidators.has(validator.name))
      throw new Error(`Validator [name = ${validator.name}] already exists.`);
    this.customValidators.set(validator.name, validator);
  };

  public readonly getCustomValidator = (name: string): CustomValidator => {
    const validator = this.customValidators.get(name);
    if (!validator) throw new Error(`Validator [name = ${name}] not found.`);
    return validator;
  };

  public exportTypes() {
    const result: Record<string, unknown> = {};
    for (const [id, alias] of this.aliases.entries()) {
      result[id] = alias.getType().getSchema();
    }
    return result;
  }

  public importTypes<A extends TypeMap>(
    types: A,
  ): {
    readonly [K in keyof A]: TypeAlias<
      K extends string ? K : never,
      /** @todo Replace `any` by inferred type here. */ any
    >;
  } {
    const result = {} as any;
    for (const id in types) result[id] = this.alias(id, this.t.import(types[id]));
    return result;
  }

  public toString(tab: string = '') {
    const nl = () => '';
    return (
      'TypeSystem' +
      printTree(tab, [
        (tab) =>
          'aliases' +
          printTree(
            tab,
            [...this.aliases.values()].map((alias) => (tab) => alias.toString(tab)),
          ),
        this.customValidators.size ? nl : null,
        (tab) =>
          'validators' +
          printTree(
            tab,
            [...this.customValidators.keys()].map((validator) => (tab) => `"${validator}"`),
          ),
      ])
    );
  }
}
