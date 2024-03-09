import type {FeedOpType} from './constants';
import type {HlcDto} from '../../hlc';
import type {Cid} from '../../multiformats';

/**
 * Public API of a feed CRDT.
 */
export interface FeedApi {
  /** Append a new item to the end of the feed. */
  add(data: unknown): HlcDto;
  /** Delete some item from the feed. */
  del(operationId: HlcDto): void;
  /** Load the latest entries of the feed. */
  loadHead(cid: Cid): Promise<void>;
  /** Load more entries of the feed. */
  loadMore(): Promise<void>;
  /** Whether feed has more frames to load. */
  hasMore(): boolean;
  /** Persist any unsaved changes to the storage. */
  save(): Promise<Cid>;
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

export type FeedOpInsert = [type: FeedOpType.Insert, id: HlcDto, value: unknown];
export type FeedOpDelete = [type: FeedOpType.Delete, id: HlcDto];
export type FeedOp = FeedOpInsert | FeedOpDelete;
