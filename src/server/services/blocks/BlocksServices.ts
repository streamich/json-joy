import {MemoryStore} from './MemoryStore';
import {StorePatch} from './types';
import {RpcError, RpcErrorCodes} from '../../../reactive-rpc/common/rpc/caller';
import {Model, Patch} from '../../../json-crdt';
import type {Services} from '../Services';

const BLOCK_TTL = 1000 * 60 * 60; // 1 hour

const validatePatches = (patches: StorePatch[]) => {
  for (const patch of patches) {
    if (patch.blob.length > 2000) throw RpcError.validation('patch blob too large');
    if (patch.seq > 500_000) throw RpcError.validation('patch seq too large');
  }
};

export class BlocksServices {
  protected readonly store = new MemoryStore();

  constructor(protected readonly services: Services) {}

  public async create(id: string, patches: StorePatch[]) {
    this.maybeGc();
    const {store} = this;
    validatePatches(patches);
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
    const patches = await store.history(id, 0, result.block.seq);
    const {block} = result;
    // TODO: should not return `patches`, only the "tip".
    return {block, patches};
  }

  public async getAtSeq(id: string, seq: number) {
    const {store} = this;
    const patches = await store.history(id, 0, seq);
    const model = Model.fromPatches(patches.map(p => Patch.fromBinary(p.blob)));
    return model;
  }

  public async remove(id: string) {
    await this.store.remove(id);
    this.services.pubsub.publish(`__block:${id}`, {deleted: true}).catch((error) => {
      // tslint:disable-next-line:no-console
      console.error('Error publishing block deletion', error);
    });
  }

  public async scan(id: string, offset: number | undefined, limit: number | undefined = 10, returnStartModel: boolean = limit < 0) {
    const {store} = this;
    if (typeof offset !== 'number') offset = await store.seq(id);
    let min: number = 0, max: number = 0;
    if (!limit || (Math.round(limit) !== limit)) throw RpcError.badRequest('INVALID_LIMIT');
    if (limit > 0) {
      min = Number(offset) || 0;
      max = min + limit;
    } else {
      max = Number(offset) || 0;
      min = max - limit;
    }
    if (min < 0) {
      min = 0;
      max = Math.abs(limit);
    }
    const patches = await store.history(id, min, max);
    let model: Model | undefined;
    if (returnStartModel) {
      const startPatches = await store.history(id, 0, min);
      if (startPatches.length) {
        model = Model.fromPatches(startPatches.map(p => Patch.fromBinary(p.blob)));
      }
    }
    return {patches, model};
  }

  public async edit(id: string, patches: StorePatch[]) {
    this.maybeGc();
    if (!Array.isArray(patches)) throw RpcError.validation('patches must be an array');
    if (!patches.length) throw RpcError.validation('patches must not be empty');
    const seq = patches[0].seq;
    const {store} = this;
    validatePatches(patches);
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

  private maybeGc(): void {
    if (Math.random() < 0.05)
      this.gc().catch((error) => {
        // tslint:disable-next-line:no-console
        console.error('Error running gc', error);
      });
  }

  private async gc(): Promise<void> {
    const ts = Date.now() - BLOCK_TTL;
    const {store} = this;
    await store.removeAccessedBefore(ts);
  }
}
