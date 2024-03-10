import {FeedFrame} from './FeedFrame';
import {AvlSet} from '../../../util/trees/avl/AvlSet';
import {AvlMap} from '../../../util/trees/avl/AvlMap';
import {Cid} from '../../multiformats';
import {mutex} from 'thingies/es2020/mutex';
import {FanOut} from 'thingies/es2020/fanout';
import {FeedConstraints, FeedOpType} from './constants';
import * as hlc from '../../hlc';
import type {CidCasStruct} from '../../store/cas/CidCasStruct';
import type * as types from './types';
import type {SyncStore} from '../../../util/events/sync-store';

export interface FeedDependencies {
  cas: CidCasStruct;
  hlcs: hlc.HlcFactory;

  /**
   * Number of operations after which a new frame is created, otherwise the
   * operations are appended to the current frame. Defaults to 25.
   */
  opsPerFrame?: number;
}

export class Feed implements types.FeedApi, SyncStore<types.FeedOpInsert[]> {
  public static async merge(
    cas: CidCasStruct,
    baseCid: Cid,
    forkCid: Cid,
    opsPerFrame: number = FeedConstraints.DefaultOpsPerFrameThreshold,
  ): Promise<FeedFrame[]> {
    const [commonParent, baseFrames, forkFrames] = await Feed.findForkTriangle(cas, baseCid, forkCid);
    const ops = Feed.zipOps(baseFrames, forkFrames);
    let lastFrame: FeedFrame | null = commonParent;
    const frames: FeedFrame[] = [];
    while (ops.length) {
      const frameOps = ops.splice(0, opsPerFrame);
      const prev = lastFrame ? lastFrame.cid.toBinaryV1() : null;
      const seq = lastFrame ? lastFrame.seq() + 1 : FeedConstraints.FirstFrameSeq;
      const dto: types.FeedFrameDto = [prev, seq, frameOps];
      const frame = await FeedFrame.create(dto, cas);
      frame.prev = lastFrame;
      lastFrame = frame;
      frames.push(frame);
    }
    return frames;
  }

  protected static zipOps(baseFrames: FeedFrame[], forkFrames: FeedFrame[]): types.FeedOp[] {
    const baseOps: types.FeedOp[] = [];
    const forkOps: types.FeedOp[] = [];
    for (const frame of baseFrames) baseOps.push(...frame.ops());
    for (const frame of forkFrames) forkOps.push(...frame.ops());
    const ops: types.FeedOp[] = [];
    while (baseOps.length || forkOps.length) {
      if (!baseOps.length) {
        ops.push(...forkOps);
        break;
      }
      if (!forkOps.length) {
        ops.push(...baseOps);
        break;
      }
      const baseOp = baseOps[0];
      if (baseOp[0] === FeedOpType.Delete) {
        ops.push(baseOp);
        baseOps.shift();
        continue;
      }
      const forkOp = forkOps[0];
      if (forkOp[0] === FeedOpType.Delete) {
        ops.push(forkOp);
        forkOps.shift();
        continue;
      }
      const baseId = baseOp[1];
      const forkId = forkOp[1];
      const cmp = hlc.cmpDto(baseId, forkId);
      if (cmp === 0) {
        ops.push(baseOp);
        baseOps.shift();
        forkOps.shift();
        continue;
      } else if (cmp < 0) {
        ops.push(baseOp);
        baseOps.shift();
        continue;
      } else {
        ops.push(forkOp);
        forkOps.shift();
        continue;
      }
    }
    return ops;
  }

  protected static async findForkTriangle(
    cas: CidCasStruct,
    leftCid: Cid,
    rightCid: Cid,
  ): Promise<[commonParent: FeedFrame | null, leftFrames: FeedFrame[], rightFrames: FeedFrame[]]> {
    const leftHeadFrame = await FeedFrame.read(leftCid, cas);
    const rightHeadFrame = await FeedFrame.read(rightCid, cas);
    const leftFrames: FeedFrame[] = [leftHeadFrame];
    const rightFrames: FeedFrame[] = [rightHeadFrame];
    if (leftHeadFrame.seq() > rightHeadFrame.seq()) {
      while (true) {
        const prevCid = leftFrames[leftFrames.length - 1].prevCid();
        if (!prevCid) throw new Error('INVALID_STATE');
        const cid = Cid.fromBinaryV1(prevCid);
        const frame = await FeedFrame.read(cid, cas);
        leftFrames.push(frame);
        if (frame.seq() <= rightHeadFrame.seq()) break;
      }
    }
    if (leftHeadFrame.seq() < rightHeadFrame.seq()) {
      while (true) {
        const prevCid = rightFrames[rightFrames.length - 1].prevCid();
        if (!prevCid) throw new Error('INVALID_STATE');
        const cid = Cid.fromBinaryV1(prevCid);
        const frame = await FeedFrame.read(cid, cas);
        rightFrames.push(frame);
        if (frame.seq() <= leftHeadFrame.seq()) break;
      }
    }
    while (true) {
      const leftFrame = leftFrames[leftFrames.length - 1];
      const rightFrame = rightFrames[rightFrames.length - 1];
      if (leftFrame.seq() !== rightFrame.seq()) throw new Error('INVALID_STATE');
      if (leftFrame.seq() === 0) return [null, leftFrames, rightFrames];
      if (leftFrame.cid.is(rightFrame.cid)) {
        leftFrames.pop();
        rightFrames.pop();
        return [leftFrame, leftFrames, rightFrames];
      }
      const prevLeft = leftFrame.prevCid();
      const prevRight = rightFrame.prevCid();
      if (!prevLeft || !prevRight) throw new Error('INVALID_STATE');
      leftFrames.push(await FeedFrame.read(Cid.fromBinaryV1(prevLeft), cas));
      rightFrames.push(await FeedFrame.read(Cid.fromBinaryV1(prevRight), cas));
    }
  }

  /**
   * Number of operations after which a new frame is created, otherwise the
   * operations are appended to the current frame.
   */
  public opsPerFrame: number;

  /**
   * Emitted when the feed view changes (new entries are added or deleted).
   */
  public onChange: FanOut<void> = new FanOut();

  protected head: FeedFrame | null = null;
  protected tail: FeedFrame | null = null;
  protected unsaved: types.FeedOp[] = [];
  protected readonly deletes = new AvlSet<hlc.HlcDto>(hlc.cmpDto);
  protected readonly inserts = new AvlMap<hlc.HlcDto, types.FeedOpInsert>(hlc.cmpDto);

  constructor(protected readonly deps: FeedDependencies) {
    this.opsPerFrame = deps.opsPerFrame ?? FeedConstraints.DefaultOpsPerFrameThreshold;
  }

  public cid(): Cid | undefined {
    return this.head?.cid;
  }

  public async loadAll(): Promise<void> {
    while (this.hasMore()) await this.loadMore();
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.unsaved = [];
    this.deletes.clear();
    if (!this.inserts.isEmpty()) {
      this.inserts.clear();
      this.onChange.emit();
    }
  }

  // ------------------------------------------------------------------ FeedApi

  public add(data: unknown): hlc.HlcDto {
    const id = this.deps.hlcs.inc();
    const idDto = hlc.toDto(id);
    const op: types.FeedOpInsert = [FeedOpType.Insert, idDto, data];
    this.unsaved.push(op);
    this.inserts.set(op[1], op);
    this.onChange.emit();
    return idDto;
  }

  public del(opId: hlc.HlcDto): void {
    const op: types.FeedOpDelete = [FeedOpType.Delete, opId];
    this.unsaved.push(op);
    this.deletes.add(opId);
    const unsavedOpIndex = this.unsaved.findIndex(
      ([type, id]) => type === FeedOpType.Insert && hlc.cmpDto(opId, id) === 0,
    );
    if (unsavedOpIndex !== -1) this.unsaved.splice(unsavedOpIndex, 1);
    const deleted = this.inserts.del(opId);
    if (deleted) this.onChange.emit();
  }

  @mutex
  public async loadHead(cid: Cid): Promise<void> {
    this.clear();
    const frame = await FeedFrame.read(cid, this.deps.cas);
    this.head = this.tail = frame;
    this.ingestFrameData(frame);
  }

  @mutex
  public async loadMore(): Promise<void> {
    const tail = this.tail;
    if (!tail) return;
    const prevCidDto = tail.data[0];
    if (!prevCidDto) return;
    const cid = Cid.fromBinaryV1(prevCidDto);
    const frame = await FeedFrame.read(cid, this.deps.cas);
    tail.prev = frame;
    this.tail = frame;
    this.ingestFrameData(frame);
  }

  public hasMore(): boolean {
    return !!this.tail?.data[0];
  }

  protected ingestFrameData(frame: FeedFrame): void {
    const [, , ops] = frame.data;
    for (const op of ops) {
      switch (op[0]) {
        case FeedOpType.Insert: {
          const id = op[1];
          if (this.deletes.has(id)) continue;
          this.inserts.set(id, op);
          break;
        }
        case FeedOpType.Delete: {
          const id = op[1];
          this.deletes.add(id);
          this.inserts.del(id);
          break;
        }
      }
    }
    this.onChange.emit();
  }

  @mutex
  public async save(): Promise<Cid> {
    const hasUnsavedChanges = !!this.unsaved.length;
    const head = this.head;
    if (!hasUnsavedChanges) {
      if (head) return head.cid;
      const dto: types.FeedFrameDto = [null, 0, []];
      const frame = await FeedFrame.create(dto, this.deps.cas);
      this.head = this.tail = frame;
      this.unsaved = [];
      return frame.cid;
    }
    if (!head) {
      const dto: types.FeedFrameDto = [null, 0, this.unsaved];
      const frame = await FeedFrame.create(dto, this.deps.cas);
      this.head = this.tail = frame;
      this.unsaved = [];
      return frame.cid;
    }
    const headOps = head.ops();
    const addToHead = headOps.length < this.opsPerFrame;
    if (addToHead) {
      const dto: types.FeedFrameDto = [head.prevCid(), head.seq(), [...headOps, ...this.unsaved]];
      const frame = await FeedFrame.create(dto, this.deps.cas);
      frame.prev = head.prev;
      this.head = frame;
      this.unsaved = [];
      return frame.cid;
    }
    const dto: types.FeedFrameDto = [head.cid.toBinaryV1(), head.seq() + 1, this.unsaved];
    const frame = await FeedFrame.create(dto, this.deps.cas);
    frame.prev = head;
    this.head = frame;
    this.unsaved = [];
    return frame.cid;
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe = (callback: () => void) => {
    const unsubscribe = this.onChange.listen(() => callback());
    return () => unsubscribe();
  };

  public readonly getSnapshot = (): types.FeedOpInsert[] => {
    const ops: types.FeedOpInsert[] = [];
    this.inserts.forEach((node) => ops.push(node.v));
    return ops;
  };
}
