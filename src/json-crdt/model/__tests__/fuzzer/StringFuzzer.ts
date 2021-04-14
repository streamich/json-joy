import {Model} from '../../Model';
import {ConcurrentSession} from './ConcurrentSession';
import {FuzzerOptions} from './types';

export const defaultFuzzerOptions: FuzzerOptions = {
  stringDeleteProbability: .2,
  maxStringDeleteLength: 64,
  maxSubstringLength: 16,
  maxStringLength: 512,
  maxConcurrentPeers: 5,
  maxPatchesPerPeer: 10,
};

export class StringFuzzer {
  public opts: FuzzerOptions;
  public model = new Model();

  constructor(opts: Partial<FuzzerOptions> = {}) {
    this.opts = {...defaultFuzzerOptions, ...opts};
  }

  public setupModel() {
    const str = this.generateSubstring();
    this.model.api.root(str).commit();
  }

  public executeConcurrentSession(): ConcurrentSession {
    const concurrency = Math.max(2, Math.ceil(Math.random() * this.opts.maxConcurrentPeers));
    const session = new ConcurrentSession(this, concurrency);
    session.generateEdits();
    session.synchronize();
    return session;
  }

  public generateCharacter(): string {
    return String.fromCharCode(Math.floor(Math.random() * 65535));
  }

  public generateSubstring(): string {
    const length = Math.floor(Math.random() * this.opts.maxSubstringLength) + 1;
    return this.generateCharacter().repeat(length);
  }
}
