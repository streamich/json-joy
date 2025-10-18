/**
 * Attribute encoding utilities for NFSv4 server operations.
 */

import type {Stats} from 'node:fs';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../../../../../xdr/XdrEncoder';
import {Nfsv4Attr, Nfsv4FType, Nfsv4FhExpireType, Nfsv4Stat} from '../../../constants';
import * as struct from '../../../structs';
import {SET_ONLY_ATTRS, setBit} from '../../../attributes';
import type {FilesystemStats} from '../FilesystemStats';

/**
 * Encodes file attributes based on the requested bitmap.
 * Returns the attributes as a Nfsv4Fattr structure.
 * @param requestedAttrs Bitmap of requested attributes
 * @param stats Optional file stats (required only if stat-based attributes are requested)
 * @param path File path (for context)
 * @param fh Optional file handle (required only if FATTR4_FILEHANDLE is requested)
 * @param leaseTime Optional lease time in seconds (required only if FATTR4_LEASE_TIME is requested)
 * @param fsStats Optional filesystem statistics (required for space/files attributes)
 */
export const encodeAttrs = (
  requestedAttrs: struct.Nfsv4Bitmap,
  stats: Stats | undefined,
  path: string,
  fh?: Uint8Array,
  leaseTime?: number,
  fsStats?: FilesystemStats,
): struct.Nfsv4Fattr => {
  const writer = new Writer(512);
  const xdr = new XdrEncoder(writer);
  const supportedMask: number[] = [];
  const requested = requestedAttrs.mask;
  for (let i = 0; i < requested.length; i++) {
    const word = requested[i];
    if (!word) continue;
    const wordIndex = i;
    for (let bit = 0; bit < 32; bit++) {
      if (!(word & (1 << bit))) continue;
      const attrNum = wordIndex * 32 + bit;
      switch (attrNum) {
        case Nfsv4Attr.FATTR4_SUPPORTED_ATTRS: {
          const implementedAttrs: number[] = [];
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_SUPPORTED_ATTRS);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_TYPE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_FH_EXPIRE_TYPE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_CHANGE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_SIZE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_LINK_SUPPORT);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_SYMLINK_SUPPORT);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_NAMED_ATTR);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_FSID);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_UNIQUE_HANDLES);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_LEASE_TIME);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_RDATTR_ERROR);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_FILEHANDLE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_FILEID);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_MODE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_NUMLINKS);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_SPACE_USED);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_SPACE_AVAIL);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_SPACE_FREE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_SPACE_TOTAL);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_FILES_AVAIL);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_FILES_FREE);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_FILES_TOTAL);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_TIME_ACCESS);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_TIME_METADATA);
          setBit(implementedAttrs, Nfsv4Attr.FATTR4_TIME_MODIFY);
          xdr.writeUnsignedInt(implementedAttrs.length);
          for (let j = 0; j < implementedAttrs.length; j++) {
            xdr.writeUnsignedInt(implementedAttrs[j]);
          }
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_TYPE: {
          if (!stats) break;
          let type: Nfsv4FType;
          if (stats.isFile()) type = Nfsv4FType.NF4REG;
          else if (stats.isDirectory()) type = Nfsv4FType.NF4DIR;
          else if (stats.isSymbolicLink()) type = Nfsv4FType.NF4LNK;
          else if (stats.isBlockDevice()) type = Nfsv4FType.NF4BLK;
          else if (stats.isCharacterDevice()) type = Nfsv4FType.NF4CHR;
          else if (stats.isFIFO()) type = Nfsv4FType.NF4FIFO;
          else if (stats.isSocket()) type = Nfsv4FType.NF4SOCK;
          else type = Nfsv4FType.NF4REG;
          xdr.writeUnsignedInt(type);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_SIZE: {
          if (!stats) break;
          xdr.writeUnsignedHyper(BigInt(stats.size));
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_FILEID: {
          if (!stats) break;
          xdr.writeUnsignedHyper(BigInt(stats.ino));
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_MODE: {
          if (!stats) break;
          xdr.writeUnsignedInt(stats.mode & 0o7777);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_NUMLINKS: {
          if (!stats) break;
          xdr.writeUnsignedInt(stats.nlink);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_SPACE_USED: {
          if (!stats) break;
          xdr.writeUnsignedHyper(BigInt(stats.blocks * 512));
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_SPACE_AVAIL: {
          if (!fsStats) break;
          xdr.writeUnsignedHyper(fsStats.spaceAvail);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_SPACE_FREE: {
          if (!fsStats) break;
          xdr.writeUnsignedHyper(fsStats.spaceFree);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_SPACE_TOTAL: {
          if (!fsStats) break;
          xdr.writeUnsignedHyper(fsStats.spaceTotal);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_FILES_AVAIL: {
          if (!fsStats) break;
          xdr.writeUnsignedHyper(fsStats.filesAvail);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_FILES_FREE: {
          if (!fsStats) break;
          xdr.writeUnsignedHyper(fsStats.filesFree);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_FILES_TOTAL: {
          if (!fsStats) break;
          xdr.writeUnsignedHyper(fsStats.filesTotal);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_TIME_ACCESS: {
          if (!stats) break;
          const atime = stats.atimeMs;
          const seconds = Math.floor(atime / 1000);
          const nseconds = Math.floor((atime % 1000) * 1000000);
          xdr.writeHyper(BigInt(seconds));
          xdr.writeUnsignedInt(nseconds);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_TIME_MODIFY: {
          if (!stats) break;
          const mtime = stats.mtimeMs;
          const seconds = Math.floor(mtime / 1000);
          const nseconds = Math.floor((mtime % 1000) * 1000000);
          xdr.writeHyper(BigInt(seconds));
          xdr.writeUnsignedInt(nseconds);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_TIME_METADATA: {
          if (!stats) break;
          const ctime = stats.ctimeMs;
          const seconds = Math.floor(ctime / 1000);
          const nseconds = Math.floor((ctime % 1000) * 1000000);
          xdr.writeHyper(BigInt(seconds));
          xdr.writeUnsignedInt(nseconds);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_CHANGE: {
          if (!stats) break;
          const changeTime = BigInt(Math.floor(stats.mtimeMs * 1000000));
          xdr.writeUnsignedHyper(changeTime);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_LEASE_TIME: {
          if (leaseTime !== undefined) {
            xdr.writeUnsignedInt(leaseTime);
            setBit(supportedMask, attrNum);
          }
          break;
        }
        case Nfsv4Attr.FATTR4_FH_EXPIRE_TYPE: {
          xdr.writeUnsignedInt(Nfsv4FhExpireType.FH4_VOLATILE_ANY);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_LINK_SUPPORT: {
          xdr.writeUnsignedInt(1);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_SYMLINK_SUPPORT: {
          xdr.writeUnsignedInt(1);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_NAMED_ATTR: {
          xdr.writeUnsignedInt(0);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_FSID: {
          xdr.writeUnsignedHyper(BigInt(0));
          xdr.writeUnsignedHyper(BigInt(0));
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_UNIQUE_HANDLES: {
          xdr.writeUnsignedInt(1);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_RDATTR_ERROR: {
          xdr.writeUnsignedInt(0);
          setBit(supportedMask, attrNum);
          break;
        }
        case Nfsv4Attr.FATTR4_FILEHANDLE: {
          if (fh) {
            xdr.writeVarlenOpaque(fh);
            setBit(supportedMask, attrNum);
          }
          break;
        }
        default: {
          if (SET_ONLY_ATTRS.has(attrNum)) throw Nfsv4Stat.NFS4ERR_INVAL;
        }
      }
    }
  }
  const attrVals = writer.flush();
  return new struct.Nfsv4Fattr(new struct.Nfsv4Bitmap(supportedMask), attrVals);
};
