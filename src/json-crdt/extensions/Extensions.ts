import {printTree} from '../../util/print/printTree';
import {Printable} from '../../util/print/types';
import {ExtensionDefinition} from './types';

export class Extensions implements Printable {
  protected readonly ext: Record<number, ExtensionDefinition> = {};

  public register(extension: ExtensionDefinition<any, any, any, any>) {
    this.ext[extension.id] = extension;
  }

  public get(id: number): ExtensionDefinition | undefined {
    return this.ext[id];
  }

  public size(): number {
    return Object.keys(this.ext).length;
  }

  public toString(tab: string = ''): string {
    const keys = Object.keys(this.ext)
      .map((k) => +k)
      .sort();
    return (
      this.constructor.name +
      printTree(
        tab,
        keys.map((k) => (tab) => `${k}: ${this.ext[k].Node.name}`),
      )
    );
  }
}
