import {StreamingReader} from '@jsonjoy.com/buffers/lib/StreamingReader';
import {RespDecoder} from './RespDecoder';

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
   * When set to true, the decoder will attempt to decode RESP Bulk strings
   * (which are binary strings, i.e. Uint8Array) as UTF-8 strings. If the
   * string is not valid UTF-8, it will be returned as a Uint8Array.
   */
  public get tryUtf8(): boolean {
    return this.decoder.tryUtf8;
  }
  public set tryUtf8(value: boolean) {
    this.decoder.tryUtf8 = value;
  }

  /**
   * Add a chunk of data to be decoded.
   * @param uint8 `Uint8Array` chunk of data to be decoded.
   */
  public push(uint8: Uint8Array): void {
    this.reader.push(uint8);
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
      const val = this.decoder.readAny();
      reader.consume();
      return val;
    } catch (error) {
      if (error instanceof RangeError) {
        reader.x = x;
        return undefined;
      } else throw error;
    }
  }

  /**
   * Decode only one RESP command from the stream, if the value is not a
   * command, an error will be thrown.
   *
   * @returns Redis command and its arguments or `undefined` if there is
   * not enough data to decode.
   */
  public readCmd(): [cmd: string, ...args: Uint8Array[]] | undefined {
    const reader = this.reader;
    if (reader.size() === 0) return undefined;
    const x = reader.x;
    try {
      const args = this.decoder.readCmd();
      reader.consume();
      return args;
    } catch (error) {
      if (error instanceof RangeError) {
        reader.x = x;
        return undefined;
      } else throw error;
    }
  }

  /**
   * Skips one value from the stream. If `undefined` is returned, then
   * there is not enough data to skip or the stream is finished.
   * @returns `null` if a value was skipped, `undefined` if there is not
   * enough data to skip.
   */
  public skip(): null | undefined {
    const reader = this.reader;
    if (reader.size() === 0) return undefined;
    const x = reader.x;
    try {
      this.decoder.skipAny();
      reader.consume();
      return null;
    } catch (error) {
      if (error instanceof RangeError) {
        reader.x = x;
        return undefined;
      } else throw error;
    }
  }
}
