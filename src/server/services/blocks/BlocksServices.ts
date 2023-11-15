import {MemoryStore} from './MemoryStore';
import {StorePatch} from './types';
import {RpcError, RpcErrorCodes} from '../../../reactive-rpc/common/rpc/caller';
import type {Services} from '../Services';

export class BlocksServices {
  protected readonly store = new MemoryStore();

  constructor(protected readonly services: Services) {}

  public async create(id: string, patches: StorePatch[]) {
    const {store} = this;
    const {block} = await store.create(id, patches);
    const data = {
      block,
      patches,
    };
    this.services.pubsub.publish(`__block:${id}`, data).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Error publishing block patches', error);
    });
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
    this.services.pubsub.publish(`__block:${id}`, {deleted: true}).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Error publishing block deletion', error);
    });
  }

  public async edit(id: string, patches: any[]) {
    if (!Array.isArray(patches)) throw RpcError.validation('patches must be an array');
    if (!patches.length) throw RpcError.validation('patches must not be empty');
    const seq = patches[0].seq;
    const {store} = this;
    const {block} = await store.edit(id, patches);
    this.services.pubsub.publish(`__block:${id}`, {patches}).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Error publishing block patches', error);
    });
    const expectedBlockSeq = seq + patches.length - 1;
    const hadConcurrentEdits = block.seq !== expectedBlockSeq;
    let patchesBack: StorePatch[] = [];
    if (hadConcurrentEdits) {
      patchesBack = await store.history(id, seq, block.seq);
    }
    return {
      block,
      patches: patchesBack,
    };
  }

  public stats() {
    return this.store.stats();
  }
}
