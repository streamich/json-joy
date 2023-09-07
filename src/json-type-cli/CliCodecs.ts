import type {CliCodec} from './types';

const CODEC_REGEX = /(\w{0,32})(?:\:(\w{0,32}))?/;

export class CliCodecs {
  public defaultCodec: string = 'json4';
  public readonly codecs: Map<string, CliCodec<string>> = new Map();

  public register(codec: CliCodec<string>): void {
    this.codecs.set(codec.id, codec);
  }

  public get(id: '' | string): CliCodec<string> {
    let codec = this.codecs.get(id);
    if (!id) codec = this.codecs.get(this.defaultCodec);
    if (!codec) throw new Error(`Codec not found: ${id}`);
    return codec;
  }

  /**
   * Select codecs for the given format specifier. The format specifier is a
   * string of the form:
   *
   *   <request-and-response>
   *   <request>:<response>
   *
   * Examples:
   *
   *   json
   *   json:json
   *   cbor:json
   *   cbor
   *
   * @param format Codec specifier, e.g. `json:json` or `json`.
   * @returns 2-tuple of selected codecs.
   */
  public getCodecs(format: unknown): [request: CliCodec<string>, response: CliCodec<string>] {
    if (typeof format !== 'string') throw new Error(`Invalid --format type.`);
    if (!format) {
      const codec = this.get('');
      return [codec, codec];
    }
    const match = CODEC_REGEX.exec(format);
    if (!match) throw new Error(`Invalid format: ${format}`);
    const request = match[1];
    const response = match[2] ?? request;
    return [this.get(request), this.get(response)];
  }
}
