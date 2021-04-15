import {Model} from '../..';
import {InsertStringSubstringOperation} from '../../../../json-crdt-patch/operations/InsertStringSubstringOperation';
import {Patch} from '../../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {StringType} from '../../../types/rga-string/StringType';
import type {ModelFuzzer} from './ModelFuzzer';
import {ObjectType} from '../../../types/lww-object/ObjectType';
import {SetObjectKeysOperation} from '../../../../json-crdt-patch/operations/SetObjectKeysOperation';
import {UNDEFINED_ID} from '../../../../json-crdt-patch/constants';
import {RandomJson} from '../../../../json-random/RandomJson';

export class ModelSession {
  public models: Model[] = [];
  public patches: Patch[][] = [];

  public constructor(public fuzzer: ModelFuzzer, public concurrency: number) {
    for (let i = 0; i < concurrency; i++) {
      const model = fuzzer.model.fork();
      this.models.push(model);
      this.patches.push([]);
    }
  }

  public generateEdits() {
    for (let i = 0; i < this.concurrency; i++) {
      this.generatePeerEdits(i);
    }
  }

  private generatePeerEdits(peer: number) {
    const patchCount = Math.ceil(Math.random() * this.fuzzer.opts.maxPatchesPerPeer);
    for (let patchIndex = 0; patchIndex < patchCount; patchIndex++) {
      this.generatePatchForPeer(peer);
    }
  }

  private generatePatchForPeer(peer: number) {
    const model = this.models[peer];
    const node = this.fuzzer.picker.pickNode(model);
    let patch: Patch | null = null;
    if (node instanceof StringType) patch = this.generateStringPatch(model, node);
    else if (node instanceof ObjectType) patch = this.generateObjectPatch(model, node);
    else return;
    if (!patch) return;
    this.patches[peer].push(patch);
    model.applyPatch(patch);
  }

  private generateStringPatch(model: Model, node: StringType): Patch | null {
    const opcode = this.fuzzer.picker.pickStringOperation(node);
    const builder = new PatchBuilder(model.clock);
    const size = node.length();
    if (opcode === InsertStringSubstringOperation) {
      const substring = this.fuzzer.picker.generateSubstring();
      const pos = !size ? 0 : Math.min(size - 1, Math.floor(Math.random() * (size + 1)));
      const posId = !size ? node.id : node.findId(pos);
      builder.insStr(node.id, posId, substring);
    } else {
      if (!size) return null;
      const pos = Math.floor(Math.random() & size);
      let length = Math.min(size - pos, Math.ceil(Math.random() * this.fuzzer.opts.maxStringDeleteLength));
      const posId = node.findId(pos);
      builder.del(node.id, posId, length);
    }
    return builder.patch;
  }

  private generateObjectPatch(model: Model, node: ObjectType): Patch {
    const [key, opcode] = this.fuzzer.picker.pickObjectOperation(node);
    const builder = new PatchBuilder(model.clock);
    if (opcode === SetObjectKeysOperation) {
      const json = RandomJson.generate({nodeCount: 3});
      // console.log('ADDING KEY', key, json);
      const valueId = builder.json(json);
      builder.setKeys(node.id, [[key, valueId]]);
    } else {
      // console.log('DELETING KEY', JSON.stringify(key))
      builder.setKeys(node.id, [[key, UNDEFINED_ID]]);
    }
    return builder.patch;
  }

  public synchronize() {
    for (let i = 0; i < this.concurrency; i++) {
      const model = this.models[i];
      for (let j = 0; j < this.concurrency; j++) {
        const patches = this.patches[j];
        for (const patch of patches) model.applyPatch(patch);
      }
    }

    for (let j = 0; j < this.concurrency; j++) {
      const patches = this.patches[j];
      for (const patch of patches) this.fuzzer.model.applyPatch(patch);
    }
  }
}
