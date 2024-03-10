import {CborEncoderDag} from '../../json-pack/cbor/CborEncoderDag';
import {CborDecoderDag} from '../../json-pack/cbor/CborDecoderDag';
import {Cid} from '../multiformats';
import {JsonValueCodec} from '../../json-pack/codecs/types';
import {EncodingFormat} from '../../json-pack/constants';
import {writer} from './writer';

const encoder = new (class extends CborEncoderDag {
  public writeUnknown(val: unknown): void {
    if (val instanceof Cid) encoder.writeTag(42, val.toBinary());
    else throw new Error('UNKNOWN_VALUE');
  }
})(writer);

const decoder = new class extends CborDecoderDag {
  public readTagRaw(tag: number): Cid | unknown {
    const value = this.val();
    if (tag === 42) return Cid.fromBinary(value as Uint8Array);
    throw new Error('UNKNOWN_TAG');
  }
}

export const cbor: JsonValueCodec = {
  id: 'DAG-CBOR',
  format: EncodingFormat.Cbor,
  encoder,
  decoder,
};
