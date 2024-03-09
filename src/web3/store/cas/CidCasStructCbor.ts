import {MulticodecIpld} from '../../multiformats';
import {CborJsonValueCodec} from '../../../json-pack/codecs/cbor';
import {Writer} from '../../../util/buffers/Writer';
import {CidCasStruct} from './CidCasStruct';
import type {CidCas} from './CidCas';

export class CidCasStructCbor extends CidCasStruct {
  constructor(
    protected readonly cas: CidCas,
    protected readonly codec: CborJsonValueCodec = new CborJsonValueCodec(new Writer(4096)),
  ) {
    super(cas, MulticodecIpld.Cbor, codec);
  }
}
