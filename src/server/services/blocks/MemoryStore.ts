import {Model} from '../../../json-crdt';
import {Patch} from '../../../json-crdt-patch';
import type * as types from './types';

const tick = new Promise((resolve) => setImmediate(resolve));

export class MemoryStore implements types.Store {
  protected readonly models = new Map<string, types.StoreModel>();
  protected readonly patches = new Map<string, types.StorePatch[]>();

  public async get(id: string): Promise<types.StoreGetResult | undefined> {
    await tick;
    const model = this.models.get(id);
    if (!model) return;
    return {model};
  }

  public async seq(id: string): Promise<number | undefined> {
    await tick;
    return this.models.get(id)?.seq;
  }

  public async create(id: string, model: types.StoreModel, patches: types.StorePatch[]): Promise<void> {
    await tick;
    if (!Array.isArray(patches)) throw new Error('NO_PATCHES');
    if (this.models.has(id)) throw new Error('BLOCK_EXISTS');
    this.models.set(id, model);
    this.patches.set(id, patches);
  }

  public async edit(id: string, patches: types.StorePatch[]): Promise<types.StoreApplyResult> {
    await tick;
    if (!Array.isArray(patches) || !patches.length) throw new Error('NO_PATCHES');
    const block = this.models.get(id);
    const existingPatches = this.patches.get(id);
    if (!block || !existingPatches) throw new Error('BLOCK_NOT_FOUND');
    let seq = patches[0].seq;
    const diff = seq - block.seq - 1;
    if (block.seq + 1 < seq) throw new Error('PATCH_SEQ_TOO_HIGH');
    const model = Model.fromBinary(block.blob);
    for (const patch of patches) {
      if (seq !== patch.seq) throw new Error('PATCHES_OUT_OF_ORDER');
      model.applyPatch(Patch.fromBinary(patch.blob));
      patch.seq -= diff;
      seq++;
    }
    block.seq += patches.length;
    block.blob = model.toBinary();
    block.updated = Date.now();
    for (const patch of patches) existingPatches.push(patch);
    return {model: block};
  }

  public async history(id: string, min: number, max: number): Promise<types.StorePatch[]> {
    await tick;
    const patches = this.patches.get(id);
    if (!patches) return [];
    return patches.slice(min, max + 1);
  }

  public async remove(id: string): Promise<boolean> {
    await tick;
    return this.removeSync(id);
  }

  private removeSync(id: string): boolean {
    this.models.delete(id);
    return this.patches.delete(id);
  }

  public stats(): {blocks: number; patches: number} {
    return {
      blocks: this.models.size,
      patches: [...this.patches.values()].reduce((acc, v) => acc + v.length, 0),
    };
  }

  public async removeOlderThan(ts: number): Promise<void> {
    await tick;
    for (const [id, block] of this.models) if (block.created < ts) this.removeSync(id);
  }

  public async removeAccessedBefore(ts: number): Promise<void> {
    await tick;
    for (const [id, block] of this.models) if (block.updated < ts) this.removeSync(id);
  }
}
