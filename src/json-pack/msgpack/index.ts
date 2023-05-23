/**
 * # `json-pack` MessagePack`
 *
 * Library for encoding and decoding JavaScript native structures to MessagePack
 * format.
 *
 * Use `Encoder` to encode plain JSON values.
 *
 * ```ts
 * import {Encoder, Decoder} from 'json-joy/{lib,es6,esm}/json-pack';
 *
 * const encoder = new Encoder();
 * const decoder = new Decoder();
 * const buffer = encoder.encode({foo: 'bar'});
 * const obj = decoder.decode(buffer);
 *
 * console.log(obj); // { foo: 'bar' }
 * ```
 *
 * For more:
 *
 * - Use {@link Encoder} to encode only JSON values.
 * - Use {@link EncoderFull} to also encode binary data, extensions and pre-computed MessagePack buffers.
 * - To encode binary data use `Uint8Array`.
 * - To encode an extension use {@link JsonPackExtension}.
 * - To encode a pre-computed MessagePack value use {@link JsonPackValue}.
 *
 * @module
 */

export {MsgPackEncoderFast} from './MsgPackEncoderFast';
export {MsgPackEncoder} from './MsgPackEncoder';
export {MsgPackEncoderStable} from './MsgPackEncoderStable';
export {MsgPackDecoderFast} from './MsgPackDecoderFast';
export {MsgPackToJsonConverter} from './MsgPackToJsonConverter';
export {JsonPackValue} from '../JsonPackValue';
export {JsonPackExtension} from '../JsonPackExtension';
export * from './types';
