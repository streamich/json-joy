import {Encoder as JsonEncoder} from '../../../codec/json/Encoder';
import {Decoder as JsonDecoder} from '../../../codec/json/Decoder';
import {Encoder as CompactEncoder} from '../../../codec/compact/Encoder';
import {Decoder as CompactDecoder} from '../../../codec/compact/Decoder';
import {Encoder as BinaryEncoder} from '../../../codec/binary/Encoder';
import {Decoder as BinaryDecoder} from '../../../codec/binary/Decoder';
import {SessionLogical} from './SessionLogical';
import {Batch} from '../../../../json-crdt-patch/Batch';
import {Patch} from '../../../../json-crdt-patch/Patch';
import {encode} from '../../../../json-crdt-patch/codec/json/encode';

const jsonEncoder = new JsonEncoder();
const jsonDecoder = new JsonDecoder();
const compactEncoder = new CompactEncoder();
const compactDecoder = new CompactDecoder();
const binaryEncoder = new BinaryEncoder();
const binaryDecoder = new BinaryDecoder();

export class SessionServer extends SessionLogical {
  public synchronize() {
    for (let i = 0; i < this.models.length; i++) {
      this.models[i] = this.fuzzer.model.fork();
    }

    for (const patches of this.patches) {
      if (Math.random() < 0.5) this.fuzzer.model = jsonDecoder.decode(jsonEncoder.encode(this.fuzzer.model));
      if (Math.random() < 0.5) this.fuzzer.model = compactDecoder.decode(compactEncoder.encode(this.fuzzer.model));
      if (Math.random() < 0.5) this.fuzzer.model = binaryDecoder.decode(binaryEncoder.encode(this.fuzzer.model));

      const batch = new Batch(patches);
      if (!batch.getId()) continue;
      const rebasedBatch = batch.rebase(this.fuzzer.model.clock.time);
      this.fuzzer.model.applyBatch(rebasedBatch);
      for (const model of this.models) {
        const rebasedPatch2 = batch.rebase(model.clock.time);
        model.applyBatch(rebasedPatch2);
      }
    }
  }
}
