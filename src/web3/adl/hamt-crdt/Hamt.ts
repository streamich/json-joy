import {Defer} from 'thingies/es2020/Defer';
import {concurrency} from 'thingies/es2020/concurrencyDecorator';
import {HamtFrame} from './HamtFrame';
import * as hlc from '../../hlc';
import {Cid} from '../../multiformats';
import {sha256} from '../../crypto';
import {toBuf} from '../../../util/buffers/toBuf';
import type {CidCasStruct} from '../../store/cas/CidCasStruct';
import type * as types from './types';

export interface HamtDependencies {
  cas: CidCasStruct;
  hlcs: hlc.HlcFactory;
}

export class Hamt implements types.HamtApi {
  protected _root: HamtFrame;
  protected _dirty: boolean = false;
  protected _loading: Promise<void> | null = null;

  public cid: Cid | null = null;
  public prev: Cid | null = null;
  public seq: number = 0;
  public ops: types.HamtOp[] = [];

  constructor(protected readonly deps: HamtDependencies) {
    this._root = new HamtFrame(deps.cas, null);
  }

  public hasChanges(): boolean {
    return this._dirty;
  }

  // ------------------------------------------------------------------ HamtApi

  public async load(cid: Cid): Promise<void> {
    this.cid = cid;
    const future = new Defer<void>();
    this._loading = future.promise;
    try {
      const [prev, seq, ops, data] = await this.deps.cas.get(cid) as types.HamtRootFrameDto;
      this.prev = prev;
      this.seq = seq;
      this._root.loadDto(data, null);
      future.resolve();
    } catch (err) {
      future.reject(err);
    } finally {
      this._loading = null;
    }
    return future.promise;
  }

  @concurrency(1)
  public async put(key: Uint8Array | string, val: unknown): Promise<boolean> {
    if (this._loading) await this._loading;
    const hashedKey = await this._key(key);
    const id = this.deps.hlcs.inc();
    const idDto = hlc.toDto(id);
    const op: types.HamtOp = [hashedKey, val, idDto];
    const success = await this._root.put(op);
    if (success) this.ops.push(op);
    return success;
  }

  public async get(key: Uint8Array | string): Promise<unknown | undefined> {
    if (this._loading) await this._loading;
    const hashedKey = await this._key(key);
    return await this._root.get(hashedKey);
  }

  /** Convert any key to buffer and prefix with 4-byte hash. */
  protected async _key(key: Uint8Array | string): Promise<Uint8Array> {
    const keyBuf = typeof key === 'string' ? toBuf(key) : key;
    const hash = await sha256(keyBuf);
    const buf = new Uint8Array(4 + keyBuf.length);
    buf.set(hash.subarray(0, 4), 0);
    buf.set(keyBuf, 4);
    return buf;
  }

  public async has(key: Uint8Array | string): Promise<boolean> {
    if (this._loading) await this._loading;
    return (await this.get(key)) !== undefined;
  }

  public async del(key: Uint8Array | string): Promise<boolean> {
    if (this._loading) await this._loading;
    return await this.put(key, undefined);
  }

  public async save(): Promise<[head: Cid, affected: Cid[]]> {
    const [, affected] = await this._root.saveChildren();
    const prev = this.cid;
    const seq = this.seq + 1;
    const dto: types.HamtRootFrameDto = [prev, seq, this.ops, this._root.toDto()];
    const cid = await this.deps.cas.put(dto);
    this.cid = cid;
    this.prev = prev;
    this.seq = seq;
    this.ops = [];
    affected.push(cid);
    return [cid, affected];
  }
}
