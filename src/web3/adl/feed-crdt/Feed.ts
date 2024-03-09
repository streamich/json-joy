import {FeedFrame} from './FeedFrame';
import {AvlSet} from '../../../util/trees/avl/AvlSet';
import {Cid} from '../../multiformats';
import {mutex} from 'thingies/es2020/mutex';
import {FanOut} from 'thingies/es2020/fanout';
import {FeedConstraints, FeedOpType} from './constants';
import * as hlc from '../../hlc';
import type {CidCasCbor} from '../../store/cas/CidCasCbor';
import type * as types from './types';

export interface FeedDependencies {
  cas: CidCasCbor;
  hlc: hlc.HlcFactory;
}

export class Feed implements types.FeedApi {
  public opsPerFrameThreshold = FeedConstraints.DefaultOpsPerFrameThreshold;

  protected head: FeedFrame | null = null;
  protected tail: FeedFrame | null = null;
  protected unsavedOps: types.FeedOp[] = [];
  protected readonly deletes: AvlSet<hlc.HybridLogicalClock> = new AvlSet(hlc.cmp);

  /** Live (not deleted) feed entries. */
  public entries: types.FeedOpInsert[] = [];
  public onEntries: FanOut<types.FeedOpInsert[]> = new FanOut();

  constructor(protected readonly deps: FeedDependencies) {}

  public async loadAll(): Promise<void> {
    while (this.hasMore()) await this.loadMore();
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.unsavedOps = [];
    this.deletes.clear();
    if (this.entries.length !== 0) {
      this.entries = [];
      this.onEntries.emit(this.entries);
    }
  }

  // ------------------------------------------------------------------ FeedApi

  public add(data: unknown): hlc.Hlc {
    const id = this.deps.hlc.inc();
    const op: types.FeedOpInsert = [0, hlc.toDto(id), data];
    this.unsavedOps.push(op);
    this.entries.push(op);
    this.onEntries.emit(this.entries);
    return id;
  }

  public del(operationId: hlc.Hlc): void {
    const operationIdDto = hlc.toDto(operationId);
    const op: types.FeedOpDelete = [FeedOpType.Delete, operationIdDto];
    this.unsavedOps.push(op);
    this.deletes.add(operationId);
    const unsavedOpIndex = this.unsavedOps.findIndex(([type, id]) => (type === FeedOpType.Insert) && hlc.cmpDto(operationIdDto, id) === 0);
    if (unsavedOpIndex !== -1) this.unsavedOps.splice(unsavedOpIndex, 1);
    const entries = this.entries;
    const deleteIndex = entries.findIndex(([type, id]) => (type === FeedOpType.Insert) && hlc.cmpDto(operationIdDto, id) === 0);
    if (deleteIndex !== -1) {
      this.entries.splice(deleteIndex, 1);
      this.onEntries.emit(this.entries);
    }
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
    const [,, ops] = frame.data;
    const newEntries: types.FeedOpInsert[] = [];
    for (const op of ops) {
      switch (op[0]) {
        case FeedOpType.Insert: {
          if (this.deletes.has(hlc.fromDto(op[1]))) continue;
          newEntries.push(op);
          break;
        }
        case FeedOpType.Delete: {
          const operationId = hlc.fromDto(op[1]);
          this.deletes.add(operationId);
          break;
        }
      }
    }
    this.entries = [...newEntries, ...this.entries];
    this.onEntries.emit(this.entries);
  }

  @mutex
  public async save(): Promise<Cid> {
    const hasUnsavedChanges = !!this.unsavedOps.length;
    const head = this.head;
    if (!hasUnsavedChanges) {
      if (head) return head.cid;
      else throw new Error('SAVING_EMPTY_FEED');
    }
    if (!head) {
      const dto: types.FeedFrameDto = [null, 0, this.unsavedOps];
      const frame = await FeedFrame.create(dto, this.deps.cas);
      this.head = this.tail = frame;
      this.unsavedOps = [];
      return frame.cid;
    }
    const headOps = head.ops();
    const addToHead = headOps.length < this.opsPerFrameThreshold;
    if (addToHead) {
      const dto: types.FeedFrameDto = [head.prevCid(), head.seq(), [...headOps, ...this.unsavedOps]];
      const frame = await FeedFrame.create(dto, this.deps.cas);
      frame.prev = head.prev;
      this.head = frame;
      this.unsavedOps = [];
      return frame.cid;
    }
    const dto: types.FeedFrameDto = [head.cid.toBinaryV1(), head.seq() + 1, this.unsavedOps];
    const frame = await FeedFrame.create(dto, this.deps.cas);
    frame.prev = head;
    this.head = frame;
    this.unsavedOps = [];
    return frame.cid;
  }
}
