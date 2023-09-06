import type {CliCodec} from "./types";

const CODEC_REGEX = /(\w{0,32})(?:\:(\w{0,32}))?/;

export class CliCodecs {
  public defaultCodec: string = 'json';
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

  public getCodecs(format: string): [request: CliCodec<string>, response: CliCodec<string>] {
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
