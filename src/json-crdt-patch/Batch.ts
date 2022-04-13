import {Patch} from './Patch';

export class Batch {
  constructor(public patches: Patch[]) {}

  public rebase(serverTime: number): Batch {
    const transformHorizon: number = serverTime;
    const length = this.patches.length;
    const patches: Patch[] = [];
    for (let i = 0; i < length; i++) {
      const patch = patches[i];
      patches.push(patch.rebase(serverTime, transformHorizon));
      serverTime += patch.span();
    }
    return new Batch(patches);
  }

  public clone(): Batch {
    return new Batch(this.patches.map((patch) => patch.clone()));
  }

  public flush(): Patch[] {
    const patches = this.patches;
    this.patches = [];
    return patches;
  }
}
