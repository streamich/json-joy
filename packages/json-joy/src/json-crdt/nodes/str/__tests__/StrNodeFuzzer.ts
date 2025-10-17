import {equal} from 'assert';
import {type ITimespanStruct, type ITimestampStruct, ClockVector, printTs, ts} from '../../../../json-crdt-patch/clock';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {randomSessionId} from '../../../model/util';
import {StrNode} from '../StrNode';
import {printTree, type Printable} from 'tree-dump';

const printOp = (op: Op) => {
  if ('content' in op) {
    return `ins ${printTs(op.after)} ${JSON.stringify(op.content)}`;
  } else {
    return `del ${op.range.map((r) => printTs(r) + '!' + r.span).join(', ')}`;
  }
};

const printPatch = (tab: string, ops: Op[]) => {
  return (
    'patch' +
    printTree(
      tab,
      ops.map((op) => (tab) => printOp(op)),
    )
  );
};

interface OpInsert {
  after: ITimestampStruct;
  stamp: ITimestampStruct;
  content: string;
}

interface OpDelete {
  range: ITimespanStruct[];
}

type Op = OpInsert | OpDelete;

class StrNodeSite implements Printable {
  public readonly rga: StrNode;
  public readonly clock = new ClockVector(randomSessionId(), 0);
  public readonly patches: Op[][] = [];

  constructor(protected readonly fuzzer: StrNodeFuzzer) {
    this.rga = new StrNode(fuzzer.str.id);
    this.apply(fuzzer.prelude);
  }

  public apply(ops: Op[]) {
    const clock = this.clock;
    for (const op of ops) {
      if ('content' in op) {
        clock.observe(op.after, 1);
        clock.observe(op.stamp, op.content.length);
        this.rga.ins(op.after, op.stamp, op.content);
      } else {
        this.rga.delete(op.range);
      }
    }
  }

  public randomOperation(): Op {
    const rga = this.rga;
    const fuzzer = this.fuzzer;
    const doInsert = !rga.length() || fuzzer.random() > fuzzer.options.deleteProbability;
    const rgaLength = rga.length();
    if (doInsert) {
      const pos = fuzzer.randomInt(0, rgaLength - 1);
      const length = fuzzer.randomInt(fuzzer.options.minInsertLength, fuzzer.options.maxInsertLength);
      const after = rga.find(pos) || rga.id;
      const content = fuzzer.generateString(length);
      const stamp = this.clock.tick(length);
      return {after, stamp, content};
    } else {
      const pos = fuzzer.randomInt(0, rgaLength - 1);
      const length = Math.min(fuzzer.randomInt(0, rgaLength - pos), fuzzer.options.maxDeleteLength);
      const range = rga.findInterval(pos, length);
      return {range};
    }
  }

  public randomPatch(min: number = 0, max: number = 10): Op[] {
    const ops: Op[] = [];
    const length = this.fuzzer.randomInt(min, max);
    for (let i = 0; i < length; i++) ops.push(this.randomOperation());
    return ops;
  }

  public toString(tab?: string): string {
    return (
      'StrNodeSite' +
      printTree(tab, [
        (tab) => 'clock ' + this.clock.toString(tab),
        (tab) =>
          'patches ' +
          printTree(
            tab,
            this.patches.map((patch) => (tab) => printPatch(tab, patch)),
          ),
      ])
    );
  }
}

export interface StrNodeFuzzerOptions {
  /**
   * Minimum number of operations in the prelude,
   * before parallel editing sessions.
   */
  minPreludeLength: number;

  /**
   * Maximum number of operations in the prelude, before
   * parallel editing sessions.
   */
  maxPreludeLength: number;

  /**
   * Minimum number of sites, should be at least 2.
   */
  minSiteCount: number;

  /**
   * Maximum number of sites, should be at least 2.
   */
  maxSiteCount: number;

  /**
   * Minimum number of operations each site generates in its editing patch
   */
  minPatchLength: number;

  /**
   * Maximum number of operations each site generates in its editing patch.
   */
  maxPatchLength: number;

  /**
   * Minimum number of editing sessions to execute.
   */
  minEditingSessionCount: number;

  /**
   * Maximum number of editing sessions to execute.
   */
  maxEditingSessionCount: number;

  /**
   * Maximum number of characters to delete in a single delete operation.
   */
  maxDeleteLength: number;

  /**
   * Probability of generating a delete operation instead of an insert
   * operation. Should be between 0 and 1. Delete operations are considered
   * only when the RGA is not empty.
   */
  deleteProbability: number;

  /**
   * Minimum number of characters to insert in a single insert operation.
   * Should be at least 1.
   */
  minInsertLength: number;

  /**
   * Maximum number of characters to insert in a single insert operation.
   */
  maxInsertLength: number;
}

export class StrNodeFuzzer extends Fuzzer implements Printable {
  public readonly str = new StrNode(ts(randomSessionId(), 0));
  public prelude: Op[] = [];
  public readonly sites: StrNodeSite[] = [new StrNodeSite(this)];
  public readonly options: StrNodeFuzzerOptions;

  constructor(opts: Partial<StrNodeFuzzerOptions> = {}, seed?: Buffer) {
    super(seed);
    this.options = {
      minPreludeLength: 0,
      maxPreludeLength: 10,
      minSiteCount: 2,
      maxSiteCount: 10,
      minPatchLength: 0,
      maxPatchLength: 10,
      minEditingSessionCount: 1,
      maxEditingSessionCount: 10,
      maxDeleteLength: 1000,
      deleteProbability: 0.5,
      minInsertLength: 1,
      maxInsertLength: 10,
      ...opts,
    };
  }

  public generateString(length: number): string {
    const char = this.pick(['a', 'b', 'c', 'd']);
    return char.repeat(length);
  }

  public generatePrelude(): void {
    this.prelude = this.sites[0].randomPatch(this.options.minPreludeLength, this.options.maxPreludeLength);
    this.sites[0].apply(this.prelude);
    const peerCount = this.randomInt(this.options.minSiteCount, this.options.maxSiteCount) - 1;
    for (let i = 0; i < peerCount; i++) this.sites.push(new StrNodeSite(this));
  }

  public assertSiteViewsEqual(): void {
    const view = this.sites[0].rga.view();
    const length = this.sites.length;
    for (let i = 1; i < length; i++) {
      const site = this.sites[i];
      equal(site.rga.view(), view, `site ${i} view mismatch`);
    }
  }

  public executeParallelEditingSession(): void {
    const sites = this.sites;
    const length = sites.length;
    for (let i = 0; i < length; i++) {
      const site = sites[i];
      const patch = site.randomPatch(this.options.minPatchLength, this.options.maxPatchLength);
      site.patches.push(patch);
      site.apply(patch);
    }
    const sessionIndex = sites[0].patches.length - 1;
    for (let i = 0; i < length; i++) {
      const site = sites[i];
      for (let j = 0; j < length; j++) {
        site.apply(sites[j].patches[sessionIndex]);
      }
    }
  }

  public executeEditingSessionsAndAssert(): void {
    const min = this.options.minEditingSessionCount;
    const max = this.options.maxEditingSessionCount;
    const length = this.randomInt(min, max);
    for (let i = 0; i < length; i++) {
      this.executeParallelEditingSession();
      this.assertSiteViewsEqual();
    }
  }

  public toString(tab?: string): string {
    return (
      'StrNodeFuzzer' +
      printTree(tab, [
        (tab) => this.sites[0].rga.toString(tab),
        (tab) => 'prelude ' + printPatch(tab, this.prelude),
        (tab) =>
          'sites ' +
          printTree(
            tab,
            this.sites.map((site) => (tab) => site.toString(tab)),
          ),
      ])
    );
  }
}
