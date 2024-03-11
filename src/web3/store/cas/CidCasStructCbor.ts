import {MulticodecIpld} from '../../multiformats';
import {CidCasStruct} from './CidCasStruct';
import {cbor} from '../../codec/codecs/cbor';
import type {CidCas} from './CidCas';
import type {IpldCodec} from '../../codec';

export class CidCasStructCbor extends CidCasStruct {
  constructor(
    protected readonly cas: CidCas,
    protected readonly codec: IpldCodec = cbor,
  ) {
    super(cas, MulticodecIpld.Cbor, codec);
  }
}
