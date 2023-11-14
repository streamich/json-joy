import {Model} from "../../../json-crdt";
import {Patch} from "../../../json-crdt-patch";
import type * as types from "./types";

export class MemoryStore implements types.Store {
  protected readonly blocks = new Map<string, types.StoreBlock>();
  protected readonly patches = new Map<string, types.StorePatch[]>();

  public async get(id: string): Promise<types.StoreGetResult | undefined> {
    const block = this.blocks.get(id);
    if (!block) return;
    return {block};
  }

  public async apply(id: string, patches: types.StorePatch[]): Promise<types.StoreApplyResult> {
    if (!Array.isArray(patches) || !patches.length) throw new Error('NO_PATCHES');
    const block = this.blocks.get(id);
    if (!block && patches[0] && patches[0].seq === 0) {
      const model = Model.withLogicalClock();
      let seq = 0;
      for (const patch of patches) {
        if (seq !== patch.seq) throw new Error('PATCHES_OUT_OF_ORDER');
        model.applyPatch(Patch.fromBinary(patch.blob));
        seq++;
      }
      const now = Date.now();
      const block: types.StoreBlock = {
        id,
        seq: seq - 1,
        model: model.toBinary(),
        created: now,
        updated: now,
      };
      this.blocks.set(id, block);
      this.patches.set(id, patches);
      return {block};
    }
    if (!block) throw new Error('BLOCK_NOT_FOUND');
    let seq = patches[0].seq;
    if (block.seq < seq) throw new Error('PATCH_SEQ_TOO_HIGH');
    const model = Model.fromBinary(block.model);
    for (const patch of patches) {
      if (seq !== patch.seq) throw new Error('PATCHES_OUT_OF_ORDER');
      model.applyPatch(Patch.fromBinary(patch.blob));
      seq++;
    }
    block.seq = seq - 1;
    block.model = model.toBinary();
    block.updated = Date.now();
    return {block};
  }

  public async history(id: string, maxSeq: number, limit: number): Promise<types.StorePatch[]> {
    const patches = this.patches.get(id);
    if (!patches) return [];
    const list: types.StorePatch[] = [];
    let cnt = 0;
    for (let i = patches.length - 1; i >= 0; i--) {
      const patch = patches[i];
      if (patch.seq > maxSeq) continue;
      list.push(patch);
      cnt++;
      if (cnt >= limit) break;
    }
    return list;
  }

  public async remove(id: string): Promise<void> {
    this.blocks.delete(id);
    this.patches.delete(id);
  }
}
