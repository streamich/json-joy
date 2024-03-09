import type {Cid} from "../../multiformats";

export interface CidCas {
  get(cid: Cid): Promise<Uint8Array>;
  getMany(cids: Cid[]): Promise<Uint8Array[]>;
  del(cid: Cid): Promise<void>;
  put(value: Uint8Array): Promise<Cid>;
  putMany(values: Uint8Array[]): Promise<Cid[]>;
}
