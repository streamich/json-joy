import {printTree} from 'tree-dump/lib/printTree';
import {CONST, updateJson, updateNum} from '../../../json-hash';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {OverlayPoint} from '../overlay/OverlayPoint';
import {UndefEndIter, type UndefIterator} from '../../../util/iterator';
import type {Path} from '../../../json-pointer';
import type {Printable} from 'tree-dump';
import type {Peritext} from '../Peritext';
import type {Stateful} from '../types';

export interface IBlock {
  readonly path: Path;
  readonly parent: IBlock | null;
}

type T = string;

export class Block<Attr = unknown> implements IBlock, Printable, Stateful {
  public parent: Block | null = null;

  public children: Block[] = [];

  constructor(
    public readonly txt: Peritext,
    public readonly path: Path,
    public readonly marker: MarkerOverlayPoint | undefined,
  ) {}

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

  protected toStringHeader(): string {
    const hash = `#${this.hash.toString(36).slice(-4)}`;
    const tag = `<${this.path.join('.')}>`;
    const header = `${this.constructor.name} ${hash} ${tag}`;
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
