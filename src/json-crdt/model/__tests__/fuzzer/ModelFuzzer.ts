import {Model} from '../../Model';
import {ModelSession} from './ModelSession';
import {Picker} from './Picker';
import {FuzzerOptions} from './types';
import {RandomJson} from '../../../../json-random/RandomJson';

export const defaultFuzzerOptions: FuzzerOptions = {
  startingValue: undefined,
  stringDeleteProbability: 0.2,
  maxStringDeleteLength: 64,
  maxSubstringLength: 16,
  maxStringLength: 512,
  maxConcurrentPeers: 5,
  maxPatchesPerPeer: 10,
};

export class ModelFuzzer {
  public opts: FuzzerOptions;
  public model = Model.withLogicalClock();
  public picker: Picker;

  constructor(opts: Partial<FuzzerOptions> = {}) {
    this.opts = {...defaultFuzzerOptions, ...opts};
    this.picker = new Picker(this.opts);
  }

  public setupModel() {
    const json = this.opts.startingValue === undefined ? RandomJson.generate({nodeCount: 8, rootNode: Math.random() > .5 ? 'object' : 'array'}) : this.opts.startingValue;
    this.model.api.root(json).commit();
  }

  public executeConcurrentSession(): ModelSession {
    const concurrency = Math.max(2, Math.ceil(Math.random() * this.opts.maxConcurrentPeers));
    const session = new ModelSession(this, concurrency);
    session.generateEdits();
    session.synchronize();
    return session;
  }
}
