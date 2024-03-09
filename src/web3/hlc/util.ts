import {Hlc} from './Hlc';
import type {HlcDto, HybridLogicalClock} from './types';

export const create = (now: number, node: number): HybridLogicalClock => {
  return new Hlc(now, 0, node);
};

export const toDto = (hlc: HybridLogicalClock): HlcDto => [hlc.ts, hlc.seq, hlc.node];

export const inc = (local: HybridLogicalClock, now: number): HybridLogicalClock => {
  if (now > local.ts) return new Hlc(now, 0, local.node);
  return new Hlc(local.ts, local.seq + 1, local.node);
};

export const cmp = (a: HybridLogicalClock, b: HybridLogicalClock): number => {
  if (a.ts !== b.ts) return a.ts - b.ts;
  if (a.seq !== b.seq) return a.seq - b.seq;
  return a.node - b.node;
};

export const cmpDto = ([ts1, seq1, node1]: HlcDto, [ts2, seq2, node2]: HlcDto): number => {
  if (ts1 !== ts2) return ts1 - ts2;
  if (seq1 !== seq2) return seq1 - seq2;
  return node1 - node2;
};

export const merge = (local: HybridLogicalClock, remote: HybridLogicalClock, now: number): HybridLogicalClock => {
  if (now > local.ts && now > remote.ts) return new Hlc(now, 0, local.node);
  if (local.ts === remote.ts) return new Hlc(local.ts, Math.max(local.seq, remote.seq), local.node);
  if (local.ts > remote.ts) return new Hlc(local.ts, local.seq + 1, local.node);
  return new Hlc(remote.ts, remote.seq + 1, local.node);
};
