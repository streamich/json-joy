import {OverlayPoint} from './OverlayPoint';
import {SliceType} from '../types';
import type {Anchor} from '../rga/constants';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {MarkerSlice} from '../slice/MarkerSlice';
import {printTree} from 'tree-dump/lib/printTree';

export class MarkerOverlayPoint extends OverlayPoint {
  /**
   * Hash value of the preceding text contents, up until the next marker.
   */
  public textHash: number = 0;

  constructor(
    protected readonly rga: AbstractRga<string>,
    id: ITimestampStruct,
    anchor: Anchor,
    public readonly marker: MarkerSlice,
  ) {
    super(rga, id, anchor);
  }

  /**
   * @todo Rename or access it directly.
   * @deprecated
   */
  public markerHash(): number {
    return this.marker ? this.marker.hash : 0;
  }

  public type(): SliceType {
    return this.marker && this.marker.type;
  }

  public data(): unknown {
    return this.marker && this.marker.data();
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(tab: string, lite?: boolean): string {
    const hash = lite ? '' : `#${this.textHash.toString(36).slice(-4)}`;
    const tag = lite ? '' : `, type = ${JSON.stringify(this.type() as any)}`;
    return `${super.toStringName(tab, lite)}${lite ? '' : ' '}${hash}${tag}`;
  }

  public toString(tab: string = '', lite?: boolean): string {
    return super.toString(tab, lite) + (lite ? '' : printTree(tab, [(tab) => this.marker.toString(tab)]));
  }
}
