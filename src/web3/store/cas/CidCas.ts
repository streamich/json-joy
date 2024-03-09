import type {Cid} from '../../multiformats';
import type {MulticodecIpld} from '../../multiformats/constants';

export interface CidCas {
  get(cid: Cid): Promise<Uint8Array>;
  has(cid: Cid): Promise<boolean>;
  del(cid: Cid): Promise<void>;
  put(value: Uint8Array, ipld?: MulticodecIpld): Promise<Cid>;
}
