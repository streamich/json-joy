import {CborEncoderDag} from '../../../json-pack/cbor/CborEncoderDag';
import {CborDecoderDag} from '../../../json-pack/cbor/CborDecoderDag';
import {Cid} from '../../multiformats';
import {writer} from './writer';
import type {IpldCodec} from '../types';

const encoder = new (class extends CborEncoderDag {
  public writeUnknown(val: unknown): void {
    if (val instanceof Cid) encoder.writeTag(42, val.toBinary());
    else throw new Error('UNKNOWN_VALUE');
  }
})(writer);

const decoder = new (class extends CborDecoderDag {
  public readTagRaw(tag: number): Cid | unknown {
    const value = this.val();
    if (tag === 42) return Cid.fromBinary(value as Uint8Array);
    throw new Error('UNKNOWN_TAG');
  }
})();

export const cbor: IpldCodec = {
  name: 'DAG-CBOR',
  encoder,
  decoder,
};
