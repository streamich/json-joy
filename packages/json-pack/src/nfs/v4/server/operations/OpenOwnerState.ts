/**
 * Open-owner state record for NFSv4 OPEN operations.
 * An open-owner represents a single entity (process, thread) on a client
 * that can open files. Tracks all opens made by this owner and manages
 * sequence numbers for serialization.
 */
export class OpenOwnerState {
  constructor(
    /**
     * Client ID that owns this open-owner.
     * Links the owner back to the specific NFS client that created it.
     */
    public readonly clientid: bigint,

    /**
     * Opaque owner identifier provided by the client.
     * Typically represents a process or thread ID on the client.
     * Combined with clientid, uniquely identifies this open-owner.
     */
    public readonly owner: Uint8Array,

    /**
     * Sequence number for operations from this open-owner.
     * Used to serialize OPEN/CLOSE/OPEN_CONFIRM/OPEN_DOWNGRADE operations.
     * Incremented after each successful stateful operation.
     * Server rejects operations with incorrect sequence numbers to prevent replays.
     */
    public seqid: number,

    /**
     * Set of stateid keys for all files currently opened by this owner.
     * Format: stateid keys are `${seqid}:${base64(other)}`.
     * Used to track all active opens and clean them up if the owner goes away.
     */
    public readonly opens: Set<string> = new Set(),

    /**
     * Cached response from the last successful operation.
     * Per RFC 7530 §9.1.7, when a client retries with the same seqid (replay),
     * the server must return the cached response instead of re-executing the operation.
     * This ensures idempotency for operations like OPEN, OPEN_CONFIRM, OPEN_DOWNGRADE, CLOSE.
     */
    public lastResponse?: any,

    /**
     * Signature of the last OPEN request. Used to distinguish true replays
     * (identical requests) from clients that reuse seqids with different
     * parameters, which must be rejected with BAD_SEQID.
     */
    public lastRequestKey?: string,
  ) {}
}
