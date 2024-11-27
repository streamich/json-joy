import {Block} from './Block';
import {commonLength} from '../util/commonLength';
import {printTree} from 'tree-dump/lib/printTree';
import {LeafBlock} from './LeafBlock';
import {Range} from '../rga/Range';
import {CommonSliceType} from '../slice';
import {toHtml} from '../../../json-ml';
import type {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {Peritext} from '../Peritext';
import type {Point} from '../rga/Point';
import type {JsonMlNode} from '../../../json-ml/types';

/**
 * A *fragment* represents a structural slice of a rich-text document. A
 * fragment can be bound to a specific range of text contents, however it
 * always constructs a tree of {@link Block}s, which represent the nested
 * structure of the text contents.
 */
export class Fragment extends Range implements Printable, Stateful {
  public readonly root: Block;

  constructor(
    public readonly txt: Peritext,
    start: Point,
    end: Point,
  ) {
    super(txt.str, start, end);
    this.root = new Block(txt, [], void 0, start, end);
  }

  // ------------------------------------------------------------------- export

  toJsonMl(): JsonMlNode {
    return this.root.toJsonMl();
  }

  toHtml(): string {
    const json = this.root.toJsonMl();
    return toHtml(json);
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    return 'Fragment' + printTree(tab, [(tab) => this.root.toString(tab)]);
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    this.build();
    return (this.hash = this.root.refresh());
  }

  private insertBlock(parent: Block, path: Path, marker: undefined | MarkerOverlayPoint, end: Point = this.end): Block {
    const txt = this.txt;
    const common = commonLength(path, parent.path);
    const start: Point = marker ? marker : this.start;
    while (parent.path.length > common && parent.parent) parent = parent.parent as Block;
    while (parent.path.length + 1 < path.length) {
      const block = new Block(txt, path.slice(0, parent.path.length + 1), void 0, start, end);
      block.parent = parent;
      parent.children.push(block);
      parent = block;
    }
    const block = new LeafBlock(txt, path, marker, start, end);
    block.parent = parent;
    parent.children.push(block);
    return block;
  }

  protected build(): void {
    const {end, root} = this;
    root.children = [];
    let parent = this.root;
    const txt = this.txt;
    const overlay = txt.overlay;
    /**
     * @todo This line always inserts a markerless block at the beginning of
     * the fragment. But what happens if one actually exists?
     */
    this.insertBlock(parent, [CommonSliceType.p], void 0, void 0);
    const iterator = overlay.markerPairs0(this.start, this.end);
    const checkEnd = !end.isAbsEnd();
    let pair: ReturnType<typeof iterator>;
    while ((pair = iterator())) {
      const [p1, p2] = pair;
      if (!p1) break;
      if (checkEnd && p1.cmpSpatial(end) > 0) break;
      const type = p1.type();
      const path = type instanceof Array ? type : [type];
      const block = this.insertBlock(parent, path, p1, p2);
      if (block.parent) parent = block.parent;
    }
  }
}
