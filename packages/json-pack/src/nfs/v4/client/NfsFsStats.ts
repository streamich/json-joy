import type * as misc from 'memfs/lib/node/types/misc';
import {Nfsv4FType} from '../constants';

/**
 * Implements Node.js-like Stats interface for NFS v4 file attributes.
 */
export class NfsFsStats implements misc.IStats<number> {
  constructor(
    public uid: number,
    public gid: number,
    public rdev: number,
    public blksize: number,
    public ino: number,
    public size: number,
    public blocks: number,
    public atime: Date,
    public mtime: Date,
    public ctime: Date,
    public birthtime: Date,
    public atimeMs: number,
    public mtimeMs: number,
    public ctimeMs: number,
    public birthtimeMs: number,
    public dev: number,
    public mode: number,
    public nlink: number,
    private type: Nfsv4FType,
  ) {}

  isDirectory(): boolean {
    return this.type === Nfsv4FType.NF4DIR;
  }

  isFile(): boolean {
    return this.type === Nfsv4FType.NF4REG;
  }

  isBlockDevice(): boolean {
    return this.type === Nfsv4FType.NF4BLK;
  }

  isCharacterDevice(): boolean {
    return this.type === Nfsv4FType.NF4CHR;
  }

  isSymbolicLink(): boolean {
    return this.type === Nfsv4FType.NF4LNK;
  }

  isFIFO(): boolean {
    return this.type === Nfsv4FType.NF4FIFO;
  }

  isSocket(): boolean {
    return this.type === Nfsv4FType.NF4SOCK;
  }
}
