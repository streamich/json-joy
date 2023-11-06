/**
 * Implements JSON CRDT Patch "compact" serialization format, which is
 * a compact JSON format.
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
 * @module json-crdt-patch/codec/compact
 */

export * from './types';
export * from './encode';
export * from './decode';
