import type {Observable} from 'rxjs';

export interface BlockServerApi {
  create: () => Promise<void>;
  merge: (req: BlockClientApiMergeRequest) => Promise<BlockClientApiMergeResponse>;
  delete: () => Promise<void>;
  listen: () => Observable<void>;
}

export interface BlockClientApiMergeRequest {
  /** Last known batch ID by the client. */
  v: number;
  /** List of patches serialized in block-specific codec. */
  b: unknown[];
}

/**
 * There are a number of scenarios that can happen
 * when merging changes. The possible scenarios also depend
 * on the collaborative editing algorithm used for the block.
 *
 * 1. The batch is accepted without any conflicts (changes).
 * 2. The batch is accepted with conflicts, hence the batch may be
 *    be modified to resolve the conflicts. This is relevant for
 *    OT-based collaborative editing.
 *    1. Some patches may still be accepted as-is.
 *    2. Some patches may have been transformed.
 *       1. Could be meaningful changes, or no-nop changes, for example,
 *          the predicate operations in JSON Patch, like the "test" operation.
 *    3. Some patches may have been rejected.
 * 3. The batch is rejected altogether. This can happen for
 *    various reasons:
 *    1. In case of OT-based collaborative editing, the last
 *       known version of a batch by the client is too far behind.
 *    2. Some other reason why the batch is rejected, say schema
 *       validation.
 */
export interface BlockClientApiMergeResponse {
  /** The last batch ID stored on the server. */
  v: number;
  /** List of patches serialized in block-specific codec. */
  batch: unknown[];
}
