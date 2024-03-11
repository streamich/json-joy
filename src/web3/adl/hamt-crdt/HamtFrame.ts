import {Defer} from 'thingies/es2020/Defer';
import {cmpUint8Array2} from '../../../util/buffers/cmpUint8Array2';
import {cmpDto} from '../../hlc';
import {CidCasStruct} from '../../store/cas/CidCasStruct';
import {Cid} from '../../multiformats';
import {HamtConstraints} from './constants';
import {mutex} from 'thingies/es2020/mutex';
import type * as types from './types';

export class HamtFrame {
  protected _entries: types.HamtFrameEntry[] = [];
  protected _children: (HamtFrame | null)[] = [null];
  protected _loaded: boolean = false;
  protected _loading: Defer<void> | null = null;
  /** Maybe instead of `_dirty`, just consider `id` === `null` to mean there are unsaved changes. */
  protected _dirty: boolean = false;

  constructor(protected readonly cas: CidCasStruct, public id: Cid | null) {}

  protected async ensureLoaded(): Promise<void> {
    if (this._loading) return this._loading.promise;
    if (this._loaded) return;
    if (!this.id) return;
    if (this.id) await this.load();
  }

  /**
   * Load the current node by CID from CAS.
   *
   * @param id CID of the node to load.
   */
  @mutex
  protected async load(): Promise<void> {
    const id = this.id;
    if (!id) throw new Error('ID_NOT_SET');
    this._loading = new Defer<void>();
    const data = await this.cas.get(id) as types.HamtFrameDto;
    this.loadDto(data, id);
    this._loading.resolve();
    this._loading = null;
  }

  /**
   * Load the current node from known data. Provided data will be mutated
   * internally, so it MUST not be used after this method is called.
   *
   * @param data Serialized data of the node to load.
   * @param id CID of the node to load, or null if CID is not known.
   */
  protected loadDto(data: types.HamtFrameDto, id: Cid | null) {
    this.id = id;
    const [entries, children] = data;
    this._entries = entries;
    this._children = [];
    const length = children.length;
    for (let i = 0; i < length; i++) {
      const childCid = children[i];
      const child = childCid ? new HamtFrame(this.cas, childCid) : null;
      this._children.push(child);
    }
    this._loaded = true;
  }

  public async getEntry(key: Uint8Array): Promise<types.HamtFrameEntry | undefined> {
    if (!this._loaded) await this.ensureLoaded();
    const entries = this._entries;
    const length = entries.length;
    for (let i = 0; i < length; i++) {
      const entry = entries[i];
      const currentKey = entry[0];
      const comparison = cmpUint8Array2(currentKey, key);
      if (comparison === 0) return entry;
      const isKeySmallerThanCurrentKey = comparison > 0;
      if (isKeySmallerThanCurrentKey) {
        const child = this._children[i];
        if (!child) return undefined;
        return await child.getEntry(key);
      }
    }
    const lastChild = this._children[length];
    if (!lastChild) return undefined;
    return await lastChild.getEntry(key);
  }

  /**
   * Recursively find a key value from current node or any of its children.
   *
   * @param key The key to fetch.
   * @returns Returns the value if found, otherwise undefined.
   */
  public async get(key: Uint8Array): Promise<unknown | undefined> {
    const entry = await this.getEntry(key);
    if (!entry) return undefined;
    return entry[1];
  }

  public async has(key: Uint8Array): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  /**
   * Insert or overwrite a key value pair in current node or any of its children.
   *
   * @param id HLC ID of the key.
   * @param key Key to put.
   * @param val Key value to put.
   * @returns Returns true if the key was inserted. Insertion can fail if the
   *          ID of the insert operation is lower than the ID of the last write.
   */
  public async put(op: types.HamtOp): Promise<boolean> {
    if (!this._loaded) await this.ensureLoaded();
    const [key, , id] = op;
    const entries = this._entries;
    const length = entries.length;
    const insertInChild = length >= HamtConstraints.MaxEntriesPerFrame;
    for (let i = 0; i < length; i++) {
      const entry = entries[i];
      const currentKey = entry[0];
      const comparison = cmpUint8Array2(currentKey, key);
      // Replace existing entry if keys are equal.
      if (comparison === 0) {
        const oldId = entry[2];
        if (cmpDto(oldId, id) >= 0) return false;
        this._entries[i] = op;
        this._markDirty();
        return true;
      }
      const isKeySmallerThanCurrentKey = comparison > 0;
      if (isKeySmallerThanCurrentKey) {
        if (insertInChild) {
          // Insert at child node.
          const wasInserted = await this._putAtChild(i, op);
          if (wasInserted) this._markDirty();
          return wasInserted;
        } else {
          // Insert at current node, but shifting entries to the right.
          this._entries.splice(i, 0, op);
          this._children.splice(i, 0, null);
          this._markDirty();
          return true;
        }
      }
    }
    // Insert into the last child.
    if (insertInChild) {
      const wasInserted = await this._putAtChild(length, op);
      if (wasInserted) this._markDirty();
      return wasInserted;
    }
    // Append entry at the end of current block.
    this._entries.push(op);
    this._children.push(null);
    this._markDirty();
    return true;
  }

  protected _markDirty() {
    this._dirty = true;
    this.id = null;
  }

  private async _putAtChild(i: number, op: types.HamtOp): Promise<boolean> {
    let child = this._children[i];
    if (!child) child = this._children[i] = new HamtFrame(this.cas, null);
    return await child.put(op);
  }

  /**
   * Save current node and all of its children.
   *
   * @returns Returns CID of current node, and a list of all affected CIDs,
   *          including the current CID.
   */
  public async save(): Promise<[id: Cid, affected: Cid[]]> {
    if (!this._loaded) await this.ensureLoaded();
    // TODO: Maybe throw if there are no changes.
    if (this.id && !this._dirty) return [this.id, []];
    const [children, affected] = await this.saveChildren();
    const data: types.HamtFrameDto = [this._entries, children];
    const cid = await this.cas.put(data);
    this.id = cid;
    affected.push(cid);
    return [cid, affected];
  }

  /**
   * Saves all "dirty" children and returns a list of all children.
   *
   * @returns Returns a list of stored CIDs and a all children of the current node,
   *          even the children which were not saved.
   */
  public async saveChildren(): Promise<[children: (Cid | null)[], affected: Cid[]]> {
    const ids: Cid[] = [];
    const children: (Cid | null)[] = [];
    const length = this._children.length;
    for (let i = 0; i < length; i++) {
      const child = this._children[i];
      if (!child) {
        children.push(null);
        continue;
      }
      const [childCid, affected] = await child.save();
      ids.push(...affected);
      children.push(childCid);
    }
    return [children, ids];
  }

  public toDto(): types.HamtFrameDto {
    const children = this._children.map((child) => child ? child.id : null);
    const dto: types.HamtFrameDto = [this._entries, children];
    return dto;
  }
}
