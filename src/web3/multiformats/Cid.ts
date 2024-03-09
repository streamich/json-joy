import * as vuint from '../util/uvint';
import * as multibase from './multibase';
import {Multihash} from './Multihash';
import {Multicodec, MulticodecIpld} from './constants';

export type CidVersion = 0 | 1;

export class Cid {
  public static fromBinary(buf: Uint8Array): Cid {
    const isV0 = buf[0] === 0x12 && buf[1] === 0x20;
    return isV0 ? Cid.fromBinaryV0(buf) : Cid.fromBinaryV1(buf);
  }

  public static fromBinaryV0(buf: Uint8Array): Cid {
    if (buf[0] !== 0x12 || buf[1] !== 0x20) throw new Error('EXPECTED_CIDV0');
    const hash = new Multihash(buf);
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
      const buf = multibase.decode('z' + text);
      return Cid.fromBinaryV0(buf);
    }
    const buf = multibase.decode(text);
    if (buf[0] === 0x12) throw new Error('UNSUPPORTED_CIDV0');
    return Cid.fromBinaryV1(buf);
  }

  public static async fromData(data: Uint8Array, codec: MulticodecIpld = MulticodecIpld.Raw): Promise<Cid> {
    const hash = await Multihash.fromData(data);
    return new Cid(1, codec, hash);
  }

  public static async fromCbor(cbor: Uint8Array): Promise<Cid> {
    return await Cid.fromData(cbor, MulticodecIpld.Cbor);
  }

  public static async fromDagCbor(cbor: Uint8Array): Promise<Cid> {
    return await Cid.fromData(cbor, MulticodecIpld.DagCbor);
  }

  public static async fromJson(cbor: Uint8Array): Promise<Cid> {
    return await Cid.fromData(cbor, MulticodecIpld.Json);
  }

  public static async fromDagJson(cbor: Uint8Array): Promise<Cid> {
    return await Cid.fromData(cbor, MulticodecIpld.DagJson);
  }

  constructor(
    public readonly v: CidVersion,
    public readonly contentType: number,
    public readonly hash: Multihash,
  ) {}

  public is(cid: Cid): boolean {
    return this.v === cid.v && this.contentType === cid.contentType && this.hash.is(cid.hash);
  }

  public toV0(): Cid {
    if (this.v === 0) return this;
    return new Cid(0, Multicodec.DagPb, this.hash);
  }

  public toV1(): Cid {
    if (this.v === 1) return this;
    return new Cid(1, this.contentType, this.hash);
  }

  public toBinary(version: CidVersion = this.v): Uint8Array {
    if (version === 0) return this.toBinaryV0();
    return this.toBinaryV1();
  }

  public toBinaryV0(): Uint8Array {
    return this.hash.buf;
  }

  public toBinaryV1(): Uint8Array {
    let size = 2;
    const contentType = this.contentType;
    if (contentType >= 0b10000000) size += 1;
    if (contentType >= 0b10000000_0000000) size += 1;
    const hash = this.hash;
    const hashBuf = hash.buf;
    size += hashBuf.length;
    const buf = new Uint8Array(size);
    buf[0] = Multicodec.CidV1;
    const offset = vuint.write(buf, 1, contentType);
    buf.set(hashBuf, offset);
    return buf;
  }

  public toText(format: multibase.BaseNameOrCode = 'base64url'): string {
    if (this.v === 0) return this.toTextV0();
    const buf = multibase.encode(format, this.toBinaryV1());
    const str = String.fromCharCode(...buf);
    return str;
  }

  public toTextV0(): string {
    const blob = this.toBinaryV0();
    const buf = multibase.encode('base58btc', blob);
    const str = String.fromCharCode(...buf);
    return str.slice(1);
  }
}
