import {Block} from './Block';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {commonLength} from '../util/commonLength';
import {printTree} from 'tree-dump/lib/printTree';
import {LeafBlock} from './LeafBlock';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {Peritext} from '../Peritext';

export class Blocks implements Printable, Stateful {
  public readonly root: Block;

  constructor(public readonly txt: Peritext) {
    this.root = new Block(txt, [], undefined);
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    return 'Blocks' + printTree(tab, [(tab) => this.root.toString(tab)]);
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    this.refreshBlocks();
    return (this.hash = this.root.refresh());
  }

  private insertBlock(parent: Block, path: Path, marker: undefined | MarkerOverlayPoint): Block {
    const txt = this.txt;
    const common = commonLength(path, parent.path);
    while (parent.path.length > common && parent.parent) parent = parent.parent as Block;
    while (parent.path.length + 1 < path.length) {
      const block = new Block(txt, path.slice(0, parent.path.length + 1), undefined);
      block.parent = parent;
      parent.children.push(block);
      parent = block;
    }
    const block = new LeafBlock(txt, path, marker);
    block.parent = parent;
    parent.children.push(block);
    return block;
  }

  protected refreshBlocks(): void {
    this.root.children = [];
    let parent = this.root;
    let markerPoint: undefined | MarkerOverlayPoint;
    const txt = this.txt;
    const overlay = txt.overlay;
    this.insertBlock(parent, [0], undefined);
    const iterator = overlay.markers0(undefined);
    while ((markerPoint = iterator())) {
      const type = markerPoint.type();
      const path = type instanceof Array ? type : [type];
      const block = this.insertBlock(parent, path, markerPoint);
      if (block.parent) parent = block.parent;
    }
  }
}
