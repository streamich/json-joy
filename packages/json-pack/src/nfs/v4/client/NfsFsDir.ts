import type * as misc from 'memfs/lib/node/types/misc';
import type {Nfsv4Client} from './types';
import {NfsFsDirent} from './NfsFsDirent';
import {nfs} from '../builder';
import type * as msg from '../messages';
import {Nfsv4Stat, Nfsv4Attr, Nfsv4FType} from '../constants';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {XdrDecoder} from '../../../xdr/XdrDecoder';

/**
 * Implements Node.js-like Dir interface for NFS v4 directory iteration.
 */
export class NfsFsDir implements misc.IDir {
  private entries: NfsFsDirent[] = [];
  private position: number = 0;
  private closed: boolean = false;

  constructor(
    public readonly path: string,
    private readonly nfs: Nfsv4Client,
    private readonly operations: msg.Nfsv4Request[],
  ) {}

  private async ensureLoaded(): Promise<void> {
    if (this.entries.length > 0 || this.closed) return;
    const attrNums = [Nfsv4Attr.FATTR4_TYPE];
    const attrMask: number[] = [];
    for (const attrNum of attrNums) {
      const wordIndex = Math.floor(attrNum / 32);
      const bitIndex = attrNum % 32;
      while (attrMask.length <= wordIndex) attrMask.push(0);
      attrMask[wordIndex] |= 1 << bitIndex;
    }
    const operations = [...this.operations];
    operations.push(nfs.READDIR(attrMask));
    const response = await this.nfs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) throw new Error(`Failed to read directory: ${response.status}`);
    const readdirRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4ReaddirResponse;
    if (readdirRes.status !== Nfsv4Stat.NFS4_OK || !readdirRes.resok)
      throw new Error(`Failed to read directory: ${readdirRes.status}`);
    const entryList = readdirRes.resok.entries;
    for (let i = 0; i < entryList.length; i++) {
      const entry = entryList[i];
      const name = entry.name;
      const fattr = entry.attrs;
      const reader = new Reader();
      reader.reset(fattr.attrVals);
      const xdr = new XdrDecoder(reader);
      let fileType = Nfsv4FType.NF4REG;
      const returnedMask = fattr.attrmask.mask;
      for (let i = 0; i < returnedMask.length; i++) {
        const word = returnedMask[i];
        if (!word) continue;
        for (let bit = 0; bit < 32; bit++) {
          if (!(word & (1 << bit))) continue;
          const attrNum = i * 32 + bit;
          if (attrNum === Nfsv4Attr.FATTR4_TYPE) {
            fileType = xdr.readUnsignedInt();
          }
        }
      }
      this.entries.push(new NfsFsDirent(name, fileType));
    }
  }

  public async close(): Promise<void>;
  public async close(callback?: (err?: Error) => void): Promise<void>;
  public async close(callback?: (err?: Error) => void): Promise<void> {
    this.closed = true;
    this.entries = [];
    this.position = 0;
    if (callback) {
      try {
        callback();
      } catch (err) {
        callback(err as Error);
      }
    }
  }

  public closeSync(): void {
    this.closed = true;
    this.entries = [];
    this.position = 0;
  }

  public async read(): Promise<misc.IDirent | null>;
  public async read(callback?: (err: Error | null, dir?: misc.IDirent | null) => void): Promise<misc.IDirent | null>;
  public async read(callback?: (err: Error | null, dir?: misc.IDirent | null) => void): Promise<misc.IDirent | null> {
    try {
      if (this.closed) {
        const err = new Error('Directory is closed');
        if (callback) {
          callback(err, null);
          return null;
        }
        throw err;
      }
      await this.ensureLoaded();
      if (this.position >= this.entries.length) {
        if (callback) {
          callback(null, null);
        }
        return null;
      }
      const entry = this.entries[this.position++];
      if (callback) {
        callback(null, entry);
      }
      return entry;
    } catch (err) {
      if (callback) {
        callback(err as Error, null);
        return null;
      }
      throw err;
    }
  }

  public readSync(): misc.IDirent | null {
    if (this.closed) {
      throw new Error('Directory is closed');
    }
    if (this.position >= this.entries.length) {
      return null;
    }
    return this.entries[this.position++];
  }

  public async *[Symbol.asyncIterator](): AsyncIterableIterator<misc.IDirent> {
    await this.ensureLoaded();
    for (const entry of this.entries) {
      yield entry;
    }
  }
}
