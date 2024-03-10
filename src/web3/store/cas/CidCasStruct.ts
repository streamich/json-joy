import {Cid, MulticodecIpld} from '../../multiformats';
import type {JsonValueCodec} from '../../../json-pack/codecs/types';
import type {CidCas} from './CidCas';

export class CidCasStruct {
  constructor(
    protected readonly cas: CidCas,
    protected readonly ipldType: MulticodecIpld,
    protected readonly codec: JsonValueCodec,
  ) {}

  public async get(cid: Cid): Promise<unknown> {
    const blob = await this.cas.get(cid);
    return this.codec.decoder.read(blob);
  }

  public has(cid: Cid): Promise<boolean> {
    return this.cas.has(cid);
  }

  public async del(cid: Cid): Promise<void> {
    await this.cas.del(cid);
  }

  public async put(value: unknown): Promise<Cid> {
    const encoder = this.codec.encoder;
    encoder.writeAny(value);
    const blob = encoder.writer.flush();
    return this.cas.put(blob, this.ipldType);
  }
}
