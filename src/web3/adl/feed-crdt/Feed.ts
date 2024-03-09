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
}

export class Feed implements types.FeedApi, SyncStore<types.FeedOpInsert[]> {
  /**
   * Number of operations after which a new frame is created, otherwise the
   * operations are appended to the current frame.
   */
  public opsPerFrameThreshold: number = FeedConstraints.DefaultOpsPerFrameThreshold;

  /**
   * Emitted when the feed view changes (new entries are added or deleted).
   */
  public onChange: FanOut<void> = new FanOut();

  protected head: FeedFrame | null = null;
  protected tail: FeedFrame | null = null;
  protected unsaved: types.FeedOp[] = [];
  protected readonly deletes = new AvlSet<hlc.HlcDto>(hlc.cmpDto);
  protected readonly inserts = new AvlMap<hlc.HlcDto, types.FeedOpInsert>(hlc.cmpDto);

  constructor(protected readonly deps: FeedDependencies) {}

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
    const addToHead = headOps.length < this.opsPerFrameThreshold;
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
