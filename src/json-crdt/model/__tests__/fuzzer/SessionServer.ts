import {Encoder as JsonEncoder} from '../../../codec/json/Encoder';
import {Decoder as JsonDecoder} from '../../../codec/json/Decoder';
import {Encoder as CompactEncoder} from '../../../codec/compact/Encoder';
import {Decoder as CompactDecoder} from '../../../codec/compact/Decoder';
import {Encoder as BinaryEncoder} from '../../../codec/binary/Encoder';
import {Decoder as BinaryDecoder} from '../../../codec/binary/Decoder';
import {SessionLogical} from './SessionLogical';
import {Batch} from '../../../../json-crdt-patch/Batch';
import {Patch} from '../../../../json-crdt-patch/Patch';

const jsonEncoder = new JsonEncoder();
const jsonDecoder = new JsonDecoder();
const compactEncoder = new CompactEncoder();
const compactDecoder = new CompactDecoder();
const binaryEncoder = new BinaryEncoder();
const binaryDecoder = new BinaryDecoder();

export class SessionServer extends SessionLogical {
  public synchronize() {
    const allPatches: Patch[] = [];
    for (let j = 0; j < this.concurrency; j++) {
      const patches = this.patches[j];
      if (!patches.length) continue;
      allPatches.push(...patches);
    }

    if (allPatches.length) {
      for (let i = 0; i < this.concurrency; i++) {
        let model = this.models[i];

        if (Math.random() < 0.5) model = jsonDecoder.decode(jsonEncoder.encode(model));
        if (Math.random() < 0.5) model = compactDecoder.decode(compactEncoder.encode(model));
        if (Math.random() < 0.5) model = binaryDecoder.decode(binaryEncoder.encode(model));

        const myPatches = this.patches[i];
        for (const patch of allPatches) {
          const isMyPatch = myPatches.some(p => p === patch);
          if (isMyPatch) continue;
          const rebased = patch.rebase(model.clock.time, patch.getId()!.time);
          model.applyPatch(rebased);
        }

      }

      for (const patches of this.patches) {
        const batch = new Batch(patches);
        if (!batch.getId()) continue;
        const rebasedBatch = batch.rebase(this.fuzzer.model.clock.time);
        this.fuzzer.model.applyBatch(rebasedBatch);
      }
    }
  }
}
