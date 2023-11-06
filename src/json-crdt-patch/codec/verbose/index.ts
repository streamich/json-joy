/**
 * Implements JSON CRDT Patch codec for JSON serialization format, which is
 * a verbose human-readable format designed for debugging and testing.
 *
 * This module encodes the {@link Patch} into a JavaScript POJO. You can then use
 * any JSON serializer to serialize the POJO into a string or a binary format.
 *
 * Usage:
 *
 * ```ts
 * const encoded = JSON.stringify(encode(patch));
 * const decoded = decode(JSON.parse(encoded));
 * ```
 *
 * @module json-crdt-patch/codec/json
 */

export * from './types';
export * from './encode';
export * from './decode';
