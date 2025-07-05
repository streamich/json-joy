import {printTree} from 'tree-dump/lib/printTree';
import {OverlayPoint} from './OverlayPoint';
import type {HeadlessNode2} from 'sonic-forest/lib/types2';
import type {SliceType} from '../slice/types';
import type {Anchor} from '../rga/constants';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {MarkerSlice} from '../slice/MarkerSlice';

export class MarkerOverlayPoint<T = string> extends OverlayPoint<T> implements HeadlessNode2 {
  /**
   * Hash value of the following text contents, up until the next marker.
   */
  public textHash: number = 0;

  constructor(
    protected readonly rga: AbstractRga<T>,
    id: ITimestampStruct,
    anchor: Anchor,
    public readonly marker: MarkerSlice<T>,
  ) {
    super(rga, id, anchor);
  }

  public type(): SliceType {
    return this.marker && this.marker.type();
  }

  public data(): unknown {
    return this.marker && this.marker.data();
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'MarkerOverlayPoint';
  }

  public toStringHeader(tab: string, lite?: boolean): string {
    const hash = lite ? '' : `#${this.textHash.toString(36).slice(-4)}`;
    const tag = lite ? '' : `, type = ${JSON.stringify(this.type() as any)}`;
    return `${super.toStringHeader(tab, lite)}${lite ? '' : ' '}${hash}${tag}`;
  }

  public toString(tab: string = '', lite?: boolean): string {
    return (
      this.toStringHeader(tab, lite) +
      (lite
        ? ''
        : printTree(tab, [
            (tab) => this.marker.toString(tab),
            ...this.layers.map((slice) => (tab: string) => slice.toString(tab)),
            ...this.markers.map((slice) => (tab: string) => slice.toString(tab)),
          ]))
    );
  }

  // ------------------------------------------------------------ HeadlessNode2

  public p2: MarkerOverlayPoint<T> | undefined;
  public l2: MarkerOverlayPoint<T> | undefined;
  public r2: MarkerOverlayPoint<T> | undefined;
}
