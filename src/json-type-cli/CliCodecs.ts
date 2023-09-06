import type {CliCodec} from "./types";

export class CliCodecs {
  public readonly codecs: Map<string, CliCodec<string>> = new Map();

  public register(codec: CliCodec<string>): void {
    this.codecs.set(codec.id, codec);
  }
}
