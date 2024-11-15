import {printTree} from 'tree-dump/lib/printTree';
import {Block} from './Block';
import type {Path} from '@jsonjoy.com/json-pointer';

export interface IBlock<Attr = unknown> {
  readonly path: Path;
  readonly attr?: Attr;
  readonly parent: IBlock | null;
}

export class LeafBlock<Attr = unknown> extends Block<Attr> {
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
