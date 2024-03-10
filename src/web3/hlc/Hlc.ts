import type {HybridLogicalClock} from './types';

/**
 * @todo Rename this such that it includes "timestamp" in the name.
 */
export class Hlc implements HybridLogicalClock {
  public readonly ts: number;
  public readonly seq: number;
  public readonly node: number;

  constructor(ts: number, seq: number, node: number) {
    this.ts = ts;
    this.seq = seq;
    this.node = node;
  }
}
