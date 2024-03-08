import {readUvint} from "../util/readUvint";
import {Multihash} from "./Multihash";
import {Multicodec} from "./constants";

export class Cid {
  public static fromBinary(buf: Uint8Array): Cid {
    const isV0 = buf[0] === 0x12 && buf[1] === 0x20;
    return isV0 ? Cid.fromBinaryV0(buf) : Cid.fromBinaryV1(buf);
  }

  public static fromBinaryV0(buf: Uint8Array): Cid {
    const hash = new Multihash(buf.slice(2));
    return new Cid(0, Multicodec.DagPb, hash);
  }

  public static fromBinaryV1(buf: Uint8Array): Cid {
    const [v1Tag, offset1] = readUvint(buf, 0);
    if (v1Tag !== Multicodec.CidV1) throw new Error('EXPECTED_CIDV1');
    const [contentType, offset2] = readUvint(buf, offset1);
    const hash = new Multihash(buf.slice(offset2));
    return new Cid(1, contentType, hash);
  }

  public static fromText(text: string): Cid {
    if (text.charCodeAt(0) === 81 && text.charCodeAt(1) === 109) {
      // 1. Decode as base58btc
      // 2. Decode as V0
    }
    // 1. Decode according to multibase
    // 2. If starts with 0x12, error
    // 3. Decode as V1
  }

  constructor(
    public readonly v: 0 | 1,
    public readonly contentType: number,
    public readonly hash: Multihash,
  ) {}
}
