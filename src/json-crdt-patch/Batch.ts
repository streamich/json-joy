import {type ITimestampStruct, printTs} from './clock';
import type {Patch} from './Patch';

export class Batch {
  constructor(public patches: Patch[]) {}

  public getId(): ITimestampStruct | undefined {
    if (!this.patches.length) return undefined;
    return this.patches[0].getId();
  }

  public rebase(serverTime: number): Batch {
    const id = this.getId();
    if (!id) throw new Error('BATCH_EMPTY');
    const transformHorizon: number = id.time;
    const patches = this.patches;
    const length = patches.length;
    const newPatches: Patch[] = [];
    for (let i = 0; i < length; i++) {
      const patch = patches[i];
      newPatches.push(patch.rebase(serverTime, transformHorizon));
      serverTime += patch.span();
    }
    return new Batch(newPatches);
  }

  public clone(): Batch {
    return new Batch(this.patches.map((patch) => patch.clone()));
  }

  public toString(tab: string = ''): string {
    const id = this.getId();
    let out = `Batch ${id ? printTs(id) : '(nil)'}\n`;
    for (let i = 0; i < this.patches.length; i++) {
      const patch = this.patches[i];
      const isLast = i === this.patches.length - 1;
      out += `${tab}${isLast ? '└─' : '├─'} ${patch.toString(tab + `${isLast ? ' ' : '│'} `)}\n`;
    }
    return out;
  }
}
