import {Model} from '../../Model';
import {SessionLogical} from './SessionLogical';
import {Picker} from './Picker';
import {FuzzerOptions} from './types';
import {RandomJson} from '../../../../json-random/RandomJson';

export const defaultFuzzerOptions: FuzzerOptions = {
  startingValue: undefined,
  stringDeleteProbability: 0.2,
  binaryDeleteProbability: 0.2,
  maxStringDeleteLength: 64,
  maxSubstringLength: 16,
  maxBinaryChunkLength: 33,
  maxStringLength: 512,
  maxBinaryLength: 4049,
  maxConcurrentPeers: 5,
  maxPatchesPerPeer: 10,
};

/**
 * Implements fuzzing for JSON CRDT model with logical vector clock.
 * Some number of peers generate random number of patches, each patch
 * has random number of operations, executed on random JSON CRDT nodes.
 * Then all patches from all peers are merged in different order and we
 * check that all peers arrive at the same state. That finishes one
 * *editing session*, which is then repeated.
 */
export class Fuzzer {
  public opts: FuzzerOptions;
  public model = Model.withLogicalClock();
  public picker: Picker;

  constructor(opts: Partial<FuzzerOptions> = {}) {
    this.opts = {...defaultFuzzerOptions, ...opts};
    this.picker = new Picker(this.opts);
  }

  public setupModel() {
    const json =
      this.opts.startingValue === undefined
        ? RandomJson.generate({nodeCount: 8, rootNode: Math.random() > 0.5 ? 'object' : 'array'})
        : this.opts.startingValue;
    this.model.api.root(json).commit();
  }

  public executeConcurrentSession(): SessionLogical {
    const concurrency = Math.max(2, Math.ceil(Math.random() * this.opts.maxConcurrentPeers));
    const session = new SessionLogical(this, concurrency);
    session.generateEdits();
    session.synchronize();
    return session;
  }
}
