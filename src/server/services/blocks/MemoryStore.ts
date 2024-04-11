import {Model} from '../../../json-crdt';
import {Patch} from '../../../json-crdt-patch';
import type * as types from './types';

export class MemoryStore implements types.Store {
  protected readonly blocks = new Map<string, types.StoreBlock>();
  protected readonly patches = new Map<string, types.StorePatch[]>();

  public async get(id: string): Promise<types.StoreGetResult | undefined> {
    await new Promise((resolve) => setImmediate(resolve));
    const block = this.blocks.get(id);
    if (!block) return;
    return {block};
  }

  public async create(id: string, patches: types.StorePatch[]): Promise<types.StoreApplyResult> {
    await new Promise((resolve) => setImmediate(resolve));
    if (!Array.isArray(patches)) throw new Error('NO_PATCHES');
    if (this.blocks.has(id)) throw new Error('BLOCK_EXISTS');
    const model = Model.withLogicalClock();
    let seq = -1;
    const now = Date.now();
    if (patches.length) {
      for (const patch of patches) {
        seq++;
        if (seq !== patch.seq) throw new Error('PATCHES_OUT_OF_ORDER');
        model.applyPatch(Patch.fromBinary(patch.blob));
        if (patch.created > now) patch.created = now;
      }
    }
    const block: types.StoreBlock = {
      id,
      seq: seq,
      blob: model.toBinary(),
      created: now,
      updated: now,
    };
    this.blocks.set(id, block);
    this.patches.set(id, patches);
    return {block};
  }

  public async edit(id: string, patches: types.StorePatch[]): Promise<types.StoreApplyResult> {
    await new Promise((resolve) => setImmediate(resolve));
    if (!Array.isArray(patches) || !patches.length) throw new Error('NO_PATCHES');
    const block = this.blocks.get(id);
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
    return {block};
  }

  public async history(id: string, min: number, max: number): Promise<types.StorePatch[]> {
    await new Promise((resolve) => setImmediate(resolve));
    const patches = this.patches.get(id);
    if (!patches) return [];
    return patches.slice(min, max + 1);
  }

  public async remove(id: string): Promise<boolean> {
    await new Promise((resolve) => setImmediate(resolve));
    return this.removeSync(id);
  }

  private removeSync(id: string): boolean {
    this.blocks.delete(id);
    return this.patches.delete(id);
  }

  public stats(): {blocks: number; patches: number} {
    return {
      blocks: this.blocks.size,
      patches: [...this.patches.values()].reduce((acc, v) => acc + v.length, 0),
    };
  }

  public async removeOlderThan(ts: number): Promise<void> {
    await new Promise((resolve) => setImmediate(resolve));
    for (const [id, block] of this.blocks) if (block.created < ts) this.removeSync(id);
  }
}
