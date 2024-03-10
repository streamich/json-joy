import {MulticodecIpld} from "../multiformats";
import type {IpldCodec} from "./types";

export class Codecs {
  protected readonly map = new Map<MulticodecIpld, IpldCodec>();

  public set(codec: MulticodecIpld, jsonCodec: IpldCodec): void {
    this.map.set(codec, jsonCodec);
  }

  public get(codec: MulticodecIpld): IpldCodec | undefined {
    return this.map.get(codec);
  }

  public getOrThrow(codec: MulticodecIpld): IpldCodec {
    const jsonCodec = this.get(codec);
    if (!jsonCodec) throw new Error(`Codec ${codec} (0x${codec.toString(16)}) not found`);
    return jsonCodec;
  }
}
