import {Model} from '../../Model';
import {StringSession} from './StringSession';
import {FuzzerOptions} from './types';

export const defaultFuzzerOptions: FuzzerOptions = {
  stringDeleteProbability: 0.2,
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
    this.model.api.root({}).commit();
  }

  public executeConcurrentSession(): StringSession {
    const concurrency = Math.max(2, Math.ceil(Math.random() * this.opts.maxConcurrentPeers));
    const session = new StringSession(this, concurrency);
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
