import type {HlcDto} from '../../hlc';
import type {Cid} from '../../multiformats';

export interface HamtApi {
  put(key: Uint8Array | string, val: unknown): Promise<boolean>;
  get(key: Uint8Array | string): Promise<unknown | undefined>;
  has(key: Uint8Array | string): Promise<boolean>;
  del(key: Uint8Array | string): Promise<boolean>;
}

/** Data of the root node of the HAMT. */
export type HamtRootFrameDto = [
  /**
   * CID of the previous state, previous root node. Zero, if there is no
   * previous state.
   */
  prev: Cid | null,

  /**
   * Monotonically incrementing sequence number of the current state
   * (increments with each new state).
   */
  seq: number,

  /**
   * An ordered list of operations which were performed on previous state to
   * create the current state. Sorted, where the first operation is the oldest.
   */
  ops: HamtOp[],

  /**
   * Root level data of the HAMT.
   */
  data: HamtFrameDto,
];

export type HamtFrameDto = [
  /**
   * List of key value pairs stored in this node.
   */
  entries: HamtFrameEntry[],

  /**
   * Links to child nodes. This array must always be exactly one element larger
   * than the `entries` array. Gaps are filled with nulls.
   */
  children: (Cid | null)[],
];

export type HamtFrameEntry = [key: Uint8Array, val: unknown, id: HlcDto];

/**
 * Key update operation.
 */
export type HamtOp = [
  /** Key that was updated. */
  key: Uint8Array,
  /** New value of the key. */
  val: unknown,
  /** ID of the operation as hybrid logical clock. */
  id: HlcDto,
];
