/**
 * Lock-owner state record for NFSv4 LOCK operations.
 * A lock-owner represents a single entity (process, thread) on a client
 * that can acquire byte-range locks on files. Tracks all locks held by this owner.
 */
export class LockOwnerState {
  constructor(
    /**
     * Client ID that owns this lock-owner.
     * Links the owner back to the specific NFS client that created it.
     */
    public readonly clientid: bigint,

    /**
     * Opaque lock-owner identifier provided by the client.
     * Typically represents a process or thread ID on the client.
     * Combined with clientid, uniquely identifies this lock-owner.
     */
    public readonly owner: Uint8Array,

    /**
     * Sequence number for operations from this lock-owner.
     * Used to serialize LOCK/LOCKU operations.
     * Incremented after each successful stateful operation.
     * Server rejects operations with incorrect sequence numbers to prevent replays.
     */
    public seqid: number,

    /**
     * Set of lock keys for all byte-range locks currently held by this owner.
     * Format: lock keys are `${stateid}:${offset}:${length}`.
     * Used to track all active locks and clean them up if the owner goes away.
     */
    public readonly locks: Set<string> = new Set(),

    /**
     * Cached response from the last successful operation.
     * Per RFC 7530 §9.1.7, when a client retries with the same seqid (replay),
     * the server must return the cached response instead of re-executing the operation.
     * This ensures idempotency for LOCK and LOCKU operations.
     */
    public lastResponse?: any,

    /**
     * Signature of the last request to validate true replays.
     * Used to detect mismatched replays where the client reuses a seqid but changes
     * the request parameters, which must be rejected with NFS4ERR_BAD_SEQID.
     */
    public lastRequestKey?: string,
  ) {}
}
