import type {NfsFsClient, Nfsv4Client} from './types';
import type * as misc from 'memfs/lib/node/types/misc';
import type * as opts from 'memfs/lib/node/types/options';
import {nfs} from '../builder';
import type * as msg from '../messages';
import * as structs from '../structs';
import {
  Nfsv4Stat,
  Nfsv4OpenAccess,
  Nfsv4OpenDeny,
  Nfsv4StableHow,
  Nfsv4Attr,
  Nfsv4FType,
  Nfsv4Access,
} from '../constants';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {XdrEncoder} from '../../../xdr/XdrEncoder';
import {XdrDecoder} from '../../../xdr/XdrDecoder';
import {NfsFsStats} from './NfsFsStats';
import {NfsFsDir} from './NfsFsDir';
import {NfsFsDirent} from './NfsFsDirent';
import {NfsFsFileHandle} from './NfsFsFileHandle';

export class Nfsv4FsClient implements NfsFsClient {
  constructor(public readonly fs: Nfsv4Client) {}

  private readonly openOwnerSeqids: Map<string, number> = new Map();
  private readonly defaultOpenOwnerId = new Uint8Array([1, 2, 3, 4]);

  private makeOpenOwnerKey(owner: structs.Nfsv4OpenOwner): string {
    return `${owner.clientid}:${Buffer.from(owner.owner).toString('hex')}`;
  }

  private nextOpenOwnerSeqid(owner: structs.Nfsv4OpenOwner): number {
    const key = this.makeOpenOwnerKey(owner);
    const last = this.openOwnerSeqids.get(key);
    const next = last === undefined ? 0 : last === 0xffffffff ? 1 : (last + 1) >>> 0;
    this.openOwnerSeqids.set(key, next);
    return next;
  }

  private createDefaultOpenOwner(): structs.Nfsv4OpenOwner {
    return nfs.OpenOwner(BigInt(1), new Uint8Array(this.defaultOpenOwnerId));
  }

  private attrNumsToBitmap(attrNums: number[]): number[] {
    const bitmap: number[] = [];
    for (const attrNum of attrNums) {
      const wordIndex = Math.floor(attrNum / 32);
      const bitIndex = attrNum % 32;
      while (bitmap.length <= wordIndex) {
        bitmap.push(0);
      }
      bitmap[wordIndex] |= 1 << bitIndex;
    }
    return bitmap;
  }

  private parsePath(path: string): string[] {
    const normalized = path.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!normalized) return [];
    return normalized.split('/').filter((part) => part.length > 0);
  }

  private navigateToParent(parts: string[]): msg.Nfsv4Request[] {
    const operations: msg.Nfsv4Request[] = [nfs.PUTROOTFH()];
    for (const part of parts.slice(0, -1)) {
      operations.push(nfs.LOOKUP(part));
    }
    return operations;
  }

  private navigateToPath(parts: string[]): msg.Nfsv4Request[] {
    const operations: msg.Nfsv4Request[] = [nfs.PUTROOTFH()];
    for (const part of parts) {
      operations.push(nfs.LOOKUP(part));
    }
    return operations;
  }

  private encodeData(data: misc.TPromisesData): Uint8Array {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (typeof data === 'string') return new TextEncoder().encode(data);
    if (Buffer.isBuffer(data)) return new Uint8Array(data);
    throw new Error('Unsupported data type');
  }

  private decodeData(data: Uint8Array, encoding?: string): misc.TDataOut {
    if (!encoding || encoding === 'buffer') return Buffer.from(data);
    return new TextDecoder(encoding).decode(data);
  }

  public readonly closeStateid = async (
    openOwner: structs.Nfsv4OpenOwner,
    stateid: structs.Nfsv4Stateid,
  ): Promise<void> => {
    const key = this.makeOpenOwnerKey(openOwner);
    const previousSeqid = this.openOwnerSeqids.get(key);
    const seqid = this.nextOpenOwnerSeqid(openOwner);
    const response = await this.fs.compound([nfs.CLOSE(seqid, stateid)]);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      if (previousSeqid !== undefined) {
        this.openOwnerSeqids.set(key, previousSeqid);
      } else {
        this.openOwnerSeqids.delete(key);
      }
      throw new Error(`Failed to close file: ${response.status}`);
    }
  };

  public readonly readFile = async (
    id: misc.TFileHandle,
    options?: opts.IReadFileOptions | string,
  ): Promise<misc.TDataOut> => {
    const encoding = typeof options === 'string' ? options : options?.encoding;
    const path = typeof id === 'string' ? id : id.toString();
    const parts = this.parsePath(path);
    const operations = this.navigateToParent(parts);
    const filename = parts[parts.length - 1];
    const openOwner = this.createDefaultOpenOwner();
    const claim = nfs.OpenClaimNull(filename);
    const openSeqid = this.nextOpenOwnerSeqid(openOwner);
    operations.push(
      nfs.OPEN(
        openSeqid,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        claim,
      ),
    );
    const openResponse = await this.fs.compound(operations);
    if (openResponse.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to open file: ${openResponse.status}`);
    }
    const openRes = openResponse.resarray[openResponse.resarray.length - 1] as msg.Nfsv4OpenResponse;
    if (openRes.status !== Nfsv4Stat.NFS4_OK || !openRes.resok) {
      throw new Error(`Failed to open file: ${openRes.status}`);
    }
    const stateid = openRes.resok.stateid;
    const chunks: Uint8Array[] = [];
    let offset = BigInt(0);
    const chunkSize = 65536;
    try {
      while (true) {
        const readResponse = await this.fs.compound([nfs.READ(offset, chunkSize, stateid)]);
        if (readResponse.status !== Nfsv4Stat.NFS4_OK) {
          throw new Error(`Failed to read file: ${readResponse.status}`);
        }
        const readRes = readResponse.resarray[0] as msg.Nfsv4ReadResponse;
        if (readRes.status !== Nfsv4Stat.NFS4_OK || !readRes.resok) {
          throw new Error(`Failed to read file: ${readRes.status}`);
        }
        if (readRes.resok.data.length > 0) {
          chunks.push(readRes.resok.data);
          offset += BigInt(readRes.resok.data.length);
        }
        if (readRes.resok.eof) break;
      }
    } finally {
      await this.closeStateid(openOwner, stateid);
    }
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let position = 0;
    for (const chunk of chunks) {
      result.set(chunk, position);
      position += chunk.length;
    }
    return this.decodeData(result, encoding);
  };

  public readonly writeFile = async (
    id: misc.TFileHandle,
    data: misc.TPromisesData,
    options?: opts.IWriteFileOptions,
  ): Promise<void> => {
    const path = typeof id === 'string' ? id : id.toString();
    const parts = this.parsePath(path);
    const operations = this.navigateToParent(parts);
    const filename = parts[parts.length - 1];
    const openOwner = this.createDefaultOpenOwner();
    const claim = nfs.OpenClaimNull(filename);
    const openSeqid = this.nextOpenOwnerSeqid(openOwner);
    operations.push(
      nfs.OPEN(
        openSeqid,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowCreateUnchecked(),
        claim,
      ),
    );
    const writer = new Writer(16);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(BigInt(0));
    const attrVals = writer.flush();
    const truncateAttrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    operations.push(nfs.SETATTR(stateid, truncateAttrs));
    const openResponse = await this.fs.compound(operations);
    if (openResponse.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to open file: ${openResponse.status}`);
    }
    const openRes = openResponse.resarray[openResponse.resarray.length - 2] as msg.Nfsv4OpenResponse;
    if (openRes.status !== Nfsv4Stat.NFS4_OK || !openRes.resok) {
      throw new Error(`Failed to open file: ${openRes.status}`);
    }
    const openStateid = openRes.resok.stateid;
    const buffer = this.encodeData(data);
    const chunkSize = 65536;
    try {
      let offset = BigInt(0);
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, Math.min(i + chunkSize, buffer.length));
        const writeResponse = await this.fs.compound([
          nfs.WRITE(openStateid, offset, Nfsv4StableHow.FILE_SYNC4, chunk),
        ]);
        if (writeResponse.status !== Nfsv4Stat.NFS4_OK) {
          throw new Error(`Failed to write file: ${writeResponse.status}`);
        }
        const writeRes = writeResponse.resarray[0] as msg.Nfsv4WriteResponse;
        if (writeRes.status !== Nfsv4Stat.NFS4_OK || !writeRes.resok) {
          throw new Error(`Failed to write file: ${writeRes.status}`);
        }
        offset += BigInt(writeRes.resok.count);
      }
    } finally {
      await this.closeStateid(openOwner, openStateid);
    }
  };

  public readonly stat = async (path: misc.PathLike, options?: opts.IStatOptions): Promise<misc.IStats> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    const attrNums = [
      Nfsv4Attr.FATTR4_TYPE,
      Nfsv4Attr.FATTR4_SIZE,
      Nfsv4Attr.FATTR4_FILEID,
      Nfsv4Attr.FATTR4_MODE,
      Nfsv4Attr.FATTR4_NUMLINKS,
      Nfsv4Attr.FATTR4_SPACE_USED,
      Nfsv4Attr.FATTR4_TIME_ACCESS,
      Nfsv4Attr.FATTR4_TIME_MODIFY,
      Nfsv4Attr.FATTR4_TIME_METADATA,
    ];
    const attrMask = this.attrNumsToBitmap(attrNums);
    operations.push(nfs.GETATTR(attrMask));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to stat file: ${response.status}`);
    }
    const getattrRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4GetattrResponse;
    if (getattrRes.status !== Nfsv4Stat.NFS4_OK || !getattrRes.resok) {
      throw new Error(`Failed to get attributes: ${getattrRes.status}`);
    }
    const fattr = getattrRes.resok.objAttributes;
    const reader = new Reader();
    reader.reset(fattr.attrVals);
    const xdr = new XdrDecoder(reader);
    let fileType = Nfsv4FType.NF4REG;
    let size = 0;
    let fileid = 0;
    let mode = 0;
    let nlink = 1;
    let spaceUsed = 0;
    let atime = new Date(0);
    let mtime = new Date(0);
    let ctime = new Date(0);
    const returnedMask = fattr.attrmask.mask;
    for (let i = 0; i < returnedMask.length; i++) {
      const word = returnedMask[i];
      if (!word) continue;
      for (let bit = 0; bit < 32; bit++) {
        if (!(word & (1 << bit))) continue;
        const attrNum = i * 32 + bit;
        switch (attrNum) {
          case Nfsv4Attr.FATTR4_TYPE:
            fileType = xdr.readUnsignedInt();
            break;
          case Nfsv4Attr.FATTR4_SIZE:
            size = Number(xdr.readUnsignedHyper());
            break;
          case Nfsv4Attr.FATTR4_FILEID:
            fileid = Number(xdr.readUnsignedHyper());
            break;
          case Nfsv4Attr.FATTR4_MODE:
            mode = xdr.readUnsignedInt();
            break;
          case Nfsv4Attr.FATTR4_NUMLINKS:
            nlink = xdr.readUnsignedInt();
            break;
          case Nfsv4Attr.FATTR4_SPACE_USED:
            spaceUsed = Number(xdr.readUnsignedHyper());
            break;
          case Nfsv4Attr.FATTR4_TIME_ACCESS: {
            const seconds = Number(xdr.readHyper());
            const nseconds = xdr.readUnsignedInt();
            atime = new Date(seconds * 1000 + nseconds / 1000000);
            break;
          }
          case Nfsv4Attr.FATTR4_TIME_MODIFY: {
            const seconds = Number(xdr.readHyper());
            const nseconds = xdr.readUnsignedInt();
            mtime = new Date(seconds * 1000 + nseconds / 1000000);
            break;
          }
          case Nfsv4Attr.FATTR4_TIME_METADATA: {
            const seconds = Number(xdr.readHyper());
            const nseconds = xdr.readUnsignedInt();
            ctime = new Date(seconds * 1000 + nseconds / 1000000);
            break;
          }
        }
      }
    }
    const blocks = Math.ceil(spaceUsed / 512);
    return new NfsFsStats(
      0,
      0,
      0,
      4096,
      fileid,
      size,
      blocks,
      atime,
      mtime,
      ctime,
      mtime,
      atime.getTime(),
      mtime.getTime(),
      ctime.getTime(),
      mtime.getTime(),
      0,
      mode,
      nlink,
      fileType,
    );
  };

  public readonly lstat = async (path: misc.PathLike, options?: opts.IStatOptions): Promise<misc.IStats> => {
    return this.stat(path, options);
  };

  public readonly mkdir = async (
    path: misc.PathLike,
    options?: misc.TMode | opts.IMkdirOptions,
  ): Promise<string | undefined> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    if (parts.length === 0) {
      throw new Error('Cannot create root directory');
    }
    const operations = this.navigateToParent(parts);
    const dirname = parts[parts.length - 1];
    const createType = nfs.CreateTypeDir();
    const emptyAttrs = nfs.Fattr([], new Uint8Array(0));
    operations.push(nfs.CREATE(createType, dirname, emptyAttrs));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to create directory: ${response.status}`);
    }
    const createRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4CreateResponse;
    if (createRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to create directory: ${createRes.status}`);
    }
    return undefined;
  };

  public readonly readdir = async (
    path: misc.PathLike,
    options?: opts.IReaddirOptions | string,
  ): Promise<misc.TDataOut[] | misc.IDirent[]> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const withFileTypes = typeof options === 'object' && options?.withFileTypes;
    const encoding = typeof options === 'string' ? options : options?.encoding;
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    const attrNums = withFileTypes ? [Nfsv4Attr.FATTR4_TYPE] : [];
    const attrMask = this.attrNumsToBitmap(attrNums);
    operations.push(nfs.READDIR(attrMask));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to read directory: ${response.status}`);
    }
    const readdirRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4ReaddirResponse;
    if (readdirRes.status !== Nfsv4Stat.NFS4_OK || !readdirRes.resok) {
      throw new Error(`Failed to read directory: ${readdirRes.status}`);
    }
    const entries: string[] = [];
    const dirents: misc.IDirent[] = [];
    const entryList = readdirRes.resok.entries;
    for (let i = 0; i < entryList.length; i++) {
      const entry = entryList[i];
      const name = entry.name;
      if (withFileTypes) {
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
        dirents.push(new NfsFsDirent(name, fileType));
      } else {
        entries.push(name);
      }
    }
    if (withFileTypes) {
      return dirents;
    }
    if (encoding && encoding !== 'utf8') {
      return entries.map((name) => Buffer.from(name, 'utf8'));
    }
    return entries;
  };

  public readonly appendFile = async (
    path: misc.TFileHandle,
    data: misc.TData,
    options?: opts.IAppendFileOptions | string,
  ): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToParent(parts);
    const filename = parts[parts.length - 1];
    const openOwner = this.createDefaultOpenOwner();
    const claim = nfs.OpenClaimNull(filename);
    const openSeqid = this.nextOpenOwnerSeqid(openOwner);
    operations.push(
      nfs.OPEN(
        openSeqid,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        claim,
      ),
    );
    const attrNums = [Nfsv4Attr.FATTR4_SIZE];
    const attrMask = this.attrNumsToBitmap(attrNums);
    operations.push(nfs.GETATTR(attrMask));
    const openResponse = await this.fs.compound(operations);
    if (openResponse.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to open file: ${openResponse.status}`);
    }
    const openRes = openResponse.resarray[openResponse.resarray.length - 2] as msg.Nfsv4OpenResponse;
    if (openRes.status !== Nfsv4Stat.NFS4_OK || !openRes.resok) {
      throw new Error(`Failed to open file: ${openRes.status}`);
    }
    const getattrRes = openResponse.resarray[openResponse.resarray.length - 1] as msg.Nfsv4GetattrResponse;
    if (getattrRes.status !== Nfsv4Stat.NFS4_OK || !getattrRes.resok) {
      throw new Error(`Failed to get attributes: ${getattrRes.status}`);
    }
    const fattr = getattrRes.resok.objAttributes;
    const reader = new Reader();
    reader.reset(fattr.attrVals);
    const xdr = new XdrDecoder(reader);
    const currentSize = Number(xdr.readUnsignedHyper());
    const openStateid = openRes.resok.stateid;
    const buffer = this.encodeData(data);
    const chunkSize = 65536;
    try {
      let offset = BigInt(currentSize);
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, Math.min(i + chunkSize, buffer.length));
        const writeResponse = await this.fs.compound([
          nfs.WRITE(openStateid, offset, Nfsv4StableHow.FILE_SYNC4, chunk),
        ]);
        if (writeResponse.status !== Nfsv4Stat.NFS4_OK) {
          throw new Error(`Failed to write file: ${writeResponse.status}`);
        }
        const writeRes = writeResponse.resarray[0] as msg.Nfsv4WriteResponse;
        if (writeRes.status !== Nfsv4Stat.NFS4_OK || !writeRes.resok) {
          throw new Error(`Failed to write file: ${writeRes.status}`);
        }
        offset += BigInt(writeRes.resok.count);
      }
    } finally {
      await this.closeStateid(openOwner, openStateid);
    }
  };

  public readonly truncate = async (path: misc.PathLike, len: number = 0): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    const writer = new Writer(16);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(BigInt(len));
    const attrVals = writer.flush();
    const sizeAttrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    operations.push(nfs.SETATTR(stateid, sizeAttrs));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to truncate file: ${response.status}`);
    }
    const setattrRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4SetattrResponse;
    if (setattrRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to truncate file: ${setattrRes.status}`);
    }
  };

  public readonly unlink = async (path: misc.PathLike): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    if (parts.length === 0) {
      throw new Error('Cannot unlink root directory');
    }
    const operations = this.navigateToParent(parts);
    const filename = parts[parts.length - 1];
    operations.push(nfs.REMOVE(filename));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to unlink file: ${response.status}`);
    }
    const removeRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4RemoveResponse;
    if (removeRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to unlink file: ${removeRes.status}`);
    }
  };

  public readonly rmdir = async (path: misc.PathLike, options?: opts.IRmdirOptions): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    if (parts.length === 0) {
      throw new Error('Cannot remove root directory');
    }
    const operations = this.navigateToParent(parts);
    const dirname = parts[parts.length - 1];
    operations.push(nfs.REMOVE(dirname));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to remove directory: ${response.status}`);
    }
    const removeRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4RemoveResponse;
    if (removeRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to remove directory: ${removeRes.status}`);
    }
  };

  public readonly rm = async (path: misc.PathLike, options?: opts.IRmOptions): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    if (parts.length === 0) {
      throw new Error('Cannot remove root directory');
    }
    const force = options?.force ?? false;
    const recursive = options?.recursive ?? false;
    if (recursive) {
      try {
        const stats = await this.stat(path);
        if (stats.isDirectory()) {
          const entries = await this.readdir(path);
          for (const entry of entries) {
            const entryPath = pathStr + '/' + entry;
            await this.rm(entryPath, options);
          }
        }
      } catch (err) {
        if (!force) throw err;
        return;
      }
    }
    try {
      const operations = this.navigateToParent(parts);
      const name = parts[parts.length - 1];
      operations.push(nfs.REMOVE(name));
      const response = await this.fs.compound(operations);
      if (response.status !== Nfsv4Stat.NFS4_OK) {
        if (!force) throw new Error(`Failed to remove: ${response.status}`);
        return;
      }
      const removeRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4RemoveResponse;
      if (removeRes.status !== Nfsv4Stat.NFS4_OK) {
        if (!force) throw new Error(`Failed to remove: ${removeRes.status}`);
      }
    } catch (err) {
      if (!force) throw err;
    }
  };

  public readonly access = async (path: misc.PathLike, mode: number = 0): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    let accessMask = 0;
    if (mode === 0) {
      accessMask = Nfsv4Access.ACCESS4_READ;
    } else {
      if (mode & 4) accessMask |= Nfsv4Access.ACCESS4_READ;
      if (mode & 2) accessMask |= Nfsv4Access.ACCESS4_MODIFY;
      if (mode & 1) accessMask |= Nfsv4Access.ACCESS4_EXECUTE;
    }
    operations.push(nfs.ACCESS(accessMask));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Access denied: ${response.status}`);
    }
    const accessRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4AccessResponse;
    if (accessRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Access denied: ${accessRes.status}`);
    }
  };

  public readonly rename = async (oldPath: misc.PathLike, newPath: misc.PathLike): Promise<void> => {
    const oldPathStr = typeof oldPath === 'string' ? oldPath : oldPath.toString();
    const newPathStr = typeof newPath === 'string' ? newPath : newPath.toString();
    const oldParts = this.parsePath(oldPathStr);
    const newParts = this.parsePath(newPathStr);
    if (oldParts.length === 0 || newParts.length === 0) {
      throw new Error('Cannot rename root directory');
    }
    const operations: msg.Nfsv4Request[] = [];
    operations.push(nfs.PUTROOTFH());
    for (const part of oldParts.slice(0, -1)) {
      operations.push(nfs.LOOKUP(part));
    }
    operations.push(nfs.SAVEFH());
    operations.push(nfs.PUTROOTFH());
    for (const part of newParts.slice(0, -1)) {
      operations.push(nfs.LOOKUP(part));
    }
    const oldname = oldParts[oldParts.length - 1];
    const newname = newParts[newParts.length - 1];
    operations.push(nfs.RENAME(oldname, newname));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to rename: ${response.status}`);
    }
    const renameRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4RenameResponse;
    if (renameRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to rename: ${renameRes.status}`);
    }
  };

  public readonly copyFile = async (
    src: misc.PathLike,
    dest: misc.PathLike,
    flags?: misc.TFlagsCopy,
  ): Promise<void> => {
    const data = await this.readFile(src);
    await this.writeFile(dest, data);
  };

  public readonly realpath = async (
    path: misc.PathLike,
    options?: opts.IRealpathOptions | string,
  ): Promise<misc.TDataOut> => {
    const encoding = typeof options === 'string' ? options : options?.encoding;
    const pathStr = typeof path === 'string' ? path : path.toString();
    const normalized = '/' + this.parsePath(pathStr).join('/');
    if (!encoding || encoding === 'utf8') {
      return normalized;
    }
    return Buffer.from(normalized, 'utf8');
  };

  public readonly link = async (existingPath: misc.PathLike, newPath: misc.PathLike): Promise<void> => {
    const existingPathStr = typeof existingPath === 'string' ? existingPath : existingPath.toString();
    const newPathStr = typeof newPath === 'string' ? newPath : newPath.toString();
    const existingParts = this.parsePath(existingPathStr);
    const newParts = this.parsePath(newPathStr);
    if (newParts.length === 0) {
      throw new Error('Cannot create link at root');
    }
    const operations = this.navigateToPath(existingParts);
    operations.push(nfs.SAVEFH());
    operations.push(nfs.PUTROOTFH());
    for (const part of newParts.slice(0, -1)) {
      operations.push(nfs.LOOKUP(part));
    }
    const newname = newParts[newParts.length - 1];
    operations.push(nfs.LINK(newname));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to create link: ${response.status}`);
    }
    const linkRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4LinkResponse;
    if (linkRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to create link: ${linkRes.status}`);
    }
  };

  public readonly symlink = async (
    target: misc.PathLike,
    path: misc.PathLike,
    type?: misc.symlink.Type,
  ): Promise<void> => {
    const targetStr = typeof target === 'string' ? target : target.toString();
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    if (parts.length === 0) {
      throw new Error('Cannot create symlink at root');
    }
    const operations = this.navigateToParent(parts);
    const linkname = parts[parts.length - 1];
    const createType = new structs.Nfsv4CreateType(Nfsv4FType.NF4LNK, new structs.Nfsv4CreateTypeLink(targetStr));
    const emptyAttrs = nfs.Fattr([], new Uint8Array(0));
    operations.push(nfs.CREATE(createType, linkname, emptyAttrs));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to create symlink: ${response.status}`);
    }
    const createRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4CreateResponse;
    if (createRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to create symlink: ${createRes.status}`);
    }
  };

  public readonly utimes = async (path: misc.PathLike, atime: misc.TTime, mtime: misc.TTime): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    const atimeMs = typeof atime === 'number' ? atime : atime instanceof Date ? atime.getTime() : Date.now();
    const mtimeMs = typeof mtime === 'number' ? mtime : mtime instanceof Date ? mtime.getTime() : Date.now();
    const writer = new Writer(64);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedInt(1);
    xdr.writeHyper(BigInt(Math.floor(atimeMs / 1000)));
    xdr.writeUnsignedInt((atimeMs % 1000) * 1000000);
    xdr.writeUnsignedInt(1);
    xdr.writeHyper(BigInt(Math.floor(mtimeMs / 1000)));
    xdr.writeUnsignedInt((mtimeMs % 1000) * 1000000);
    const attrVals = writer.flush();
    const timeAttrs = nfs.Fattr([Nfsv4Attr.FATTR4_TIME_ACCESS_SET, Nfsv4Attr.FATTR4_TIME_MODIFY_SET], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    operations.push(nfs.SETATTR(stateid, timeAttrs));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to set times: ${response.status}`);
    }
    const setattrRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4SetattrResponse;
    if (setattrRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to set times: ${setattrRes.status}`);
    }
  };

  public readonly readlink = async (path: misc.PathLike, options?: opts.IOptions): Promise<misc.TDataOut> => {
    const encoding = typeof options === 'string' ? options : options?.encoding;
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    operations.push(nfs.READLINK());
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to read link: ${response.status}`);
    }
    const readlinkRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4ReadlinkResponse;
    if (readlinkRes.status !== Nfsv4Stat.NFS4_OK || !readlinkRes.resok) {
      throw new Error(`Failed to read link: ${readlinkRes.status}`);
    }
    if (!encoding || encoding === 'utf8') {
      return readlinkRes.resok.link;
    }
    return Buffer.from(readlinkRes.resok.link, 'utf8');
  };

  public readonly opendir = async (path: misc.PathLike, options?: opts.IOpendirOptions): Promise<misc.IDir> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    return new NfsFsDir(pathStr, this.fs, operations);
  };

  public readonly mkdtemp = async (prefix: string, options?: opts.IOptions): Promise<misc.TDataOut> => {
    const encoding = typeof options === 'string' ? options : options?.encoding;
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const dirName = prefix + randomSuffix;
    await this.mkdir(dirName);
    if (!encoding || encoding === 'utf8') return dirName;
    return Buffer.from(dirName, 'utf8');
  };

  public readonly chmod = async (path: misc.PathLike, mode: misc.TMode): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    const modeValue = typeof mode === 'number' ? mode : parseInt(mode.toString(), 8);
    const writer = new Writer(8);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedInt(modeValue);
    const attrVals = writer.flush();
    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_MODE], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    operations.push(nfs.SETATTR(stateid, attrs));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to chmod: ${response.status}`);
    }
    const setattrRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4SetattrResponse;
    if (setattrRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to chmod: ${setattrRes.status}`);
    }
  };

  public readonly chown = async (path: misc.PathLike, uid: number, gid: number): Promise<void> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToPath(parts);
    const writer = new Writer(64);
    const xdr = new XdrEncoder(writer);
    xdr.writeStr(uid.toString());
    xdr.writeStr(gid.toString());
    const attrVals = writer.flush();
    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_OWNER, Nfsv4Attr.FATTR4_OWNER_GROUP], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    operations.push(nfs.SETATTR(stateid, attrs));
    const response = await this.fs.compound(operations);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to chown: ${response.status}`);
    }
    const setattrRes = response.resarray[response.resarray.length - 1] as msg.Nfsv4SetattrResponse;
    if (setattrRes.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to chown: ${setattrRes.status}`);
    }
  };

  public readonly lchmod = async (path: misc.PathLike, mode: misc.TMode): Promise<void> => {
    return this.chmod(path, mode);
  };

  public readonly lchown = async (path: misc.PathLike, uid: number, gid: number): Promise<void> => {
    return this.chown(path, uid, gid);
  };

  public readonly lutimes = async (path: misc.PathLike, atime: misc.TTime, mtime: misc.TTime): Promise<void> => {
    return this.utimes(path, atime, mtime);
  };

  public readonly open = async (
    path: misc.PathLike,
    flags?: misc.TFlags,
    mode?: misc.TMode,
  ): Promise<misc.IFileHandle> => {
    const pathStr = typeof path === 'string' ? path : path.toString();
    const parts = this.parsePath(pathStr);
    const operations = this.navigateToParent(parts);
    const filename = parts[parts.length - 1];
    const openOwner = this.createDefaultOpenOwner();
    const claim = nfs.OpenClaimNull(filename);
    let access = Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ;
    const openSeqid = this.nextOpenOwnerSeqid(openOwner);
    if (typeof flags === 'string') {
      if (flags.includes('r') && flags.includes('+')) {
        access = Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH;
      } else if (flags.includes('w') || flags.includes('a')) {
        access = Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE;
        if (flags.includes('+')) {
          access = Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH;
        }
      }
    } else if (typeof flags === 'number') {
      const O_RDONLY = 0;
      const O_WRONLY = 1;
      const O_RDWR = 2;
      const O_ACCMODE = 3;
      const accessMode = flags & O_ACCMODE;
      switch (accessMode) {
        case O_RDONLY:
          access = Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ;
          break;
        case O_WRONLY:
          access = Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE;
          break;
        case O_RDWR:
          access = Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH;
          break;
      }
    }
    operations.push(
      nfs.OPEN(openSeqid, access, Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE, openOwner, nfs.OpenHowNoCreate(), claim),
    );
    const openResponse = await this.fs.compound(operations);
    if (openResponse.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to open file: ${openResponse.status}`);
    }
    const openRes = openResponse.resarray[openResponse.resarray.length - 1] as msg.Nfsv4OpenResponse;
    if (openRes.status !== Nfsv4Stat.NFS4_OK || !openRes.resok) {
      throw new Error(`Failed to open file: ${openRes.status}`);
    }
    const stateid = openRes.resok.stateid;
    const fd = Math.floor(Math.random() * 1000000);
    return new NfsFsFileHandle(fd, pathStr, this, stateid, openOwner);
  };

  public readonly statfs = (path: misc.PathLike, options?: opts.IStatOptions): Promise<misc.IStatFs> => {
    throw new Error('Not implemented.');
  };

  public readonly watch = (
    filename: misc.PathLike,
    options?: opts.IWatchOptions,
  ): AsyncIterableIterator<{
    eventType: string;
    filename: string | Buffer;
  }> => {
    throw new Error('Not implemented.');
  };

  // glob is not supported in current memfs version
  // public readonly glob = (pattern: string, options?: opts.IGlobOptions): Promise<string[]> => {
  //   throw new Error('Not implemented.');
  // };
}
