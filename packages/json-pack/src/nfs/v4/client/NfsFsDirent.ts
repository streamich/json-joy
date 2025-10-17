import type * as misc from 'memfs/lib/node/types/misc';
import {Nfsv4FType} from '../constants';

/**
 * Implements Node.js-like Dirent interface for NFS v4 directory entries.
 */
export class NfsFsDirent implements misc.IDirent {
  constructor(
    public name: string,
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
