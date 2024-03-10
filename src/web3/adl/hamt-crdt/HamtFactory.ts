import {Hamt, type HamtDependencies} from './Hamt';

export interface HamtFactoryDependencies extends HamtDependencies {}

export class HamtFactory {
  constructor(protected readonly deps: HamtFactoryDependencies) {}

  public make(): Hamt {
    const hamt = new Hamt(this.deps);
    return hamt;
  }
}
