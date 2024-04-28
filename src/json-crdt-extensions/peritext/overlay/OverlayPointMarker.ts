import {OverlayPoint} from './OverlayPoint';
import {SliceType} from '../types';
import type {Anchor} from '../rga/constants';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {SplitSlice} from '../slice/SplitSlice';

export class OverlayPointMarker extends OverlayPoint {
  /**
   * Hash value of the preceding text contents, up until the next marker.
   */
  public textHash: number = 0;

  /** @todo splice can always be set, maybe? */
  constructor(protected readonly rga: AbstractRga<string>, id: ITimestampStruct, anchor: Anchor, public readonly slice: SplitSlice | undefined) {
    super(rga, id, anchor);
  }

  /** @todo Rename or access it directly. */
  public markerHash(): number {
    return this.slice ? this.slice.hash : 0;
  }

  public tag(): SliceType | 0 {
    if (!this.slice) return 0;
    return this.slice.type;
  }

  public data(): unknown {
    if (!this.slice) return undefined;
    return this.slice.data();
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(tab: string, lite?: boolean): string {
    const hash = lite ? '' : `#${this.textHash.toString(36).slice(-4)}`;
    const tag = lite ? '' : `, ${JSON.stringify((this.tag() as any)[1])}`;
    return `${super.toStringName(tab, lite)}${lite ? '' : ' '}${hash}${tag}`;
  }
}
