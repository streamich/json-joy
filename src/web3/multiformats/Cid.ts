import {decode} from './multibase';
import * as vuint from "../util/uvint";
import {Multihash} from "./Multihash";
import {Multicodec} from "./constants";
import * as multibase from "./multibase";

export type CidVersion = 0 | 1;

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
    const [v1Tag, offset1] = vuint.read(buf, 0);
    if (v1Tag !== Multicodec.CidV1) throw new Error('EXPECTED_CIDV1');
    const [contentType, offset2] = vuint.read(buf, offset1);
    const hash = new Multihash(buf.slice(offset2));
    return new Cid(1, contentType, hash);
  }

  public static fromText(text: string): Cid {
    if (text.charCodeAt(0) === 81 && text.charCodeAt(1) === 109) {
      const buf = decode(text);
      return Cid.fromBinaryV0(buf)
    }
    const buf = decode(text);
    if (buf[0] === 0x12) throw new Error('UNSUPPORTED_CIDV0');
    return Cid.fromBinaryV1(buf);
  }

  constructor(
    public readonly v: CidVersion,
    public readonly contentType: number,
    public readonly hash: Multihash,
  ) {}

  public is(cid: Cid): boolean {
    return this.v === cid.v && this.contentType === cid.contentType && this.hash.is(cid.hash);
  }

  public toBinary(version: CidVersion = this.v): Uint8Array {
    if (version === 0) return this.toBinaryV0();
    return this.toBinaryV1();
  }

  public toBinaryV0(): Uint8Array {
    const hashBuf = this.hash.buf;
    const hashLen = hashBuf.length;
    const buf = new Uint8Array(2 + hashLen);
    buf[0] = 0x12;
    buf[1] = 0x20;
    buf.set(hashBuf, 2);
    return buf;
  }

  public toBinaryV1(): Uint8Array {
    let size = 2;
    const contentType = this.contentType;
    if (contentType > 0b1111111) size += 1;
    if (contentType > 0b1111111_1111111) size += 1;
    const hash = this.hash;
    size += hash.length();
    const buf = new Uint8Array(size);
    buf[0] = Multicodec.CidV1;
    const offset = vuint.write(buf, 1, contentType);
    hash.buf.set(buf, offset);
    return buf;
  }

  public toText(format: multibase.BaseNameOrCode = 'base64url', version?: CidVersion): string {
    const buf = multibase.encode(format, this.toBinary(version));
    const str = String.fromCharCode(...buf);
    return str;
  }
}
