import {printTree} from 'tree-dump/lib/printTree';
import {CONST, updateJson, updateNum} from '../../../json-hash/hash';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {UndefEndIter, type UndefIterator} from '../../../util/iterator';
import {Inline} from './Inline';
import {formatType, getTag} from '../slice/util';
import {Range} from '../rga/Range';
import type {Point} from '../rga/Point';
import type {OverlayPoint} from '../overlay/OverlayPoint';
import type {Printable} from 'tree-dump';
import type {Peritext} from '../Peritext';
import type {Stateful} from '../types';
import type {OverlayTuple} from '../overlay/types';
import type {PeritextMlAttributes, PeritextMlElement} from './types';
import type {SliceTypeSteps} from '../slice';

export interface IBlock {
  readonly path: SliceTypeSteps;
  readonly parent: IBlock | null;
}

export class Block<T = string, Attr = unknown> extends Range<T> implements IBlock, Printable, Stateful {
  public parent: Block<T> | null = null;

  public children: Block<T>[] = [];

  constructor(
    public readonly txt: Peritext<T>,
    public readonly path: SliceTypeSteps,
    public readonly marker: MarkerOverlayPoint<T> | undefined,
    public start: Point<T>,
    public end: Point<T>,
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
    return getTag(this.path);
  }

  public attr(): Attr | undefined {
    return this.marker?.data() as Attr | undefined;
  }

  public isLeaf(): boolean {
    return false;
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

  protected tuples0(): UndefIterator<OverlayTuple<T>> {
    const overlay = this.txt.overlay;
    const marker = this.marker;
    const iterator = overlay.tuples0(marker);
    let closed = false;
    return () => {
      if (closed) return;
      let pair = iterator();
      while (!marker && pair && pair[1] && pair[1].cmpSpatial(this.start) < 0) pair = iterator();
      if (!pair) return (closed = true), void 0;
      if (!pair[1] || pair[1] instanceof MarkerOverlayPoint) closed = true;
      return pair;
    };
  }

  /**
   * @todo Consider moving inline-related methods to {@link LeafBlock}.
   */
  public texts0(): UndefIterator<Inline<T>> {
    const txt = this.txt;
    const overlay = txt.overlay;
    const iterator = this.tuples0();
    const start = this.start;
    const end = this.end;
    const startIsMarker = overlay.isMarker(start.id);
    const endIsMarker = overlay.isMarker(end.id);
    let isFirst = true;
    let next = iterator();
    let closed = false;
    const newIterator: UndefIterator<Inline<T>> = () => {
      if (closed) return;
      const pair = next;
      next = iterator();
      if (!pair) return;
      const [overlayPoint1, overlayPoint2] = pair;
      let point1: Point<T> = overlayPoint1;
      let point2: Point<T> = overlayPoint2;
      if (isFirst) {
        isFirst = false;
        if (start.cmpSpatial(overlayPoint1) > 0) point1 = start;
        if (startIsMarker) {
          point1 = point1.clone();
          point1.step(1);
          // Skip condition when inline annotations tarts immediately at th
          // beginning of the block.
          if (point1.cmp(point2) === 0) return newIterator();
        }
      }
      if (!endIsMarker && end.cmpSpatial(overlayPoint2) < 0) {
        closed = true;
        point2 = end;
      }
      return new Inline(txt, overlayPoint1, overlayPoint2, point1, point2);
    };
    return newIterator;
  }

  /**
   * @todo Consider moving inline-related methods to {@link LeafBlock}.
   */
  public texts(): IterableIterator<Inline<T>> {
    return new UndefEndIter(this.texts0());
  }

  public text(): string {
    let str = '';
    const children = this.children;
    const length = children.length;
    for (let i = 0; i < length; i++) str += children[i].text();
    return str;
  }

  // ------------------------------------------------------------------- export

  public toJson(): PeritextMlElement {
    const data = this.attr();
    const attr: PeritextMlAttributes | null = data !== void 0 ? {data} : null;
    const node: PeritextMlElement = [this.tag(), attr];
    const children = this.children;
    const length = children.length;
    for (let i = 0; i < length; i++) node.push(children[i].toJson());
    return node;
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
