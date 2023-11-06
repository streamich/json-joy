/**
 * This module implements logical clock for JSON CRDT and JSON CRDT Patch.
 * JSON CRDT uses logical timestamps as IDs for everything in the CRDT structure
 * and also to identify JSON CRDT Patch operations. A logical time stamp is a
 * `[sessionId, time]` 2-tuple.
 *
 * The `sessionId` (or *site ID*) is a randomly generated 53-bit integer (as 53 bits is the
 * maximum integer value in JavaScript) and time is a monotonically incrementing
 * integer. (We call it *session* because a single user can have multiple
 * session IDs, for example, on different devices or even on the same device,
 * but from a different browser tabs.)
 *
 * The `time` component is a monotonically increasing integer, which
 * starts from 0 (usually, could start from any value).
 *
 * JSON CRDT can also work with *sever timestamps*, server timestamps
 * are similar to logical timestamps, but the `sessionId` is always
 * set to the constant 1. We can use this simplification when all
 * CRDT operations go through a central server, which sequentially
 * orders and assigns the final `time` to each operation.
 *
 * @module json-crdt-patch/clock
 */

export * from './types';
export * from './clock';
