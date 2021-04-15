import {Model} from '../..';
import {InsertStringSubstringOperation} from '../../../../json-crdt-patch/operations/InsertStringSubstringOperation';
import {Patch} from '../../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {StringType} from '../../../types/rga-string/StringType';
import {Picker} from './Picker';
import type {StringFuzzer} from './StringFuzzer';

export class StringSession {
  public picker = new Picker(this.fuzzer.opts);
  public models: Model[] = [];
  public patches: Patch[][] = [];

  public constructor(public fuzzer: StringFuzzer, public concurrency: number) {
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
    const node = this.picker.pickNode(model);
    if (!(node instanceof StringType)) throw new Error('Not a string node');
    const opcode = this.picker.pickStringOperation(node);
    const builder = new PatchBuilder(model.clock);
    const size = node.length();
    if (opcode === InsertStringSubstringOperation) {
      const substring = this.fuzzer.generateSubstring();
      const pos = !size ? 0 : Math.min(size - 1, Math.floor(Math.random() * (size + 1)));
      // console.log('pos', pos, size, node.toJson(), node.toJson().length);
      const posId = !size ? node.id : node.findId(pos);
      builder.insStr(node.id, posId, substring);
    } else {
      if (!size) return;
      const pos = Math.floor(Math.random() & size);
      let length = Math.min(size - pos, Math.ceil(Math.random() * this.fuzzer.opts.maxStringDeleteLength));
      const posId = node.findId(pos);
      builder.del(node.id, posId, length);
    }
    const patch = builder.patch;
    this.patches[peer].push(patch);
    model.applyPatch(patch);
  }

  public synchronize() {
    for (let i = 0; i < this.concurrency; i++) {
      const model = this.models[i];
      for (let j = 0; j < this.concurrency; j++) {
        const patches = this.patches[j];
        for (const patch of patches) model.applyPatch(patch);
      }
    }
  }
}
