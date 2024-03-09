import {Cid} from '../../multiformats';
import {MulticodecIpld} from '../../multiformats/constants';
import type {CidCas} from './CidCas';

export class CidCasMemory implements CidCas {
  protected store: Map<string, Uint8Array> = new Map();

  public async get(cid: Cid): Promise<Uint8Array> {
    const key = cid.toText();
    await new Promise(resolve => setTimeout(resolve, 1));
    const value = this.store.get(key);
    if (!value) throw new Error(`No value for CID: ${key}`);
    return value;
  }

  public async has(cid: Cid): Promise<boolean> {
    const key = cid.toText();
    await new Promise(resolve => setTimeout(resolve, 1));
    return this.store.has(key);
  }

  public async del(cid: Cid): Promise<void> {
    const key = cid.toText();
    await new Promise(resolve => setTimeout(resolve, 1));
    this.store.delete(key);
  }

  public async put(value: Uint8Array, ipldType: MulticodecIpld = MulticodecIpld.Raw): Promise<Cid> {
    const cid = await Cid.fromData(value, ipldType);
    await new Promise(resolve => setTimeout(resolve, 1));
    const key = cid.toText();
    this.store.set(key, value);
    return cid;
  }
}
