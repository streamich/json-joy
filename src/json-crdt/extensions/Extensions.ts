import {printTree} from 'tree-dump/lib/printTree';
import type {AnyExtension} from './Extension';
import type {Printable} from 'tree-dump/lib/types';

export class Extensions implements Printable {
  protected readonly ext: Record<number, AnyExtension> = {};

  public register(extension: AnyExtension) {
    this.ext[extension.id] = extension;
  }

  public get(id: number): AnyExtension | undefined {
    return this.ext[id];
  }

  public size(): number {
    return Object.keys(this.ext).length;
  }

  public clone(): Extensions {
    const clone = new Extensions();
    for (const ext of Object.values(this.ext)) clone.register(ext);
    return clone;
  }

  public toString(tab: string = ''): string {
    const keys = Object.keys(this.ext)
      .map((k) => +k)
      .sort();
    return (
      'extensions' +
      printTree(
        tab,
        keys.map((k) => (tab) => `${k}: ${this.ext[k].name}`),
      )
    );
  }
}
