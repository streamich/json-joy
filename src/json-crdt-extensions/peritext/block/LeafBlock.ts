import {printTree} from 'tree-dump/lib/printTree';
import {Block} from './Block';
import type {Path} from '../../../json-pointer';

export interface IBlock<Attr = unknown> {
  readonly path: Path;
  readonly attr?: Attr;
  readonly parent: IBlock | null;
}

export class LeafBlock<Attr = unknown> extends Block<Attr> {
  protected toStringHeader(): string {
    const header = `${super.toStringHeader()}`;
    return header;
  }

  public toString(tab: string = ''): string {
    const header = this.toStringHeader();
    return header + printTree(tab, [this.marker ? (tab) => this.marker!.toString(tab) : null]);
  }
}
