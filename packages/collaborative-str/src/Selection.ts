import type {ITimestampStruct} from 'json-joy/lib/json-crdt-patch/clock';

export class Selection {
  /** Local selection start. */
  public start: number | null = null;
  /** Local selection end. */
  public end: number | null = null;
  /** Local selection direction. */
  public dir: -1 | 0 | 1 = 0;
  /** Timestamp when selection last updated. */
  public ts: number = 0;
  /** Model tick. */
  public tick: number = 0;
  /** Remote selection start. */
  public startId: ITimestampStruct | null = null;
  /** Remote selection end. */
  public endId: ITimestampStruct | null = null;
}
