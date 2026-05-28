import {BehaviorSubject, defer, type Observable, Subject, type Subscription} from 'rxjs';
import {filter, finalize, map, retry, share, switchMap, takeUntil} from 'rxjs/operators';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {Model, Patch} from 'json-joy/lib/json-crdt';
import {deepEqual} from '@jsonjoy.com/json-equal/lib/deepEqual';
import {RpcError} from '@jsonjoy.com/rpc-error';
import {SESSION} from 'json-joy/lib/json-crdt-patch/constants';
import {timeout} from 'thingies/lib/timeout';
import {pubsub} from '../../pubsub';
import type {ServerBatch, ServerHistory, ServerPatch} from '../../remote/types';
import type {
  BlockId,
  LocalRepo,
  LocalRepoEvent,
  LocalRepoDeleteEvent,
  LocalRepoMergeEvent,
  LocalRepoRebaseEvent,
  LocalRepoResetEvent,
  LocalRepoSyncRequest,
  LocalRepoSyncResponse,
  LocalRepoGetResponse,
  LocalRepoGetRequest,
  LocalRepoCreateResponse,
  LocalRepoCreateRequest,
  LocalRepoGet0Response,
  LocalRepoGetIfResponse,
  LocalRepoGetIfRequest,
  LocalRepoPullResponse,
} from '../types';
import type {
  BinStrLevel,
  BinStrLevelOperation,
  BlockMeta,
  LocalBatch,
  SyncResult,
  LevelLocalRepoPubSub,
  LevelLocalRepoPubSubMessage,
  LevelLocalRepoCursor,
  BlockSyncRecord,
} from './types';
import type {CrudLocalRepoCipher} from './types';
import type {Locks} from 'thingies/lib/Locks';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';

/**
 * @todo
 *
 * 1. Implement pull loop, when WebSocket subscription cannot be established.
 */

enum Defaults {
  /**
   * The root of the block repository.
   *
   * ```
   * b!<collection>!<id>!
   * ```
   */
  BlockRepoRoot = 'b',

  /**
   * The root of the key-space where items are marked as "dirty" and need sync.
   *
   * ```
   * s!b!<collection>!<id>
   * ```
   */
  // eslint-disable-next-line
  SyncRoot = 's',

  /**
   * The metadata of the block.
   *
   * ```
   * b!<collection>!<id>!k!x
   * ```
   */
  Metadata = 'k!x',

  /**
   * The state of the latest known server-side model.
   *
   * ```
   * b!<collection>!<id>!k!m
   * ```
   */
  Model = 'k!m',

  /**
   * List of frontier patches.
   *
   * ```
   * b!<collection>!<id>!f!<time>
   * ```
   */
  Frontier = 'f',

  /**
   * List of batches verified by the server.
   *
   * ```
   * b!<collection>!<id>!h!<seq>
   * ```
   */
  Batches = 'h',

  /**
   * List of snapshots.
   *
   * ```
   * b!<collection>!<id>!s!<seq>
   * ```
   */
  // eslint-disable-next-line
  Snapshots = 's',

  /**
   * The default length of the history, if `hist` metadata property not
   * specified.
   */
  HistoryLength = 100,
}

export interface LevelLocalRepoOpts {
  /**
   * Session ID of the user on this device. The same session ID is reused across
   * all tabs.
   */
  readonly sid: number;

  /**
   * Local persistance LevelDB API.
   */
  readonly kv: BinStrLevel;

  /**
   * Optional content encryption/decryption API.
   */
  readonly cipher?: CrudLocalRepoCipher;

  /**
   * Cross-tab locking API.
   */
  readonly locks: Locks;

  /**
   * Optional observable that emits `true` when the device is connected to the
   * server and `false` when it's not.
   */
  readonly connected$?: BehaviorSubject<boolean>;

  /**
   * RPC API for communication with the server.
   */
  readonly rpc: ServerHistory;

  /**
   * Event bus.
   */
  readonly pubsub?: LevelLocalRepoPubSub;

  /**
   * Number of milliseconds after which remote calls are considered timed out.
   */
  readonly remoteTimeout?: number;

  /**
   * Minimum backoff time in milliseconds for the sync loop.
   */
  readonly syncLoopMinBackoff?: number;

  /**
   * Maximum backoff time in milliseconds for the sync loop.
   */
  readonly syncLoopMaxBackoff?: number;

  /**
   * If specified, background sync errors will be emitted here.
   */
  readonly onSyncError?: (error: Error | unknown) => void;
}

export class LevelLocalRepo implements LocalRepo {
  readonly kv: BinStrLevel;
  public readonly locks: Locks;
  public readonly sid: number;
  public readonly connected$: BehaviorSubject<boolean>;
  protected readonly pubsub: LevelLocalRepoPubSub;
  protected readonly cipher?: CrudLocalRepoCipher;
  protected readonly codec: JsonValueCodec = new CborJsonValueCodec(new Writer(1024 * 16) as any);

  constructor(protected readonly opts: LevelLocalRepoOpts) {
    this.kv = opts.kv;
    this.locks = opts.locks;
    this.sid = opts.sid;
    this.connected$ = opts.connected$ ?? new BehaviorSubject(true);
    this.pubsub = opts.pubsub ?? pubsub('level-local-repo');
    this.cipher = opts.cipher;
    this._conSub = this.connected$.subscribe((connected) => {
      if (connected && !this._remoteSyncLoopActive) this.runRemoteSyncLoop();
    });
  }

  private _conSub: Subscription | undefined = undefined;
  private _stopped = false;
  private readonly _stop$ = new Subject<void>();

  public stop(): void {
    if (this._stopped) return;
    this._remoteSyncLoopActive = false;
    clearTimeout(this._remoteSyncDelayTimer as any);
    this._stopped = true;
    this._stop$.next();
    this._stop$.complete();
    this._conSub?.unsubscribe();
  }

  protected emitSyncError(error: Error | unknown): void {
    if (this._stopped) return;
    this.opts.onSyncError?.(error);
  }

  protected emitPubSub(message: LevelLocalRepoPubSubMessage): void {
    if (this._stopped) return;
    try {
      this.pubsub.pub(message);
    } catch (error) {
      if (this._stopped) return;
      this.emitSyncError(error);
    }
  }

  // eslint-disable-next-line
  protected async encrypt(blob: Uint8Array, zip: boolean): Promise<Uint8Array> {
    // if (zip) blob = await gzip(blob);
    // if (this.cipher) blob = await this.cipher.encrypt(blob);
    return blob;
  }

  // eslint-disable-next-line
  protected async decrypt(blob: Uint8Array, zip: boolean): Promise<Uint8Array> {
    // if (this.cipher) blob = await this.cipher.decrypt(blob);
    // if (zip) blob = await ungzip(blob);
    return blob;
  }

  protected async encode(value: unknown, zip: boolean): Promise<Uint8Array> {
    const encoded = this.codec.encoder.encode(value);
    const encrypted = await this.encrypt(encoded, zip);
    return encrypted;
  }

  protected async decode(blob: Uint8Array, zip: boolean): Promise<unknown> {
    const decrypted = await this.decrypt(blob, zip);
    const decoded = this.codec.decoder.decode(decrypted);
    return decoded;
  }

  /** @todo Encrypt collection and key. */
  public async blockKeyBase(id: BlockId): Promise<string> {
    return Defaults.BlockRepoRoot + '!' + id.join('!') + '!';
  }

  public frontierKeyBase(blockKeyBase: string): string {
    return blockKeyBase + Defaults.Frontier + '!';
  }

  public frontierKey(blockKeyBase: string, time: number): string {
    const timeFormatted = time.toString(36).padStart(8, '0');
    return this.frontierKeyBase(blockKeyBase) + timeFormatted;
  }

  public batchKeyBase(blockKeyBase: string): string {
    return blockKeyBase + Defaults.Batches + '!';
  }

  public batchKey(blockKeyBase: string, seq: number): string {
    const seqFormatted = seq.toString(36).padStart(8, '0');
    return this.batchKeyBase(blockKeyBase) + seqFormatted;
  }

  public snapshotKeyBase(blockKeyBase: string): string {
    return blockKeyBase + Defaults.Snapshots + '!';
  }

  public snapshotKey(blockKeyBase: string, seq: number): string {
    const seqFormatted = seq.toString(36).padStart(8, '0');
    return this.snapshotKeyBase(blockKeyBase) + seqFormatted;
  }

  protected syncKey(keyBase: string): string {
    return Defaults.SyncRoot + '!' + keyBase;
  }

  protected async _exists(keyBase: string): Promise<boolean> {
    const metaKey = keyBase + Defaults.Metadata;
    const exists = (await this.kv.keys({gte: metaKey, lte: metaKey, limit: 1}).all()).length > 0;
    return exists;
  }

  protected _modelWrOp(keyBase: string, model: Uint8Array): Promise<BinStrLevelOperation> {
    return this.encode(model, true).then(
      (value) =>
        ({
          type: 'put',
          key: keyBase + Defaults.Model,
          value,
        }) as BinStrLevelOperation,
    );
  }

  protected _metaWrOp(keyBase: string, meta?: BlockMeta): Promise<BinStrLevelOperation> {
    return this.encode(meta, false).then(
      (value) =>
        ({
          type: 'put',
          key: keyBase + Defaults.Metadata,
          value,
        }) as BinStrLevelOperation,
    );
  }

  protected async _modelWrOps(keyBase: string, model: Uint8Array, meta?: BlockMeta): Promise<BinStrLevelOperation[]> {
    const ops: Promise<BinStrLevelOperation>[] = [this._modelWrOp(keyBase, model)];
    if (meta) ops.push(this._metaWrOp(keyBase, meta));
    return Promise.all(ops);
  }

  protected async _wrModel(keyBase: string, model: Uint8Array, meta?: BlockMeta): Promise<void> {
    const ops = await this._modelWrOps(keyBase, model, meta);
    await this.kv.batch(ops);
  }

  protected async load(id: BlockId): Promise<{model: Model; cursor: number}> {
    const blockId = id.join('/');
    const res = await this.opts.rpc.read(blockId);
    const block = res.block;
    const snapshot = block.snapshot;
    const seq = snapshot.seq;
    const sid = this.sid;
    const model = Model.load(snapshot.blob, sid);
    for (const batch of block.tip) for (const patch of batch.patches) model.applyPatch(Patch.fromBinary(patch.blob));
    const keyBase = await this.blockKeyBase(id);
    const metaKey = keyBase + Defaults.Metadata;
    const meta: BlockMeta = {
      time: 0,
      seq,
    };
    const modelBlob = model.toBinary();
    const [metaBlob, modelTupleBlob] = await Promise.all([this.encode(meta, false), this.encode(modelBlob, true)]);
    const ops: BinStrLevelOperation[] = [
      {
        type: 'put',
        key: metaKey,
        value: metaBlob,
      },
      {
        type: 'put',
        key: keyBase + Defaults.Model,
        value: modelTupleBlob,
      },
    ];
    await this.lockBlock(keyBase, async () => {
      const exists = await this._exists(keyBase);
      if (exists) throw new Error('EXISTS');
      await this.kv.batch(ops);
    });
    // TODO: Emit something here...
    // this.pubsub.pub(['pull', {id, batches: [], snapshot: {seq, blob: modelBlob}}])
    return {model, cursor: seq};
  }

  protected async readMeta(keyBase: string): Promise<BlockMeta> {
    const metaKey = keyBase + Defaults.Metadata;
    const blob = await this.kv.get(metaKey);
    const meta = (await this.decode(blob as any, false)) as BlockMeta;
    return meta;
  }

  public async readModel0(keyBase: string): Promise<Uint8Array> {
    const modelKey = keyBase + Defaults.Model;
    const blob = await this.kv.get(modelKey);
    const decoded = (await this.decode(blob as any, true)) as Uint8Array;
    return decoded;
  }

  public async readModel(keyBase: string): Promise<Model> {
    try {
      const blob = await this.readModel0(keyBase);
      const model = Model.load(blob, this.sid);
      return model;
    } catch (error) {
      if (!!error && typeof error === 'object' && (error as any).code === 'LEVEL_NOT_FOUND')
        throw new Error('NOT_FOUND');
      throw error;
    }
  }

  public async *readFrontierBlobs0(keyBase: string) {
    const gt = this.frontierKeyBase(keyBase);
    const lt = gt + '~';
    for await (const [key, buf] of this.kv.iterator({gt, lt})) {
      /** @todo Remove this conversion once json-pack supports Buffers. */
      const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
      yield [key, uint8] as const;
    }
  }

  public async readFrontier0(keyBase: string): Promise<Patch[]> {
    const patches: Patch[] = [];
    for await (const [, blob] of this.readFrontierBlobs0(keyBase)) {
      const patch = Patch.fromBinary(blob);
      patches.push(patch);
    }
    return patches;
  }

  public async readFrontierTip(keyBase: string): Promise<Patch | undefined> {
    const frontierBase = this.frontierKeyBase(keyBase);
    const gt = frontierBase;
    const lte = frontierBase + '~';
    for await (const blob of this.kv.values({gt, lte, limit: 1, reverse: true}))
      return Patch.fromBinary(await this.decrypt(blob, false));
    return;
  }

  protected async lockBlock<T>(keyBase: string, fn: () => Promise<T>): Promise<T> {
    return await this.locks.lock(keyBase, 500, 500)<T>(fn);
  }

  protected async lockBlockForSync<T>(keyBase: string, fn: () => Promise<T>): Promise<T> {
    const key = 's!' + keyBase;
    return await this.locks.lock(key, 2000, 3000)<T>(fn);
  }

  protected isBlockLockedForSync(keyBase: string): boolean {
    const key = 's!' + keyBase;
    return this.locks.isLocked(key);
  }

  // --------------------------------------------------- Remote synchronization

  protected async markDirty(keyBase: string, id: BlockId): Promise<void> {
    const key = this.syncKey(keyBase);
    const record: BlockSyncRecord = [id, Date.now()];
    const blob = await this.encode(record, false);
    await this.kv.put(key, blob);
  }

  protected async markDirtyAndSync(keyBase: string, id: BlockId): Promise<boolean> {
    if (this._stopped) return false;
    this.markDirty(keyBase, id).catch((error) => {
      if (this._stopped) return;
      this.emitSyncError(error);
    });
    try {
      return await this.push(keyBase, id, true);
    } catch (error) {
      if (typeof error === 'object' && error && (error as any).message === 'Not Found') return false;
      else if (error instanceof Error && error.message === 'DISCONNECTED') return false;
      throw error;
    }
  }

  protected remoteTimeout(): number {
    return this.opts.remoteTimeout ?? 5000;
  }

  /**
   * Pushes to remote.
   * @param id Block ID.
   * @param pull Whether to pull if there are no patches to push.
   */
  protected async push(keyBase: string, id: BlockId, doPull = false): Promise<boolean> {
    if (this._stopped) return false;
    if (!this.connected$.getValue()) throw new Error('DISCONNECTED');
    const remote = this.opts.rpc;
    const remoteId = id.join('/');
    const patches: ServerPatch[] = [];
    const ops: BinStrLevelOperation[] = [{type: 'del', key: this.syncKey(keyBase)}];
    for await (const [key, blob] of this.readFrontierBlobs0(keyBase)) {
      ops.push({type: 'del', key});
      patches.push({blob});
    }
    if (!patches.length) {
      const meta = await this.readMeta(keyBase);
      if (meta.seq === -1) {
        remote.create(remoteId).catch((error) => {
          const code = !!error && typeof error === 'object' ? (error as any).code : undefined;
          const message = error instanceof Error ? error.message : undefined;
          if (code === 'CONFLICT' || message === 'CONFLICT') return;
          this.emitSyncError(error);
        });
      }
      if (doPull) {
        await this.pull(id);
      }
      return false;
    }
    // TODO: handle case when this times out, but actually succeeds, so on re-sync it handles the case when the block is already synced.
    return await this.lockBlock(keyBase, async () => {
      const TIMEOUT = this.remoteTimeout();
      const startTime = Date.now();
      const assertTimeout = () => {
        if (Date.now() - startTime > TIMEOUT) throw new Error('TIMEOUT');
        if (this._stopped) throw new Error('STOPPED');
      };
      return await timeout(TIMEOUT, async () => {
        const read = await Promise.all([this.readModel(keyBase), this.readMeta(keyBase)]);
        assertTimeout();
        let model = read[0];
        const meta = read[1];
        // TODO: Track some meta to avoid unnecessary syncs.
        // if (Date.now() - meta.ts < 1000) return false;
        const hist = !!meta.hist;
        const lastKnownSeq = meta.seq;
        try {
          const response = await remote.update(remoteId, {patches}, lastKnownSeq);
          assertTimeout();
          // TODO: handle case when block is deleted on the server.
          // Process pull
          const merge: Uint8Array[] = []; // List of merge patches to emit over pubsub.
          const pull = response.pull;
          if (pull) {
            const snapshot = pull.snapshot;
            const batches = pull.batches;
            if (snapshot) {
              model = Model.load(snapshot.blob, this.sid);
              if (hist) {
                ops.push({
                  type: 'put',
                  key: this.snapshotKey(keyBase, snapshot.seq),
                  value: await this.encode(snapshot, true),
                });
                assertTimeout();
              }
            }
            if (batches) {
              for (const b of batches) {
                const patches = b.patches;
                for (const patch of patches) {
                  const blob = patch.blob;
                  merge.push(blob);
                  model.applyPatch(Patch.fromBinary(blob));
                }
                if (hist) {
                  ops.push({
                    type: 'put',
                    key: this.batchKey(keyBase, b.seq),
                    value: await this.encode(b, false),
                  });
                  assertTimeout();
                }
              }
            }
          }
          // Process the latest batch
          for (const patch of patches) {
            const blob = patch.blob;
            merge.push(blob);
            model.applyPatch(Patch.fromBinary(blob));
          }
          const batch: LocalBatch = {...response.batch, patches};
          const seq = batch.seq;
          if (hist) {
            ops.push({
              type: 'put',
              key: this.batchKey(keyBase, seq),
              value: await this.encode(batch, false),
            });
            assertTimeout();
          }
          // Process the model and metadata
          delete meta.syncFailures;
          meta.syncTs = Date.now();
          meta.time = model.clock.time - 1;
          meta.seq = seq;
          const modelOps = await this._modelWrOps(keyBase, model.toBinary(), meta);
          assertTimeout();
          ops.push(...modelOps);
          await this.kv.batch(ops);
          if (merge.length) {
            this.emitPubSub({type: 'merge', id, patches: merge, seq: seq});
          }
          return true;
        } catch (error) {
          // Store fails and time.
          meta.syncTs = Date.now();
          meta.syncFailures = (meta.syncFailures ?? 0) + 1;
          try {
            const op = await this._metaWrOp(keyBase, meta);
            await this.kv.batch([op]);
          } catch (err) {
            this.emitSyncError(err);
          }
          throw error;
        }
      });
    });
  }

  /**
   * Iterates over all blocks marked as dirty.
   */
  protected async *listDirty(): AsyncIterableIterator<BlockSyncRecord> {
    const gt: string = Defaults.SyncRoot;
    const lt: string = Defaults.SyncRoot + '~';
    for await (const blob of this.kv.values({gt, lt})) yield (await this.decode(blob, false)) as BlockSyncRecord;
  }

  protected async *listDirtyBatch(batchSize: number = 3): AsyncIterableIterator<BlockSyncRecord[]> {
    let batch: BlockSyncRecord[] = [];
    for await (const record of this.listDirty()) {
      batch.push(record);
      if (batch.length >= batchSize) {
        yield batch;
        batch = [];
      }
    }
    if (batch.length) yield batch;
  }

  public async syncItem(keyBase: string, id: BlockId): Promise<SyncResult> {
    try {
      const meta = await this.readMeta(keyBase);
      if (meta.syncFailures && meta.syncTs) {
        const timeout = Math.min(1000 * Math.pow(2, meta.syncFailures), 30000);
        const now = Date.now();
        const shouldSkip = now - timeout < meta.syncTs;
        if (shouldSkip) return [id, false];
      }
      return await this.lockBlockForSync(keyBase, async () => {
        const success = await this.push(keyBase, id, true);
        return [id, success];
      });
    } catch (error) {
      return [id, false, error];
    }
  }

  public async remoteSyncAll(): Promise<SyncResult[]> {
    const resultList: SyncResult[] = [];
    for await (const batch of this.listDirtyBatch()) {
      if (this._stopped) return resultList;
      if (!this._remoteSyncLoopActive) return resultList;
      if (!this.connected$.getValue()) return resultList;
      await Promise.all(
        batch.map(async (record) => {
          const [id] = record;
          const keyBase = await this.blockKeyBase(id);
          const isLocked = this.isBlockLockedForSync(keyBase);
          if (isLocked) return;
          const result = await this.syncItem(keyBase, id);
          resultList.push(result);
        }),
      );
    }
    return resultList;
  }

  protected _remoteSyncLoopActive = false;
  protected _remoteSyncDelayTimer: unknown;

  protected runRemoteSyncLoop(): void {
    this._remoteSyncLoopActive = true;
    if (!this.connected$.getValue()) {
      this._remoteSyncLoopActive = false;
      return;
    }
    this.remoteSyncAll()
      .catch((error) => {
        this.emitSyncError(error);
      })
      .finally(() => {
        if (!this._remoteSyncLoopActive) return;
        if (!this.connected$.getValue()) {
          this._remoteSyncLoopActive = false;
          return;
        }
        const timer = setTimeout(() => {
          if (!this._remoteSyncLoopActive) return;
          this.runRemoteSyncLoop();
        }, 2000);
        (timer as {unref?: () => void}).unref?.();
        this._remoteSyncDelayTimer = timer;
      });
  }

  /** ----------------------------------------------------- {@link LocalRepo} */

  public async create({id, patches}: LocalRepoCreateRequest): Promise<LocalRepoCreateResponse> {
    const keyBase = await this.blockKeyBase(id);
    const meta: BlockMeta = {
      time: 0,
      seq: -1,
    };
    const ops: BinStrLevelOperation[] = [];
    const model = Model.create(void 0, this.sid);
    if (patches && patches.length) {
      for (const patch of patches) {
        const patchId = patch.getId();
        if (!patchId) throw new Error('PATCH_ID_MISSING');
        model.applyPatch(patch);
        const patchKey = this.frontierKey(keyBase, patchId.time);
        const op: BinStrLevelOperation = {
          type: 'put',
          key: patchKey,
          value: await this.encrypt(patch.toBinary(), false),
        };
        ops.push(op);
      }
    }
    ops.push(...(await this._modelWrOps(keyBase, model.toBinary(), meta)));
    await this.lockBlock(keyBase, async () => {
      const exists = await this._exists(keyBase);
      if (exists) throw new Error('EXISTS');
      await this.kv.batch(ops);
    });
    const remote = this.markDirtyAndSync(keyBase, id)
      .then(() => {})
      .catch((error) => {
        if (this._stopped) return;
        this.emitSyncError(error);
      });
    remote.catch(() => {});
    return {model, remote};
  }

  public async get0(id: BlockId): Promise<LocalRepoGet0Response> {
    const keyBase = await this.blockKeyBase(id);
    const [model, meta, frontier] = await Promise.all([
      this.readModel(keyBase),
      this.readMeta(keyBase),
      this.readFrontier0(keyBase),
    ]);
    return {
      model,
      frontier,
      meta,
    };
  }

  public async get({id, remote}: LocalRepoGetRequest): Promise<LocalRepoGetResponse> {
    try {
      const {model, cursor} = await this._syncRead(id);
      if (!model) throw RpcError.notFound();
      return {model, cursor};
    } catch (error) {
      const code = !!error && typeof error === 'object' ? (error as any).code : undefined;
      const message = error instanceof Error ? error.message : undefined;
      const notFound = code === 'NOT_FOUND' || message === 'NOT_FOUND' || message === 'Not Found';
      if (remote && notFound) return await this.load(id);
      if (notFound) {
        if (RpcError.isRpcError(error)) throw error;
        throw RpcError.notFound('Not Found', undefined, error);
      }
      throw error;
    }
  }

  public async getIf(request: LocalRepoGetIfRequest): Promise<null | LocalRepoGetIfResponse> {
    let get = false;
    const keyBase = await this.blockKeyBase(request.id);
    const meta = await this.readMeta(keyBase);
    if (typeof request.cursor === 'number') {
      if (request.cursor < meta.seq) get = true;
    }
    if (!get && typeof request.time === 'number') {
      if (request.time < meta.time) get = true;
      else {
        const tip = await this.readFrontierTip(keyBase);
        if (tip) {
          const tipTime = tip.getId()?.time ?? 0;
          if (request.time < tipTime + tip.span() - 1) get = true;
        }
      }
    }
    if (!get) return null;
    const [model, frontier] = await Promise.all([this.readModel(keyBase), this.readFrontier0(keyBase)]);
    model.applyBatch(frontier);
    const cursor: LevelLocalRepoCursor = meta.seq;
    return {model, cursor};
  }

  public async sync(req: LocalRepoSyncRequest): Promise<LocalRepoSyncResponse> {
    const cursor = req.cursor as LevelLocalRepoCursor | undefined;
    const {id, patches} = req;
    const isNewSession = cursor === undefined;
    const isCreate = !!patches;
    const isWrite = !!patches && patches.length !== 0;
    if (isNewSession) {
      if (isWrite) {
        try {
          return await this._syncCreate(req);
        } catch (error) {
          if (error instanceof Error && error.message === 'EXISTS') {
            return await this._syncMerge(req);
          }
          throw error;
        }
      } else if (isCreate) {
        try {
          return await this._syncCreate(req);
        } catch (error) {
          if (error instanceof Error && error.message === 'EXISTS')
            // TODO: make sure reset does not happen, if models are the same.
            // TODO: Check for `req.time` in `_syncRead`.
            return await this._syncRead(id);
          throw error;
        }
      } else {
        return await this._syncRead(id);
      }
    } else return await this._syncMerge(req);
  }

  private async _syncCreate(req: LocalRepoSyncRequest): Promise<LocalRepoSyncResponse> {
    const {remote} = await this.create(req);
    const cursor: LevelLocalRepoCursor = -1;
    return {cursor, remote};
  }

  private async _syncMerge(req: LocalRepoSyncRequest): Promise<LocalRepoSyncResponse> {
    const {id, patches} = req;
    let lastKnownTime = 0;
    const reqTime = req.time;
    if (typeof reqTime === 'number') {
      lastKnownTime = reqTime;
      const firstPatch = patches?.[0];
      if (firstPatch?.getId()?.sid === SESSION.GLOBAL) lastKnownTime = firstPatch.getId()!.time + firstPatch.span() - 1;
    } else if (patches?.length) {
      const firstPatchTime = patches?.[0]?.getId()?.time;
      if (typeof firstPatchTime === 'number') lastKnownTime = firstPatchTime - 1;
    }
    const keyBase = await this.blockKeyBase(id);
    if (!patches || !patches.length) throw new Error('EMPTY_BATCH');
    const writtenPatches: Uint8Array[] = [];
    let cursor: LevelLocalRepoCursor = -1;
    // TODO: Check if `patches` need rebasing, if not, just merge.
    // TODO: Return correct response.
    // TODO: Check that remote state is in sync, too.
    let needsReset = false;
    const didPush = await this.lockBlock(keyBase, async () => {
      const [tip, meta] = await Promise.all([this.readFrontierTip(keyBase), this.readMeta(keyBase)]);
      let nextTick = meta.time + 1;
      if (lastKnownTime < meta.time) needsReset = true;
      cursor = meta.seq;
      if (tip) {
        const tipTime = tip.getId()?.time ?? 0;
        nextTick = tipTime + tip.span();
      }
      const ops: BinStrLevelOperation[] = [];
      const sid = this.sid;
      const length = patches.length;
      for (let i = 0; i < length; i++) {
        const patch = patches[i];
        const patchId = patch.getId();
        if (!patchId) throw new Error('PATCH_ID_MISSING');
        const isSchemaPatch = patchId.sid === SESSION.GLOBAL && patchId.time === 1;
        if (isSchemaPatch) {
          const patchAheadOfTip = patchId.time >= nextTick;
          if (!patchAheadOfTip) continue;
        }
        let rebased = patch;
        if (patchId.sid === sid && nextTick > patchId.time) {
          needsReset = true;
          rebased = patch.rebase(nextTick);
          nextTick = rebased.getId()!.time + rebased.span();
        }
        const id = rebased.getId()!;
        const time = id.time;
        const patchKey = this.frontierKey(keyBase, time);
        const uint8 = await this.encrypt(rebased.toBinary(), false);
        writtenPatches.push(uint8);
        const op: BinStrLevelOperation = {type: 'put', key: patchKey, value: uint8};
        ops.push(op);
      }
      if (writtenPatches.length) {
        this.emitPubSub({type: 'rebase', id, patches: writtenPatches, session: req.session});
      }
      if (ops.length) {
        await this.kv.batch(ops);
        return true;
      }
      return false;
    });
    if (!didPush && !needsReset) {
      const merge = await this.readFrontier0(keyBase);
      return {cursor, merge};
    }
    const remote = this.markDirtyAndSync(keyBase, id)
      .then(() => {})
      .catch((error) => {
        if (this._stopped) return;
        this.emitSyncError(error);
      });
    if (needsReset) {
      const {cursor, model} = await this._syncRead0(keyBase);
      return {cursor, model, remote};
    }
    return {cursor, remote};
  }

  protected async readLocal0(keyBase: string): Promise<[model: Model, cursor: LevelLocalRepoCursor]> {
    const [model, meta, frontier] = await Promise.all([
      this.readModel(keyBase),
      this.readMeta(keyBase),
      this.readFrontier0(keyBase),
    ]);
    model.applyBatch(frontier);
    const cursor: LevelLocalRepoCursor = meta.seq;
    return [model, cursor];
  }

  private async _syncRead0(keyBase: string): Promise<LocalRepoSyncResponse> {
    const [model, cursor] = await this.readLocal0(keyBase);
    return {
      model,
      cursor,
      // TODO: `remote` should load the block from the server.
      remote: Promise.resolve(),
    };
  }

  private async _syncRead(id: BlockId): Promise<LocalRepoSyncResponse> {
    const keyBase = await this.blockKeyBase(id);
    return this._syncRead0(keyBase);
  }

  public async del(id: BlockId): Promise<void> {
    const keyBase = await this.blockKeyBase(id);
    const frontierKeyBase = this.frontierKeyBase(keyBase);
    const batchKeyBase = this.batchKeyBase(keyBase);
    const snapshotKeyBase = this.snapshotKeyBase(keyBase);
    const kv = this.kv;
    await this.lockBlock(keyBase, async () => {
      await kv.batch([
        {type: 'del', key: keyBase + Defaults.Metadata},
        {type: 'del', key: keyBase + Defaults.Model},
      ]);
      this.emitPubSub({id, type: 'del'});
      await Promise.all([
        kv.clear({
          gt: frontierKeyBase,
          lt: frontierKeyBase + '~',
        }),
        kv.clear({
          gt: batchKeyBase,
          lt: batchKeyBase + '~',
        }),
        kv.clear({
          gt: snapshotKeyBase,
          lt: snapshotKeyBase + '~',
        }),
      ]);
    });
    await this.opts.rpc.delete?.(id.join('/'));
  }

  /**
   * Pull from remote.
   */
  public async pull(id: BlockId): Promise<LocalRepoPullResponse> {
    const keyBase = await this.blockKeyBase(id);
    try {
      const {model, meta} = await this.pullExisting(id, keyBase);
      return {model, cursor: meta.seq};
    } catch (error) {
      if (!!error && typeof error === 'object' && (error as any).code === 'LEVEL_NOT_FOUND') {
        try {
          const {model, meta} = await this.pullNew(id, keyBase);
          return {model, cursor: meta.seq};
        } catch (error) {
          if (error instanceof Error && error.message === 'EXISTS') {
            const {model, meta} = await this.pullExisting(id, keyBase);
            return {model, cursor: meta.seq};
          }
          throw error;
        }
      } else if (error instanceof Error && error.message === 'CONCURRENCY') {
        const [model, cursor] = await this.readLocal0(keyBase);
        return {model, cursor};
      }
      throw error;
    }
  }

  protected async pullNew(id: BlockId, keyBase: string): Promise<{model: Model; meta: BlockMeta}> {
    const blockId = id.join('/');
    const {block} = await this.opts.rpc.read(blockId);
    const _pubsub = this.pubsub;
    return this.lockBlock(keyBase, async () => {
      const exists = await this._exists(keyBase);
      if (exists) throw new Error('EXISTS');
      const model = Model.load(block.snapshot.blob, this.sid);
      let seq = block.snapshot.seq;
      for (const batch of block.tip) {
        if (batch.seq <= seq) continue;
        seq = batch.seq;
        for (const patch of batch.patches) model.applyPatch(Patch.fromBinary(patch.blob));
      }
      const meta: BlockMeta = {
        time: 0,
        seq,
      };
      const blob = model.toBinary();
      await this._wrModel(keyBase, blob, meta);
      this.emitPubSub({type: 'reset', id, model: blob});
      return {model, meta};
    });
  }

  protected async pullExisting(id: BlockId, keyBase: string): Promise<{model: Model; meta: BlockMeta}> {
    // TODO: try catching up using batches, if not possible, reset
    // TODO: load batches to catch up with remote
    const blockId = id.join('/');
    const meta = await this.readMeta(keyBase);
    const {seq} = meta;
    const pull = await this.opts.rpc.pull(blockId, seq);
    const nextSeq = pull.batches.length ? pull.batches[pull.batches.length - 1].seq : (pull.snapshot?.seq ?? seq);
    const _pubsub = this.pubsub;
    if (nextSeq < seq) {
      return this.lockBlock(keyBase, async () => {
        const seq2 = (await this.readMeta(keyBase)).seq;
        if (seq2 !== seq) throw new Error('CONCURRENCY');
        if (!pull.snapshot) throw new Error('missing snapshot');
        const model = Model.load(pull.snapshot.blob, this.sid);
        for (const batch of pull.batches)
          for (const patch of batch.patches) model.applyPatch(Patch.fromBinary(patch.blob));
        const modelBlob = model.toBinary();
        meta.time = model.clock.time - 1;
        meta.seq = nextSeq;
        meta.syncTs = Date.now();
        delete meta.syncFailures;
        await this._wrModel(keyBase, modelBlob, meta);
        this.emitPubSub({type: 'reset', id, model: modelBlob});
        return {model, meta};
      });
    }
    return this.lockBlock(keyBase, async () => {
      const [model, meta] = await Promise.all([this.readModel(keyBase), this.readMeta(keyBase)]);
      const seq2 = meta.seq;
      if (seq2 !== seq) throw new Error('CONCURRENCY');
      if (pull.snapshot) {
        if (nextSeq > seq2) {
          const model = Model.load(pull.snapshot.blob, this.sid);
          for (const batch of pull.batches)
            for (const patch of batch.patches) model.applyPatch(Patch.fromBinary(patch.blob));
          const modelBlob = model.toBinary();
          meta.seq = nextSeq;
          await this._wrModel(keyBase, modelBlob, meta);
          this.emitPubSub({type: 'reset', id, model: modelBlob});
        }
        return {model, meta};
      }
      if (!model) throw new Error('NO_MODEL');
      const patches: Uint8Array[] = [];
      for (const batch of pull.batches)
        for (const patch of batch.patches) {
          model.applyPatch(Patch.fromBinary(patch.blob));
          patches.push(patch.blob);
        }
      meta.seq = nextSeq;
      await this._wrModel(keyBase, model.toBinary(), meta);
      this.emitPubSub({type: 'merge', id, patches, seq: meta.seq});
      return {model, meta};
    });
  }

  public change$(id: BlockId): Observable<LocalRepoEvent> {
    return defer(() => {
      const remoteSubscription = this._subRemote(id).subscribe({next: () => {}, error: () => {}});
      return this.pubsub.bus$.pipe(
        takeUntil(this._stop$),
        map((msg) => {
          switch (msg.type) {
            case 'rebase': {
              if (!deepEqual(id, msg.id)) return;
              const rebase: Patch[] = [];
              for (const blob of msg.patches) rebase.push(Patch.fromBinary(blob));
              const event: LocalRepoRebaseEvent = {rebase, session: msg.session};
              return event;
            }
            case 'reset': {
              if (!deepEqual(id, msg.id)) return;
              const reset = Model.load(msg.model, this.sid);
              const event: LocalRepoResetEvent = {reset};
              return event;
            }
            case 'merge': {
              if (!deepEqual(id, msg.id)) return;
              const merge: Patch[] = [];
              for (const blob of msg.patches) {
                const patch = Patch.fromBinary(blob);
                if (patch.getId()?.sid === SESSION.GLOBAL) continue;
                merge.push(patch);
              }
              if (!merge.length) return;
              const event: LocalRepoMergeEvent = {merge, cursor: msg.seq};
              return event;
            }
            case 'del': {
              if (!deepEqual(id, msg.id)) return;
              const event: LocalRepoDeleteEvent = {del: true};
              return event;
            }
          }
        }),
        filter((event): event is LocalRepoEvent => !!event),
        finalize(() => {
          remoteSubscription.unsubscribe();
        }),
        share(),
      );
    });
  }

  private _subs: Record<string, Observable<void>> = {};

  protected _subRemote(id: BlockId): Observable<void> {
    const blockId = id.join('/');
    let sub = this._subs[blockId];
    if (sub) return sub;
    const source = defer(() =>
      this.opts.rpc.listen(blockId).pipe(
        takeUntil(this._stop$),
        switchMap(async ({event}) => {
          if (this._stopped) return;
          switch (event[0]) {
            case 'new':
              await this.pull(id);
              break;
            case 'upd':
              await this._onUpd(id, event[1].batch);
              break;
            case 'del':
              await this.del(id);
              break;
          }
        }),
      ),
    );
    sub = source.pipe(
      retry({delay: 1000, resetOnSuccess: true}),
      finalize<void>(() => {
        delete this._subs[blockId];
      }),
      share(),
    );
    this._subs[blockId] = sub;
    return sub;
  }

  protected async _onUpd(id: BlockId, batch: ServerBatch): Promise<void> {
    try {
      if (this._stopped) return;
      const keyBase = await this.blockKeyBase(id);
      const firstPatch = batch.patches[0];
      if (!firstPatch) return;
      try {
        const meta = await this.readMeta(keyBase);
        const alreadySynced = meta.seq >= batch.seq;
        if (alreadySynced) return;
        const needsPull = meta.seq + 1 < batch.seq;
        if (needsPull) {
          await this.pull(id);
          return;
        }
      } catch (error) {
        if (!!error && typeof error === 'object' && (error as any).code === 'LEVEL_NOT_FOUND') {
          if (this._stopped) return;
          await this.pullNew(id, keyBase);
          return;
        }
        throw error;
      }
      let needsPull = false;
      await this.lockBlock(keyBase, async () => {
        if (this._stopped) return;
        const [model, meta] = await Promise.all([this.readModel(keyBase), this.readMeta(keyBase)]);
        if (this._stopped) return;
        if (meta.seq >= batch.seq) return;
        if (meta.seq + 1 < batch.seq) {
          needsPull = true;
          return;
        }
        const patches: Uint8Array[] = [];
        for (const serverPatch of batch.patches) {
          const patch = Patch.fromBinary(serverPatch.blob);
          model.applyPatch(patch);
          patches.push(serverPatch.blob);
        }
        meta.seq = batch.seq;
        await this._wrModel(keyBase, model.toBinary(), meta);
        this.emitPubSub({type: 'merge', id, patches, seq: meta.seq});
      });
      if (needsPull && !this._stopped) await this.pull(id);
    } catch (error) {
      this.emitSyncError(error);
    }
  }
}
