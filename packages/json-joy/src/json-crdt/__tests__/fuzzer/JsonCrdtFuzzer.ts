import {Model} from '../../model/Model';
import {SessionLogical} from './SessionLogical';
import {Picker} from './Picker';
import type {FuzzerOptions} from './types';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random/RandomJson';
import {generateInteger} from './util';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import type {Patch} from '../../../json-crdt-patch';

export const defaultFuzzerOptions: FuzzerOptions = {
  startingValue: undefined,
  stringDeleteProbability: 0.2,
  binaryDeleteProbability: 0.2,
  maxStringDeleteLength: 64,
  maxSubstringLength: 16,
  maxBinaryChunkLength: 33,
  maxStringLength: 512,
  maxBinaryLength: 4049,
  concurrentPeers: [1, 6],
  patchesPerPeer: [0, 12],
  testCodecs: true,
  collectPatches: false,
};

export class JsonCrdtFuzzer {
  public opts: FuzzerOptions;
  public model: Model;
  public picker: Picker;
  public patches: Patch[] = [];

  constructor(opts: Partial<FuzzerOptions> = {}) {
    this.opts = {...defaultFuzzerOptions, ...opts};
    this.model = Model.create();
    this.picker = new Picker(this.opts);
  }

  public setupModel() {
    const json =
      this.opts.startingValue === undefined
        ? RandomJson.generate({nodeCount: 8, rootNode: Math.random() > 0.5 ? 'object' : 'array'})
        : this.opts.startingValue;
    const builder = new PatchBuilder(this.model.clock);
    builder.root(builder.json(json));
    const patch = builder.flush();
    this.patches.push(patch);
    this.model.applyPatch(patch);
  }

  public executeConcurrentSession(): SessionLogical {
    const concurrency = generateInteger(...this.opts.concurrentPeers);
    const session = new SessionLogical(this, concurrency);
    session.generateEdits();
    session.synchronize();
    if (this.opts.collectPatches) for (const patches of session.patches) this.patches.push(...patches);
    return session;
  }
}
