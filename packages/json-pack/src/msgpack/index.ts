/**
 * # `json-pack` MessagePack`
 *
 * Library for encoding and decoding JavaScript native structures to MessagePack
 * format.
 *
 * Use `Encoder` to encode plain JSON values.
 *
 * ```ts
 * import {Encoder, Decoder} from 'json-pack/lib/json-pack';
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

export * from './types';
export {MsgPackEncoderFast} from './MsgPackEncoderFast';
export {MsgPackEncoder} from './MsgPackEncoder';
export {MsgPackEncoderStable} from './MsgPackEncoderStable';
export {MsgPackDecoder} from './MsgPackDecoder';
export {MsgPackDecoderFast} from './MsgPackDecoderFast';
export {MsgPackToJsonConverter} from './MsgPackToJsonConverter';
export {JsonPackValue} from '../JsonPackValue';
export {JsonPackExtension} from '../JsonPackExtension';

// User-friendly aliases
export {MsgPackEncoder as MessagePackEncoder} from './MsgPackEncoder';
export {MsgPackDecoder as MessagePackDecoder} from './MsgPackDecoder';
