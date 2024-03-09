import type {Hlc, HlcDto} from '../../hlc';
import type {Cid} from '../../multiformats';

/**
 * Public API of a feed CRDT.
 */
export interface FeedApi {
  /** Append a new item to the end of the feed. */
  push(data: unknown): Hlc;
  /** Delete some item from the feed. */
  del(hlc: Hlc): void;
  /** Load the latest entries of the feed. */
  loadHead(cid: Cid): Promise<void>;
  /** Load more entries of the feed. */
  loadMore(): Promise<void>;
  /** Persist any unsaved changes to the storage. */
  save(): Promise<[head: Cid, affected: Cid[]]>;
}

/**
 * Serialized feed frame.
 */
export type FeedFrameDto = [
  /** CID of the previous block. */
  prev: Uint8Array | null,
  /** Monotonically incrementing sequence number for each new block. */
  seq: number,
  /** A list of operations that current block contains. */
  ops: FeedOp[],
];

export type FeedOpInsert = [type: 0, id: HlcDto, value: unknown];
export type FeedOpDelete = [type: 1, id: HlcDto];
export type FeedOp = FeedOpInsert | FeedOpDelete;
