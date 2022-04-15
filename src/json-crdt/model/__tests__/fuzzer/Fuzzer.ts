import {Model} from '../../Model';
import {SessionLogical} from './SessionLogical';
import {Picker} from './Picker';
import {FuzzerOptions} from './types';
import {RandomJson} from '../../../../json-random/RandomJson';
import {SessionServer} from './SessionServer';
import {generateInteger} from './util';

export const defaultFuzzerOptions: FuzzerOptions = {
  useServerClock: false,
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
};

export class Fuzzer {
  public opts: FuzzerOptions;
  public model: Model;
  public picker: Picker;

  constructor(opts: Partial<FuzzerOptions> = {}) {
    this.opts = {...defaultFuzzerOptions, ...opts};
    this.model = this.opts.useServerClock ? Model.withServerClock() : Model.withLogicalClock();
    this.picker = new Picker(this.opts);
  }

  public setupModel() {
    const json =
      this.opts.startingValue === undefined
        ? RandomJson.generate({nodeCount: 8, rootNode: Math.random() > 0.5 ? 'object' : 'array'})
        : this.opts.startingValue;
    this.model.api.root(json).commit();
  }

  public executeConcurrentSession(): SessionLogical | SessionServer {
    const concurrency = generateInteger(...this.opts.concurrentPeers);
    const session = this.opts.useServerClock ? new SessionServer(this, concurrency) : new SessionLogical(this, concurrency);
    session.generateEdits();
    session.synchronize();
    return session;
  }
}
