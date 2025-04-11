import {printTree} from 'tree-dump/lib/printTree';
import {Block} from './Block';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {PeritextMlAttributes, PeritextMlElement} from './types';

export interface IBlock<Attr = unknown> {
  readonly path: Path;
  readonly attr?: Attr;
  readonly parent: IBlock | null;
}

export class LeafBlock<Attr = unknown> extends Block<Attr> {
  public text(): string {
    let str = '';
    for (let iterator = this.texts0(), inline = iterator(); inline; inline = iterator()) str += inline.text();
    return str;
  }

  public isLeaf(): boolean {
    return true;
  }

  // ------------------------------------------------------------------- export

  public toJson(): PeritextMlElement {
    const data = this.attr();
    const attr: PeritextMlAttributes | null = data !== void 0 ? {data} : null;
    const node: PeritextMlElement = [this.tag(), attr];
    for (const inline of this.texts()) {
      const child = inline.toJson();
      if (child) node.push(child);
    }
    return node;
  }

  // ---------------------------------------------------------------- Printable
  public toStringName(): string {
    return 'LeafBlock';
  }

  public toString(tab: string = ''): string {
    const header = this.toStringHeader();
    const texts = [...this.texts()];
    const hasSlices = !!texts.length;
    return (
      header +
      printTree(tab, [
        this.marker ? (tab) => this.marker!.toString(tab) : null,
        !hasSlices
          ? null
          : (tab) =>
              'nodes' +
              printTree(
                tab,
                texts.map((inline) => (tab) => inline.toString(tab)),
              ),
      ])
    );
  }
}
