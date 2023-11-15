import {MemoryStore} from './MemoryStore';
import {StorePatch} from './types';
import type {Services} from '../Services';
import {RpcError, RpcErrorCodes} from '../../../reactive-rpc/common/rpc/caller';

export class BlocksServices {
  protected readonly store = new MemoryStore();

  constructor(protected readonly services: Services) {}

  public async create(id: string, patches: StorePatch[]) {
    const {store} = this;
    const {block} = await store.create(id, patches);
    return {block};
  }

  public async get(id: string) {
    const {store} = this;
    const result = await store.get(id);
    if (!result) throw RpcError.fromCode(RpcErrorCodes.NOT_FOUND);
    const {block} = result;
    return {block};
  }

  public async remove(id: string) {
    await this.store.remove(id);
  }

  public async apply(id: string, patches: any[]) {
    const {store} = this;
    const {block} = await store.edit(id, patches);
    return {block};
  }
}
