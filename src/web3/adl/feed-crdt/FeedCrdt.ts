import {CID} from '../../cid/index.js';
import {BehaviorSubject} from 'rxjs';
import {type HlcFactory, toDto} from '../../hlc/index.js';
import type {CAS} from '../types';
import type {FeedFrameDto, FeedInsertOp} from './types.js';

export class FeedBlock {
  public prev: FeedBlock | null = null;
  constructor(public cid: CID, public data: FeedFrameDto) {}
}

const enum CONST {
  ENTRIES_PER_BLOCK_THRESHOLD = 25,
}

export interface FeedCrdtDependencies {
  cas: CAS;
  hlc: HlcFactory;
}

export class FeedCrdt {
  public head: FeedBlock | null = null;
  public tail: FeedBlock | null = null;

  public dirtyEntries: FeedInsertOp[] = [];
  public readonly dirtyDeletes: Set<string> = new Set();
  public entries = new BehaviorSubject<FeedInsertOp[]>([]);
  public readonly deletes: Set<string> = new Set();

  constructor(protected readonly deps: FeedCrdtDependencies) {}

  public insert(value: string): void {
    if (this.deletes.has(value)) return;
    const id = toDto(this.deps.hlc.inc());
    const insert: FeedInsertOp = [value, id];
    this.dirtyEntries.push(insert);
    const entries = this.entries.getValue();
    entries.push(insert);
    this.entries.next(entries);
  }

  public delete(value: string): void {
    this.dirtyDeletes.add(value);
    this.dirtyEntries = this.dirtyEntries.filter(entry => entry[0] !== value);
    this.deletes.add(value);
    const entries = this.entries.getValue();
    this.entries.next(entries.filter(entry => entry[0] !== value));
  }

  public async loadBlock(cid: CID): Promise<FeedBlock> {
    const data = await this.deps.cas.get(cid);
    const dto = decoder.decode(data) as FeedFrameDto;
    return new FeedBlock(cid, dto);
  }

  public async loadHead(cid: CID): Promise<void> {
    this.head = null;
    this.tail = null;
    this.dirtyEntries = [];
    this.dirtyDeletes.clear();
    this.entries.next([]);
    this.deletes.clear();
    this.head = this.tail = await this.loadBlock(cid);
    const dto = this.head!.data;
    const [entries, deletes] = dto;
    for (const del of deletes) this.deletes.add(del);
    const list: FeedInsertOp[] = [];
    for (const entry of entries) if (!this.deletes.has(entry[0])) list.push(entry);
    this.entries.next(list);
  }

  public async loadMore(): Promise<void> {
    if (!this.tail) return;
    const prevCid = this.tail.data[3];
    if (!prevCid) return;
    const cid = CID.decode(prevCid);
    const block = await this.loadBlock(cid);
    this.tail.prev = block;
    this.tail = block;
    const dto = block.data;
    const [entries, deletes] = dto;
    for (const del of deletes) this.deletes.add(del);
    const list: FeedInsertOp[] = [];
    for (const entry of entries) if (!this.deletes.has(entry[0])) list.push(entry);
    this.entries.next([...list, ...this.entries.getValue()]);
  }

  public hasMoreBlocks(): boolean {
    return !!this.tail && !!this.tail.data[3];
  }

  public async loadAll(): Promise<void> {
    while (this.hasMoreBlocks()) await this.loadMore();
  }

  public async save(): Promise<[head: CID, affected: CID[]]> {
    const hasUnsavedChanges = !!this.dirtyEntries.length || !!this.dirtyDeletes.size;
    if (!hasUnsavedChanges && this.head) return [this.head.cid, []];
    const doCreateNewBlock = !this.head || this.head.data[0].length >= CONST.ENTRIES_PER_BLOCK_THRESHOLD;
    if (doCreateNewBlock) {
      const entries = this.dirtyEntries;
      const deletes = [...this.dirtyDeletes.values()];
      const seq = this.head ? this.head.data[2] + 1 : 0;
      const prevCid = this.head ? this.head.cid.bytes : null;
      const dto: FeedFrameDto = [entries, deletes, seq, prevCid];
      const data = encoder.encode(dto);
      const cid = await this.deps.cas.put(data);
      const block = new FeedBlock(cid, dto);
      block.prev = this.head;
      this.head = block;
      this.dirtyEntries = [];
      this.dirtyDeletes.clear();
      return [cid, [cid]];
    }
    const head = this.head!;
    const lastDto = head.data;
    const dto: FeedFrameDto = [
      [...lastDto[0], ...this.dirtyEntries],
      [...lastDto[1], ...this.dirtyDeletes.values()],
      lastDto[2],
      lastDto[3],
    ];
    const data = encoder.encode(dto);
    const cid = await this.deps.cas.put(data);
    head.cid = cid;
    head.data = dto;
    this.dirtyEntries = [];
    this.dirtyDeletes.clear();
    return [cid, [cid]];
  }
}
