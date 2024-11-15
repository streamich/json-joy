import {Block} from './Block';
import type {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {commonLength} from '../util/commonLength';
import {printTree} from 'tree-dump/lib/printTree';
import {LeafBlock} from './LeafBlock';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {Peritext} from '../Peritext';
import type {Point} from '../rga/Point';

/**
 * A *fragment* represents a structural slice of a rich-text document. A
 * fragment can be bound to a specific range of text contents, however it
 * always constructs a tree of {@link Block}s, which represent the nested
 * structure of the text contents.
 */
export class Fragment implements Printable, Stateful {
  public readonly root: Block;

  constructor(public readonly txt: Peritext) {
    this.root = new Block(txt, [], undefined);
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    return 'Fragment' + printTree(tab, [(tab) => this.root.toString(tab)]);
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    this.build(this.txt.pointStart(), void 0);
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

  protected build(start: Point | undefined, end: Point | undefined): void {
    this.root.children = [];
    let parent = this.root;
    let markerPoint: undefined | MarkerOverlayPoint;
    const txt = this.txt;
    const overlay = txt.overlay;
    /**
     * @todo This line always inserts a markerless block at the beginning of
     * the fragment. But what happens if one actually exists?
     */
    this.insertBlock(parent, [0], undefined);
    const iterator = start ? overlay.markers1(start) : overlay.markers0(undefined);
    while ((markerPoint = iterator())) {
      if (end && markerPoint.cmpSpatial(end) > 0) break;
      const type = markerPoint.type();
      const path = type instanceof Array ? type : [type];
      const block = this.insertBlock(parent, path, markerPoint);
      if (block.parent) parent = block.parent;
    }
  }
}
