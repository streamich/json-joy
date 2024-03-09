import type {Cid} from '../../multiformats';

export interface CidCasCbor {
  get(cid: Cid): Promise<unknown>;
  getMany(cids: Cid[]): Promise<unknown[]>;
  del(cid: Cid): Promise<void>;
  put(value: unknown): Promise<Cid>;
  putMany(values: unknown[]): Promise<Cid[]>;
}
