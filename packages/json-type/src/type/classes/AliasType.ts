import {printTree} from 'tree-dump/lib/printTree';
import type {Printable} from 'tree-dump/lib/types';
import type {Type} from '../../type';
import type {ModuleType} from './ModuleType';

export class AliasType<K extends string, T extends Type> implements Printable {
  public constructor(
    public readonly system: ModuleType,
    public readonly id: K,
    public readonly type: T,
  ) {}

  public getType(): Type {
    return this.type;
  }

  public resolve(): AliasType<string, Type> {
    return this.system.resolve(this.id);
  }

  public toString(tab: string = '') {
    return this.id + printTree(tab, [(tab) => this.type.toString(tab)]);
  }
}
