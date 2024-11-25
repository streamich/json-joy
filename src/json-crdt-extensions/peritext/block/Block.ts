import {printTree} from 'tree-dump/lib/printTree';
import {CONST, updateJson, updateNum} from '../../../json-hash';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {UndefEndIter, type UndefIterator} from '../../../util/iterator';
import {Inline} from './Inline';
import {formatType} from '../slice/util';
import {Range} from '../rga/Range';
import type {Point} from '../rga/Point';
import type {OverlayPoint} from '../overlay/OverlayPoint';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {Printable} from 'tree-dump';
import type {Peritext} from '../Peritext';
import type {Stateful} from '../types';
import type {OverlayTuple} from '../overlay/types';
import type {JsonMlNode} from '../../../json-ml';

export interface IBlock {
  readonly path: Path;
  readonly parent: IBlock | null;
}

type T = string;

export class Block<Attr = unknown> extends Range implements IBlock, Printable, Stateful {
  public parent: Block | null = null;

  public children: Block[] = [];

  constructor(
    public readonly txt: Peritext,
    public readonly path: Path,
    public readonly marker: MarkerOverlayPoint | undefined,
    public start: Point,
    public end: Point,
  ) {
    super(txt.str, start, end);
  }

  /**
   * @returns Stable unique identifier within a list of blocks. Used for React
   * or other rendering library keys.
   */
  public key(): number | string {
    if (!this.marker) return this.tag();
    const id = this.marker.id;
    return id.sid.toString(36) + id.time.toString(36);
  }

  public tag(): number | string {
    const path = this.path;
    const length = path.length;
    return length ? path[length - 1] : '';
  }

  public attr(): Attr | undefined {
    return this.marker?.data() as Attr | undefined;
  }

  /**
   * Iterate through all overlay points of this block, until the next marker
   * (regardless if that marker is a child or not).
   */
  public points0(withMarker: boolean = false): UndefIterator<OverlayPoint<T>> {
    const txt = this.txt;
    const overlay = txt.overlay;
    const iterator = overlay.points0(this.marker);
    let closed = false;
    return () => {
      if (withMarker) {
        withMarker = false;
        return this.marker ?? overlay.START;
      }
      if (closed) return;
      const point = iterator();
      if (!point) return;
      if (point instanceof MarkerOverlayPoint) {
        closed = true;
        return;
      }
      return point;
    };
  }

  public points(withMarker?: boolean): IterableIterator<OverlayPoint<T>> {
    return new UndefEndIter(this.points0(withMarker));
  }

  public tuples0(): UndefIterator<OverlayTuple<T>> {
    const overlay = this.txt.overlay;
    const iterator = overlay.tuples0(this.marker);
    let closed = false;
    return () => {
      if (closed) return;
      const pair = iterator();
      if (!pair) return;
      if (!pair[1] || pair[1] instanceof MarkerOverlayPoint) closed = true;
      return pair;
    };
  }

  public tuples(): IterableIterator<OverlayTuple<T>> {
    return new UndefEndIter(this.tuples0());
  }

  public texts0(): UndefIterator<Inline> {
    const txt = this.txt;
    const iterator = this.tuples0();
    const blockStart = this.start;
    const blockEnd = this.end;
    let isFirst = true;
    let next = iterator();
    return () => {
      const pair = next;
      next = iterator();
      if (!pair) return;
      const [p1, p2] = pair;
      let start: Point = p1;
      let end: Point = p2;
      if (isFirst) {
        isFirst = false;
        if (blockStart.cmpSpatial(p1) > 0) start = blockStart;
      }
      const isLast = !next;
      if (isLast) if (blockEnd.cmpSpatial(p2) < 0) end = blockEnd;
      return new Inline(txt, p1, p2, start, end);
    };
  }

  public texts(): IterableIterator<Inline> {
    return new UndefEndIter(this.texts0());
  }

  public text(): string {
    let str = '';
    const iterator = this.texts0();
    let inline = iterator();
    while (inline) {
      str += inline.text();
      inline = iterator();
    }
    return str;
  }

  // ------------------------------------------------------------------- export

  toJsonMl(): JsonMlNode {
    throw new Error('not implemented');
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    const {path, children} = this;
    let state = CONST.START_STATE;
    state = updateJson(state, path);
    const marker = this.marker;
    if (marker) {
      state = updateNum(state, marker.marker.refresh());
      state = updateNum(state, marker.textHash);
    } else {
      state = updateNum(state, this.txt.overlay.leadingTextHash);
    }
    for (let i = 0; i < children.length; i++) state = updateNum(state, children[i].refresh());
    return (this.hash = state);
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'Block';
  }
  protected toStringHeader(): string {
    const hash = `#${this.hash.toString(36).slice(-4)}`;
    const tag = this.path.map((step) => formatType(step)).join('.');
    const header = `${super.toString('', true)} ${hash} ${tag} `;
    return header;
  }

  public toString(tab: string = ''): string {
    const header = this.toStringHeader();
    const hasChildren = !!this.children.length;
    return (
      header +
      printTree(tab, [
        this.marker ? (tab) => this.marker!.toString(tab) : null,
        this.marker && hasChildren ? () => '' : null,
        hasChildren
          ? (tab) =>
              'children' +
              printTree(
                tab,
                this.children.map(
                  (child, i) => (tab) => `${i + 1}. ` + child.toString(tab + '  ' + ' '.repeat(String(i + 1).length)),
                ),
              )
          : null,
      ])
    );
  }
}
