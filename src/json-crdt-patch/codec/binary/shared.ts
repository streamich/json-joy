import {Encoder} from './Encoder';
import {Decoder} from './Decoder';
import type {Patch} from '../../Patch';
import {CrdtWriter} from '../../util/binary/CrdtWriter';

/** A shared instance of the {@link CrdtWriter} class. */
const writer = new CrdtWriter(1024 * 4);

/** A shared instance of the {@link Encoder} class. */
export const encoder = new Encoder(writer);

/**
 * Encodes a JSON CRDT Patch into a binary {@link Uint8Array} blob.
 *
 * @param patch A {@link Patch} to encode.
 * @returns A Uint8Array containing the encoded patch.
 */
export const encode = (patch: Patch): Uint8Array => {
  return encoder.encode(patch);
};

/** A shared instance of the {@link Decoder} class. */
export const decoder = new Decoder();

/**
 * Decodes a binary {@link Uint8Array} blob into a JSON CRDT Patch.
 *
 * @param buf Binary blob to decode.
 * @returns A {@link Patch} decoded from the binary blob.
 */
export const decode = (buf: Uint8Array): Patch => {
  return decoder.decode(buf);
};
