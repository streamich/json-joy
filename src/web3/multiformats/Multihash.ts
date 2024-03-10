import {cmpUint8Array} from '../../util/buffers/cmpUint8Array';
import {crypto} from '../crypto';
import * as uvint from '../util/uvint';
import {Multicodec} from './constants';

export class Multihash {
  public static async fromData(buf: Uint8Array) {
    const hash = await crypto.subtle.digest('SHA-256', buf);
    const byteLength = hash.byteLength;
    const uint8 = new Uint8Array(2 + byteLength);
    uint8[0] = Multicodec.Sha2_256;
    uint8[1] = byteLength;
    uint8.set(new Uint8Array(hash), 2);
    return new Multihash(uint8);
  }

  public static validate = (buf: Uint8Array) => {
    const length = buf.length;
    if (length < 2) throw new Error('INVALID_MULTIHASH');
    const [code, offset1] = uvint.read(buf, 0);
    switch (code) {
      case Multicodec.Sha2_256: {
        break;
      }
      default: {
        throw new Error('UNKNOWN_MULTICODEC');
      }
    }
    const [lengthHash, offset2] = uvint.read(buf, offset1);
    if (offset2 + lengthHash !== length) throw new Error('INVALID_MULTIHASH');
  };

  constructor(public readonly buf: Uint8Array) {
    Multihash.validate(buf);
  }

  public type(): number {
    const [type] = uvint.read(this.buf, 0);
    return type;
  }

  public length(): number {
    const buf = this.buf;
    const [, offset] = uvint.read(buf, 0);
    const [length] = uvint.read(buf, offset);
    return length;
  }

  public value(): Uint8Array {
    const buf = this.buf;
    const [, offset1] = uvint.read(buf, 0);
    const [, offset2] = uvint.read(buf, offset1);
    return buf.slice(offset2);
  }

  public is(hash: Multihash): boolean {
    return cmpUint8Array(this.buf, hash.buf);
  }

  public toString16(): string {
    let res = '';
    for (const byte of this.buf) {
      const hex = byte.toString(16);
      res += hex.length === 1 ? '0' + hex : hex;
    }
    return res;
  }
}
