import {Cid, MulticodecIpld} from '../../multiformats';
import type {CidCas} from './CidCas';
import type {IpldCodec} from '../../codec';

export class CidCasStruct {
  constructor(
    protected readonly cas: CidCas,
    protected readonly ipldType: MulticodecIpld,
    protected readonly codec: IpldCodec,
  ) {}

  public async get(cid: Cid): Promise<unknown> {
    const blob = await this.cas.get(cid);
    return this.codec.decoder.decode(blob);
  }

  public has(cid: Cid): Promise<boolean> {
    return this.cas.has(cid);
  }

  public async del(cid: Cid): Promise<void> {
    await this.cas.del(cid);
  }

  public async put(value: unknown): Promise<Cid> {
    const blob = this.codec.encoder.encode(value);
    return this.cas.put(blob, this.ipldType);
  }
}
