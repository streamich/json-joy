import {HamtFrame} from './HamtFrame';
import {toDto, type HlcFactory} from '../../hlc';
import {Cid} from '../../multiformats';
import {sha256} from '../../crypto';
import {toBuf} from '../../../util/buffers/toBuf';
import type {CidCasStruct} from '../../store/cas/CidCasStruct';
import type * as types from './types';

export interface HamtDependencies {
  cas: CidCasStruct;
  hlcs: HlcFactory;
}

export class Hamt implements types.HamtApi {
  protected _dirty: boolean = false;
  protected _loading: Promise<void> | null = null;
  protected _root: HamtFrame;

  public prevSeq: number = 0;
  public prevId: Cid | null = null;
  public ops: types.HamtOp[] = [];

  constructor(protected readonly deps: HamtDependencies) {
    this._root = new HamtFrame(deps.cas, null);
  }

  public hasChanges(): boolean {
    return this._dirty;
  }

  public toDto(): types.HamtRootFrameDto {
    const id = this.prevId ? this.prevId.bytes : 0;
    const [entries, children] = this._root.toDto();
    const ops: HamtOp[] = [];
    const dto: HamtRootFrameDto = [entries, children, this.prevSeq + 1, id, ops];
    return dto;
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

  // ------------------------------------------------------------------ HamtApi

  public async load(id: Cid): Promise<void> {
    this.prevId = id;
    this._loading = this.deps.cas
      .get(id)
      .then(async (data) => {
        const [entries, children, seq] = data as types.HamtRootFrameDto;
        this.prevSeq = seq;
        this._root.loadData([entries, children], null);
        this._loading = null;
      })
      .catch(() => {});
  }

  public async put(key: Uint8Array | string, val: unknown): Promise<boolean> {
    if (this._loading) await this._loading;
    const hashedKey = await this._key(key);
    const id = this.deps.hlcs.inc();
    const idDto = toDto(id);
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

  public async has(key: Uint8Array | string): Promise<boolean> {
    if (this._loading) await this._loading;
    return (await this.get(key)) !== undefined;
  }

  public async del(key: Uint8Array | string): Promise<boolean> {
    if (this._loading) await this._loading;
    return await this.put(key, undefined);
  }

  public async save(): Promise<[head: Cid, affectedIds: Cid[]]> {
    const [ids] = await this._root.saveChildren();
    const dto = this.toDto();
    const cid = await this.deps.cas.put(dto);
    this.prevId = cid;
    this.prevSeq = this.prevSeq + 1;
    this.ops = [];
    ids.push(cid);
    return [cid, ids];
  }
}
