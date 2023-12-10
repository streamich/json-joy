import {StreamingReader} from "../../util/buffers/StreamingReader";
import {RespDecoder} from "./RespDecoder";

/**
 * Streaming decoder for RESP protocol. Can be used to decode data from
 * a stream where messages are arbitrary split into chunks.
 *
 * Example:
 *
 * ```ts
 * const decoder = new RespStreamingDecoder();
 *
 * decoder.push(new Uint8Array([43, 49, 13, 10]));
 *
 * let val;
 * while ((val = decoder.read()) !== undefined) {
 *   console.log(val);
 * }
 * ```
 */
export class RespStreamingDecoder {
  protected readonly reader = new StreamingReader();
  protected readonly decoder = new RespDecoder(this.reader);

  /**
   * Add a chunk of data to be decoded.
   * @param uint8 `Uint8Array` chunk of data to be decoded.
   */
  public push(uint8: Uint8Array): void {
    this.decoder.reader.push(uint8);
  }

  /**
   * Decode one value from the stream. If `undefined` is returned, then
   * there is not enough data to decode or the stream is finished.
   *
   * There could be multiple values in the stream, so this method should be
   * called in a loop until `undefined` is returned.
   *
   * @return Decoded value or `undefined` if there is not enough data to decode.
   */
  public read(): unknown | undefined {
    const reader = this.reader;
    if (reader.size() === 0) return undefined;
    const x = reader.x;
    try {
      const val = this.decoder.val();
      reader.consume();
      return val;
    } catch (error) {
      if (error instanceof RangeError) {
        reader.x = x;
        return undefined;
      } else throw error;
    }
  }
}
