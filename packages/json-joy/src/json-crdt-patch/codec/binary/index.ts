/**
 * Implements JSON CRDT Patch "binary" serialization format, which is
 * the most compact binary encoding format.
 *
 * Usage:
 *
 * ```ts
 * const encoded = encode(patch);
 * const decoded = decode(encoded);
 * ```
 *
 * @module json-crdt-patch/codec/binary
 */

export * from './Encoder';
export * from './Decoder';
export * from './shared';
