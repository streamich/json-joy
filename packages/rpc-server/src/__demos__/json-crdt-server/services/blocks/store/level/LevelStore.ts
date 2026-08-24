import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {AvlMap} from 'sonic-forest/lib/avl/AvlMap';
import {Mutex} from '../../../../util/Mutex';
import {RpcError} from '@jsonjoy.com/rpc-error';
import type {AbstractBatchOperation, AbstractLevel} from 'abstract-level';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type * as types from '../types';

type BinStrLevel = AbstractLevel<any, string, Uint8Array>;
type BinStrLevelOperation = AbstractBatchOperation<BinStrLevel, string, Uint8Array>;

export class LevelStore implements types.Store {
  constructor(
    protected readonly kv: BinStrLevel,
    protected readonly codec: JsonValueCodec = new CborJsonValueCodec(new Writer()),
    protected readonly mutex: Mutex = new Mutex(),
  ) {}

  protected keyBase(id: string) {
    return 'b!' + id + '!';
  }

  protected endKey(id: string) {
    return this.keyBase(id) + 'e';
  }

  protected startKey(id: string) {
    return this.keyBase(id) + 's';
  }

  protected batchBase(id: string) {
    return this.keyBase(id) + 'b!';
  }

  protected batchKey(id: string, seq: number) {
    const seqFormatted = seq.toString(36).padStart(6, '0');
    return this.batchBase(id) + seqFormatted;
  }

  protected touchKeyBase() {
    return 'u!';
  }

  protected touchKey(id: string) {
    return this.touchKeyBase() + id + '!';
  }

  /** @todo Add in-memory cache on read. */
  public async get(id: string): Promise<types.StoreGetResult | undefined> {
    const key = this.endKey(id);
    try {
      const blob = await this.kv.get(key);
      if (!blob) return;
      const block = this.codec.decoder.decode(blob) as types.StoreBlock;
      return {block};
    } catch (error) {
      if (error && typeof error === 'object' && (error as any).code === 'LEVEL_NOT_FOUND') return;
      throw error;
    }
  }

  public async getSnapshot(
    id: string,
    seq: number,
  ): Promise<{snapshot: types.StoreSnapshot; batches: types.StoreBatch[]}> {
    const {kv, codec} = this;
    const {decoder} = codec;
    const key = this.startKey(id);
    try {
      const blob = await kv.get(key);
      const snapshot = decoder.decode(blob as any) as types.StoreSnapshot;
      const batches: types.StoreBatch[] = [];
      if (snapshot.seq < seq) {
        const gte = this.batchKey(id, snapshot.seq + 1);
        const lte = this.batchKey(id, seq);
        for await (const blob of kv.values({gte, lte: lte})) {
          const batch = decoder.decode(blob) as types.StoreBatch;
          batches.push(batch);
        }
      }
      return {snapshot, batches};
    } catch (error) {
      if (error && typeof error === 'object' && (error as any).code === 'LEVEL_NOT_FOUND') throw RpcError.notFound();
      throw error;
    }
  }

  public async exists(id: string): Promise<boolean> {
    const key = this.endKey(id);
    const existing = await this.kv.keys({gte: key, lte: key, limit: 1}).all();
    return existing && existing.length > 0;
  }

  public async seq(id: string): Promise<number | undefined> {
    return await this.mutex.acquire(id, async () => {
      const base = this.batchBase(id);
      const keys = await this.kv.keys({gte: base, lt: base + '~', limit: 1, reverse: true}).all();
      if (!keys || keys.length < 1) return;
      const key = keys[0].slice(base.length);
      if (!key) return;
      const seq = Number.parseInt(key, 36);
      if (seq !== seq) return;
      return seq;
    });
  }

  public async create(
    start: types.StoreSnapshot,
    end: types.StoreSnapshot,
    incomingBatch?: types.StoreIncomingBatch,
  ): Promise<types.StoreCreateResult> {
    if (incomingBatch) {
      const {patches} = incomingBatch;
      if (!Array.isArray(patches) || patches.length < 1) throw new Error('NO_PATCHES');
    }
    const {id} = end;
    const key = this.endKey(id);
    const now = end.ts;
    const encoder = this.codec.encoder;
    return await this.mutex.acquire(id, async () => {
      const existing = await this.kv.keys({gte: key, lte: key, limit: 1}).all();
      if (existing && existing.length > 0) throw new Error('BLOCK_EXISTS');
      const block: types.StoreBlock = {id, snapshot: end, tip: [], ts: now, uts: now};
      const ops: BinStrLevelOperation[] = [
        {type: 'put', key: this.startKey(id), value: encoder.encode(start)},
        {type: 'put', key, value: encoder.encode(block)},
        {type: 'put', key: this.touchKey(id), value: encoder.encode(now)},
      ];
      const response: types.StoreCreateResult = {block};
      if (incomingBatch) {
        const {cts, patches} = incomingBatch;
        const batch: types.StoreBatch = {
          seq: 0,
          ts: end.ts,
          ...(cts !== undefined ? {cts} : undefined),
          patches,
        };
        const batchBlob = encoder.encode(batch);
        const batchKey = this.batchKey(id, 0);
        ops.push({type: 'put', key: batchKey, value: batchBlob});
        response.batch = batch;
      }
      await this.kv.batch(ops);
      return response;
    });
  }

  public async push(
    snapshot0: types.StoreIncomingSnapshot,
    batch0: types.StoreIncomingBatch,
  ): Promise<types.StorePushResult> {
    const {id, seq} = snapshot0;
    const {patches} = batch0;
    if (!Array.isArray(patches) || !patches.length) throw new Error('NO_PATCHES');
    return await this.mutex.acquire(id, async () => {
      const block = await this.get(id);
      if (!block) throw RpcError.notFound();
      const blockData = block.block;
      const snapshot = blockData.snapshot;
      if (snapshot.seq + 1 !== seq) throw new Error('PATCH_SEQ_INV');
      const now = Date.now();
      blockData.uts = now;
      snapshot.seq = seq;
      snapshot.ts = now;
      snapshot.blob = snapshot0.blob;
      const encoder = this.codec.encoder;
      const batch1: types.StoreBatch = {
        seq,
        ts: now,
        ...(batch0.cts !== undefined ? {cts: batch0.cts} : undefined),
        patches,
      };
      const ops: BinStrLevelOperation[] = [
        {type: 'put', key: this.endKey(id), value: encoder.encode(blockData)},
        {type: 'put', key: this.batchKey(id, seq), value: encoder.encode(batch1)},
        {type: 'put', key: this.touchKey(id), value: encoder.encode(now)},
      ];
      await this.kv.batch(ops);
      return {snapshot, batch: batch1};
    });
  }

  public async compact(id: string, to: number, advance: types.Advance): Promise<void> {
    const {kv, codec} = this;
    const {encoder, decoder} = codec;
    const key = this.startKey(id);
    await this.mutex.acquire(id + '.trunc', async () => {
      const start = decoder.decode((await kv.get(key)) as any) as types.StoreSnapshot;
      if (start.seq >= to) return;
      const gt = this.batchKey(id, start.seq);
      const lte = this.batchKey(id, to);
      const ops: BinStrLevelOperation[] = [];
      async function* iterator() {
        for await (const [key, blob] of kv.iterator({gt, lte})) {
          ops.push({type: 'del', key});
          yield decoder.decode(blob) as types.StoreBatch;
        }
      }
      start.blob = await advance(start.blob, iterator());
      start.ts = Date.now();
      start.seq = to;
      ops.push({type: 'put', key, value: encoder.encode(start)});
      await kv.batch(ops);
    });
  }

  public async scan(id: string, min: number, max: number): Promise<types.StoreBatch[]> {
    const from = this.batchKey(id, min);
    const to = this.batchKey(id, max);
    const list: types.StoreBatch[] = [];
    const decoder = this.codec.decoder;
    for await (const blob of this.kv.values({gte: from, lte: to})) {
      const batch = decoder.decode(blob) as types.StoreBatch;
      list.push(batch);
    }
    return list;
  }

  public async remove(id: string): Promise<boolean> {
    const exists = await this.exists(id);
    if (!exists) return false;
    const base = this.keyBase(id);
    const touchKey = this.touchKey(id);
    const kv = this.kv;
    const success = await this.mutex.acquire(id, async () => {
      await Promise.allSettled([
        kv.clear({
          gte: base,
          lte: base + '~',
        }),
        kv.del(touchKey),
      ]);
      return true;
    });
    return success;
  }

  /** @todo Make this method async and return something useful. */
  public stats(): {blocks: number; batches: number} {
    return {blocks: 0, batches: 0};
  }

  /**
   * @todo Need to add GC tests.
   */
  public async removeAccessedBefore(ts: number, limit: number = 10): Promise<void> {
    const from = this.touchKey('');
    const to = from + '~';
    const decoder = this.codec.decoder;
    let cnt = 0;
    for await (const [key, blob] of this.kv.iterator({gte: from, lte: to})) {
      const value = Number(decoder.decode(blob));
      if (ts >= value) continue;
      cnt++;
      const id = key.slice(from.length);
      this.remove(id).catch(() => {});
      if (cnt >= limit) return;
    }
  }

  public async removeOldest(x: number): Promise<void> {
    const heap = new AvlMap<number, string>((a, b) => b - a);
    const keyBase = this.touchKeyBase();
    const gte = keyBase + '';
    const lte = keyBase + '~';
    const kv = this.kv;
    const decoder = this.codec.decoder;
    let first = heap.first();
    for await (const [key, value] of kv.iterator({gte, lte})) {
      const time = decoder.decode(value) as number;
      if (heap.size() < x) {
        heap.set(time, key);
        continue;
      }
      if (!first) first = heap.first();
      if (first && time < first.k) {
        heap.del(first.k);
        first = undefined;
        heap.set(time, key);
      }
    }
    if (!heap.size()) return;
    for (const {v} of heap.entries()) {
      try {
        const id = v.slice(keyBase.length, -1);
        await this.remove(id);
      } catch {}
    }
  }

  public async stop() {
    await this.kv.close();
  }
}
