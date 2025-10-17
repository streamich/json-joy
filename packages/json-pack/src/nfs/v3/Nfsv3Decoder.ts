import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {XdrDecoder} from '../../xdr/XdrDecoder';
import {Nfsv3FType, Nfsv3TimeHow, Nfsv3CreateMode, Nfsv3Proc} from './constants';
import {Nfsv3DecodingError} from './errors';
import * as msg from './messages';
import * as structs from './structs';

export class Nfsv3Decoder {
  protected readonly xdr: XdrDecoder;

  constructor(reader: Reader = new Reader()) {
    this.xdr = new XdrDecoder(reader);
  }

  public decodeMessage(reader: Reader, proc: Nfsv3Proc, isRequest: boolean): msg.Nfsv3Message | undefined {
    this.xdr.reader = reader;
    const startPos = reader.x;
    try {
      if (isRequest) {
        return this.decodeRequest(proc);
      } else {
        return this.decodeResponse(proc);
      }
    } catch (err) {
      if (err instanceof RangeError) {
        reader.x = startPos;
        return undefined;
      }
      throw err;
    }
  }

  private decodeRequest(proc: Nfsv3Proc): msg.Nfsv3Request | undefined {
    switch (proc) {
      case Nfsv3Proc.GETATTR:
        return this.decodeGetattrRequest();
      case Nfsv3Proc.SETATTR:
        return this.decodeSetattrRequest();
      case Nfsv3Proc.LOOKUP:
        return this.decodeLookupRequest();
      case Nfsv3Proc.ACCESS:
        return this.decodeAccessRequest();
      case Nfsv3Proc.READLINK:
        return this.decodeReadlinkRequest();
      case Nfsv3Proc.READ:
        return this.decodeReadRequest();
      case Nfsv3Proc.WRITE:
        return this.decodeWriteRequest();
      case Nfsv3Proc.CREATE:
        return this.decodeCreateRequest();
      case Nfsv3Proc.MKDIR:
        return this.decodeMkdirRequest();
      case Nfsv3Proc.SYMLINK:
        return this.decodeSymlinkRequest();
      case Nfsv3Proc.MKNOD:
        return this.decodeMknodRequest();
      case Nfsv3Proc.REMOVE:
        return this.decodeRemoveRequest();
      case Nfsv3Proc.RMDIR:
        return this.decodeRmdirRequest();
      case Nfsv3Proc.RENAME:
        return this.decodeRenameRequest();
      case Nfsv3Proc.LINK:
        return this.decodeLinkRequest();
      case Nfsv3Proc.READDIR:
        return this.decodeReaddirRequest();
      case Nfsv3Proc.READDIRPLUS:
        return this.decodeReaddirplusRequest();
      case Nfsv3Proc.FSSTAT:
        return this.decodeFsstatRequest();
      case Nfsv3Proc.FSINFO:
        return this.decodeFsinfoRequest();
      case Nfsv3Proc.PATHCONF:
        return this.decodePathconfRequest();
      case Nfsv3Proc.COMMIT:
        return this.decodeCommitRequest();
      default:
        throw new Nfsv3DecodingError(`Unknown procedure: \${proc}`);
    }
  }

  private decodeResponse(proc: Nfsv3Proc): msg.Nfsv3Response | undefined {
    switch (proc) {
      case Nfsv3Proc.GETATTR:
        return this.decodeGetattrResponse();
      case Nfsv3Proc.SETATTR:
        return this.decodeSetattrResponse();
      case Nfsv3Proc.LOOKUP:
        return this.decodeLookupResponse();
      case Nfsv3Proc.ACCESS:
        return this.decodeAccessResponse();
      case Nfsv3Proc.READLINK:
        return this.decodeReadlinkResponse();
      case Nfsv3Proc.READ:
        return this.decodeReadResponse();
      case Nfsv3Proc.WRITE:
        return this.decodeWriteResponse();
      case Nfsv3Proc.CREATE:
        return this.decodeCreateResponse();
      case Nfsv3Proc.MKDIR:
        return this.decodeMkdirResponse();
      case Nfsv3Proc.SYMLINK:
        return this.decodeSymlinkResponse();
      case Nfsv3Proc.MKNOD:
        return this.decodeMknodResponse();
      case Nfsv3Proc.REMOVE:
        return this.decodeRemoveResponse();
      case Nfsv3Proc.RMDIR:
        return this.decodeRmdirResponse();
      case Nfsv3Proc.RENAME:
        return this.decodeRenameResponse();
      case Nfsv3Proc.LINK:
        return this.decodeLinkResponse();
      case Nfsv3Proc.READDIR:
        return this.decodeReaddirResponse();
      case Nfsv3Proc.READDIRPLUS:
        return this.decodeReaddirplusResponse();
      case Nfsv3Proc.FSSTAT:
        return this.decodeFsstatResponse();
      case Nfsv3Proc.FSINFO:
        return this.decodeFsinfoResponse();
      case Nfsv3Proc.PATHCONF:
        return this.decodePathconfResponse();
      case Nfsv3Proc.COMMIT:
        return this.decodeCommitResponse();
      default:
        throw new Nfsv3DecodingError(`Unknown procedure: \${proc}`);
    }
  }

  private readFh(): structs.Nfsv3Fh {
    const data = this.xdr.readVarlenOpaque();
    return new structs.Nfsv3Fh(data);
  }

  private readFilename(): string {
    return this.xdr.readString();
  }

  private readTime(): structs.Nfsv3Time {
    const xdr = this.xdr;
    const seconds = xdr.readUnsignedInt();
    const nseconds = xdr.readUnsignedInt();
    return new structs.Nfsv3Time(seconds, nseconds);
  }

  private readSpecData(): structs.Nfsv3SpecData {
    const xdr = this.xdr;
    const specdata1 = xdr.readUnsignedInt();
    const specdata2 = xdr.readUnsignedInt();
    return new structs.Nfsv3SpecData(specdata1, specdata2);
  }

  private readFattr(): structs.Nfsv3Fattr {
    const xdr = this.xdr;
    const type = xdr.readUnsignedInt() as Nfsv3FType;
    const mode = xdr.readUnsignedInt();
    const nlink = xdr.readUnsignedInt();
    const uid = xdr.readUnsignedInt();
    const gid = xdr.readUnsignedInt();
    const size = xdr.readUnsignedHyper();
    const used = xdr.readUnsignedHyper();
    const rdev = this.readSpecData();
    const fsid = xdr.readUnsignedHyper();
    const fileid = xdr.readUnsignedHyper();
    const atime = this.readTime();
    const mtime = this.readTime();
    const ctime = this.readTime();
    return new structs.Nfsv3Fattr(type, mode, nlink, uid, gid, size, used, rdev, fsid, fileid, atime, mtime, ctime);
  }

  private readPostOpAttr(): structs.Nfsv3PostOpAttr {
    const attributesFollow = this.xdr.readBoolean();
    const attributes = attributesFollow ? this.readFattr() : undefined;
    return new structs.Nfsv3PostOpAttr(attributesFollow, attributes);
  }

  private readWccAttr(): structs.Nfsv3WccAttr {
    const size = this.xdr.readUnsignedHyper();
    const mtime = this.readTime();
    const ctime = this.readTime();
    return new structs.Nfsv3WccAttr(size, mtime, ctime);
  }

  private readPreOpAttr(): structs.Nfsv3PreOpAttr {
    const attributesFollow = this.xdr.readBoolean();
    const attributes = attributesFollow ? this.readWccAttr() : undefined;
    return new structs.Nfsv3PreOpAttr(attributesFollow, attributes);
  }

  private readWccData(): structs.Nfsv3WccData {
    const before = this.readPreOpAttr();
    const after = this.readPostOpAttr();
    return new structs.Nfsv3WccData(before, after);
  }

  private readPostOpFh(): structs.Nfsv3PostOpFh {
    const handleFollows = this.xdr.readBoolean();
    const handle = handleFollows ? this.readFh() : undefined;
    return new structs.Nfsv3PostOpFh(handleFollows, handle);
  }

  private readSetMode(): structs.Nfsv3SetMode {
    const set = this.xdr.readBoolean();
    const mode = set ? this.xdr.readUnsignedInt() : undefined;
    return new structs.Nfsv3SetMode(set, mode);
  }

  private readSetUid(): structs.Nfsv3SetUid {
    const set = this.xdr.readBoolean();
    const uid = set ? this.xdr.readUnsignedInt() : undefined;
    return new structs.Nfsv3SetUid(set, uid);
  }

  private readSetGid(): structs.Nfsv3SetGid {
    const set = this.xdr.readBoolean();
    const gid = set ? this.xdr.readUnsignedInt() : undefined;
    return new structs.Nfsv3SetGid(set, gid);
  }

  private readSetSize(): structs.Nfsv3SetSize {
    const set = this.xdr.readBoolean();
    const size = set ? this.xdr.readUnsignedHyper() : undefined;
    return new structs.Nfsv3SetSize(set, size);
  }

  private readSetAtime(): structs.Nfsv3SetAtime {
    const how = this.xdr.readUnsignedInt() as Nfsv3TimeHow;
    const atime = how === Nfsv3TimeHow.SET_TO_CLIENT_TIME ? this.readTime() : undefined;
    return new structs.Nfsv3SetAtime(how, atime);
  }

  private readSetMtime(): structs.Nfsv3SetMtime {
    const how = this.xdr.readUnsignedInt() as Nfsv3TimeHow;
    const mtime = how === Nfsv3TimeHow.SET_TO_CLIENT_TIME ? this.readTime() : undefined;
    return new structs.Nfsv3SetMtime(how, mtime);
  }

  private readSattr(): structs.Nfsv3Sattr {
    const mode = this.readSetMode();
    const uid = this.readSetUid();
    const gid = this.readSetGid();
    const size = this.readSetSize();
    const atime = this.readSetAtime();
    const mtime = this.readSetMtime();
    return new structs.Nfsv3Sattr(mode, uid, gid, size, atime, mtime);
  }

  private readSattrGuard(): structs.Nfsv3SattrGuard {
    const check = this.xdr.readBoolean();
    const objCtime = check ? this.readTime() : undefined;
    return new structs.Nfsv3SattrGuard(check, objCtime);
  }

  private readDirOpArgs(): structs.Nfsv3DirOpArgs {
    const dir = this.readFh();
    const name = this.readFilename();
    return new structs.Nfsv3DirOpArgs(dir, name);
  }

  private readCreateHow(): structs.Nfsv3CreateHow {
    const xdr = this.xdr;
    const mode = xdr.readUnsignedInt() as Nfsv3CreateMode;
    let objAttributes: structs.Nfsv3Sattr | undefined;
    let verf: Uint8Array | undefined;
    // tslint:disable-next-line
    if (mode === Nfsv3CreateMode.UNCHECKED || mode === Nfsv3CreateMode.GUARDED) {
      objAttributes = this.readSattr();
    } else if (mode === Nfsv3CreateMode.EXCLUSIVE) {
      const verfData = xdr.readOpaque(8);
      verf = verfData;
    }
    return new structs.Nfsv3CreateHow(mode, objAttributes, verf);
  }

  private readMknodData(): structs.Nfsv3MknodData {
    const type = this.xdr.readUnsignedInt() as Nfsv3FType;
    let chr: structs.Nfsv3DeviceData | undefined;
    let blk: structs.Nfsv3DeviceData | undefined;
    let sock: structs.Nfsv3Sattr | undefined;
    let pipe: structs.Nfsv3Sattr | undefined;
    switch (type) {
      case Nfsv3FType.NF3CHR:
        chr = new structs.Nfsv3DeviceData(this.readSattr(), this.readSpecData());
        break;
      case Nfsv3FType.NF3BLK:
        blk = new structs.Nfsv3DeviceData(this.readSattr(), this.readSpecData());
        break;
      case Nfsv3FType.NF3SOCK:
        sock = this.readSattr();
        break;
      case Nfsv3FType.NF3FIFO:
        pipe = this.readSattr();
        break;
    }
    return new structs.Nfsv3MknodData(type, chr, blk, sock, pipe);
  }

  private readEntry(): structs.Nfsv3Entry | undefined {
    const xdr = this.xdr;
    const valueFollows = xdr.readBoolean();
    if (!valueFollows) return undefined;
    const fileid = xdr.readUnsignedHyper();
    const name = this.readFilename();
    const cookie = xdr.readUnsignedHyper();
    const nextentry = this.readEntry();
    return new structs.Nfsv3Entry(fileid, name, cookie, nextentry);
  }

  private readEntryPlus(): structs.Nfsv3EntryPlus | undefined {
    const xdr = this.xdr;
    const valueFollows = xdr.readBoolean();
    if (!valueFollows) return undefined;
    const fileid = xdr.readUnsignedHyper();
    const name = this.readFilename();
    const cookie = xdr.readUnsignedHyper();
    const nameAttributes = this.readPostOpAttr();
    const nameHandle = this.readPostOpFh();
    const nextentry = this.readEntryPlus();
    return new structs.Nfsv3EntryPlus(fileid, name, cookie, nameAttributes, nameHandle, nextentry);
  }

  private readDirList(): structs.Nfsv3DirList {
    const entries = this.readEntry();
    const eof = this.xdr.readBoolean();
    return new structs.Nfsv3DirList(eof, entries);
  }

  private readDirListPlus(): structs.Nfsv3DirListPlus {
    const entries = this.readEntryPlus();
    const eof = this.xdr.readBoolean();
    return new structs.Nfsv3DirListPlus(eof, entries);
  }

  private decodeGetattrRequest(): msg.Nfsv3GetattrRequest {
    const object = this.readFh();
    return new msg.Nfsv3GetattrRequest(object);
  }

  private decodeGetattrResponse(): msg.Nfsv3GetattrResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3GetattrResOk | undefined;
    if (status === 0) {
      const objAttributes = this.readFattr();
      resok = new msg.Nfsv3GetattrResOk(objAttributes);
    }
    return new msg.Nfsv3GetattrResponse(status, resok);
  }

  private decodeSetattrRequest(): msg.Nfsv3SetattrRequest {
    const object = this.readFh();
    const newAttributes = this.readSattr();
    const guard = this.readSattrGuard();
    return new msg.Nfsv3SetattrRequest(object, newAttributes, guard);
  }

  private decodeSetattrResponse(): msg.Nfsv3SetattrResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3SetattrResOk | undefined;
    let resfail: msg.Nfsv3SetattrResFail | undefined;
    const objWcc = this.readWccData();
    if (status === 0) {
      resok = new msg.Nfsv3SetattrResOk(objWcc);
    } else {
      resfail = new msg.Nfsv3SetattrResFail(objWcc);
    }
    return new msg.Nfsv3SetattrResponse(status, resok, resfail);
  }

  private decodeLookupRequest(): msg.Nfsv3LookupRequest {
    const what = this.readDirOpArgs();
    return new msg.Nfsv3LookupRequest(what);
  }

  private decodeLookupResponse(): msg.Nfsv3LookupResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3LookupResOk | undefined;
    let resfail: msg.Nfsv3LookupResFail | undefined;
    if (status === 0) {
      const object = this.readFh();
      const objAttributes = this.readPostOpAttr();
      const dirAttributes = this.readPostOpAttr();
      resok = new msg.Nfsv3LookupResOk(object, objAttributes, dirAttributes);
    } else {
      const dirAttributes = this.readPostOpAttr();
      resfail = new msg.Nfsv3LookupResFail(dirAttributes);
    }
    return new msg.Nfsv3LookupResponse(status, resok, resfail);
  }

  private decodeAccessRequest(): msg.Nfsv3AccessRequest {
    const object = this.readFh();
    const access = this.xdr.readUnsignedInt();
    return new msg.Nfsv3AccessRequest(object, access);
  }

  private decodeAccessResponse(): msg.Nfsv3AccessResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3AccessResOk | undefined;
    let resfail: msg.Nfsv3AccessResFail | undefined;
    const objAttributes = this.readPostOpAttr();
    if (status === 0) {
      const access = xdr.readUnsignedInt();
      resok = new msg.Nfsv3AccessResOk(objAttributes, access);
    } else {
      resfail = new msg.Nfsv3AccessResFail(objAttributes);
    }
    return new msg.Nfsv3AccessResponse(status, resok, resfail);
  }

  private decodeReadlinkRequest(): msg.Nfsv3ReadlinkRequest {
    const symlink = this.readFh();
    return new msg.Nfsv3ReadlinkRequest(symlink);
  }

  private decodeReadlinkResponse(): msg.Nfsv3ReadlinkResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3ReadlinkResOk | undefined;
    let resfail: msg.Nfsv3ReadlinkResFail | undefined;
    const symlinkAttributes = this.readPostOpAttr();
    if (status === 0) {
      const data = this.readFilename();
      resok = new msg.Nfsv3ReadlinkResOk(symlinkAttributes, data);
    } else {
      resfail = new msg.Nfsv3ReadlinkResFail(symlinkAttributes);
    }
    return new msg.Nfsv3ReadlinkResponse(status, resok, resfail);
  }

  private decodeReadRequest(): msg.Nfsv3ReadRequest {
    const file = this.readFh();
    const xdr = this.xdr;
    const offset = xdr.readUnsignedHyper();
    const count = xdr.readUnsignedInt();
    return new msg.Nfsv3ReadRequest(file, offset, count);
  }

  private decodeReadResponse(): msg.Nfsv3ReadResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3ReadResOk | undefined;
    let resfail: msg.Nfsv3ReadResFail | undefined;
    const fileAttributes = this.readPostOpAttr();
    if (status === 0) {
      const xdr = this.xdr;
      const count = xdr.readUnsignedInt();
      const eof = xdr.readBoolean();
      const data = xdr.readVarlenOpaque();
      resok = new msg.Nfsv3ReadResOk(fileAttributes, count, eof, data);
    } else {
      resfail = new msg.Nfsv3ReadResFail(fileAttributes);
    }
    return new msg.Nfsv3ReadResponse(status, resok, resfail);
  }

  private decodeWriteRequest(): msg.Nfsv3WriteRequest {
    const file = this.readFh();
    const xdr = this.xdr;
    const offset = xdr.readUnsignedHyper();
    const count = xdr.readUnsignedInt();
    const stable = xdr.readUnsignedInt();
    const data = xdr.readVarlenOpaque();
    return new msg.Nfsv3WriteRequest(file, offset, count, stable, data);
  }

  private decodeWriteResponse(): msg.Nfsv3WriteResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3WriteResOk | undefined;
    let resfail: msg.Nfsv3WriteResFail | undefined;
    const fileWcc = this.readWccData();
    if (status === 0) {
      const count = xdr.readUnsignedInt();
      const committed = xdr.readUnsignedInt();
      const verf = xdr.readOpaque(8);
      resok = new msg.Nfsv3WriteResOk(fileWcc, count, committed, verf);
    } else {
      resfail = new msg.Nfsv3WriteResFail(fileWcc);
    }
    return new msg.Nfsv3WriteResponse(status, resok, resfail);
  }

  private decodeCreateRequest(): msg.Nfsv3CreateRequest {
    const where = this.readDirOpArgs();
    const how = this.readCreateHow();
    return new msg.Nfsv3CreateRequest(where, how);
  }

  private decodeCreateResponse(): msg.Nfsv3CreateResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3CreateResOk | undefined;
    let resfail: msg.Nfsv3CreateResFail | undefined;
    if (status === 0) {
      const obj = this.readPostOpFh();
      const objAttributes = this.readPostOpAttr();
      const dirWcc = this.readWccData();
      resok = new msg.Nfsv3CreateResOk(obj, objAttributes, dirWcc);
    } else {
      const dirWcc = this.readWccData();
      resfail = new msg.Nfsv3CreateResFail(dirWcc);
    }
    return new msg.Nfsv3CreateResponse(status, resok, resfail);
  }

  private decodeMkdirRequest(): msg.Nfsv3MkdirRequest {
    const where = this.readDirOpArgs();
    const attributes = this.readSattr();
    return new msg.Nfsv3MkdirRequest(where, attributes);
  }

  private decodeMkdirResponse(): msg.Nfsv3MkdirResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3MkdirResOk | undefined;
    let resfail: msg.Nfsv3MkdirResFail | undefined;
    if (status === 0) {
      const obj = this.readPostOpFh();
      const objAttributes = this.readPostOpAttr();
      const dirWcc = this.readWccData();
      resok = new msg.Nfsv3MkdirResOk(obj, objAttributes, dirWcc);
    } else {
      const dirWcc = this.readWccData();
      resfail = new msg.Nfsv3MkdirResFail(dirWcc);
    }
    return new msg.Nfsv3MkdirResponse(status, resok, resfail);
  }

  private decodeSymlinkRequest(): msg.Nfsv3SymlinkRequest {
    const where = this.readDirOpArgs();
    const symlinkAttributes = this.readSattr();
    const symlinkData = this.readFilename();
    return new msg.Nfsv3SymlinkRequest(where, symlinkAttributes, symlinkData);
  }

  private decodeSymlinkResponse(): msg.Nfsv3SymlinkResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3SymlinkResOk | undefined;
    let resfail: msg.Nfsv3SymlinkResFail | undefined;
    if (status === 0) {
      const obj = this.readPostOpFh();
      const objAttributes = this.readPostOpAttr();
      const dirWcc = this.readWccData();
      resok = new msg.Nfsv3SymlinkResOk(obj, objAttributes, dirWcc);
    } else {
      const dirWcc = this.readWccData();
      resfail = new msg.Nfsv3SymlinkResFail(dirWcc);
    }
    return new msg.Nfsv3SymlinkResponse(status, resok, resfail);
  }

  private decodeMknodRequest(): msg.Nfsv3MknodRequest {
    const where = this.readDirOpArgs();
    const what = this.readMknodData();
    return new msg.Nfsv3MknodRequest(where, what);
  }

  private decodeMknodResponse(): msg.Nfsv3MknodResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3MknodResOk | undefined;
    let resfail: msg.Nfsv3MknodResFail | undefined;
    if (status === 0) {
      const obj = this.readPostOpFh();
      const objAttributes = this.readPostOpAttr();
      const dirWcc = this.readWccData();
      resok = new msg.Nfsv3MknodResOk(obj, objAttributes, dirWcc);
    } else {
      const dirWcc = this.readWccData();
      resfail = new msg.Nfsv3MknodResFail(dirWcc);
    }
    return new msg.Nfsv3MknodResponse(status, resok, resfail);
  }

  private decodeRemoveRequest(): msg.Nfsv3RemoveRequest {
    const object = this.readDirOpArgs();
    return new msg.Nfsv3RemoveRequest(object);
  }

  private decodeRemoveResponse(): msg.Nfsv3RemoveResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3RemoveResOk | undefined;
    let resfail: msg.Nfsv3RemoveResFail | undefined;
    const dirWcc = this.readWccData();
    if (status === 0) {
      resok = new msg.Nfsv3RemoveResOk(dirWcc);
    } else {
      resfail = new msg.Nfsv3RemoveResFail(dirWcc);
    }
    return new msg.Nfsv3RemoveResponse(status, resok, resfail);
  }

  private decodeRmdirRequest(): msg.Nfsv3RmdirRequest {
    const object = this.readDirOpArgs();
    return new msg.Nfsv3RmdirRequest(object);
  }

  private decodeRmdirResponse(): msg.Nfsv3RmdirResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3RmdirResOk | undefined;
    let resfail: msg.Nfsv3RmdirResFail | undefined;
    const dirWcc = this.readWccData();
    if (status === 0) {
      resok = new msg.Nfsv3RmdirResOk(dirWcc);
    } else {
      resfail = new msg.Nfsv3RmdirResFail(dirWcc);
    }
    return new msg.Nfsv3RmdirResponse(status, resok, resfail);
  }

  private decodeRenameRequest(): msg.Nfsv3RenameRequest {
    const from = this.readDirOpArgs();
    const to = this.readDirOpArgs();
    return new msg.Nfsv3RenameRequest(from, to);
  }

  private decodeRenameResponse(): msg.Nfsv3RenameResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3RenameResOk | undefined;
    let resfail: msg.Nfsv3RenameResFail | undefined;
    const fromDirWcc = this.readWccData();
    const toDirWcc = this.readWccData();
    if (status === 0) {
      resok = new msg.Nfsv3RenameResOk(fromDirWcc, toDirWcc);
    } else {
      resfail = new msg.Nfsv3RenameResFail(fromDirWcc, toDirWcc);
    }
    return new msg.Nfsv3RenameResponse(status, resok, resfail);
  }

  private decodeLinkRequest(): msg.Nfsv3LinkRequest {
    const file = this.readFh();
    const link = this.readDirOpArgs();
    return new msg.Nfsv3LinkRequest(file, link);
  }

  private decodeLinkResponse(): msg.Nfsv3LinkResponse {
    const status = this.xdr.readUnsignedInt();
    let resok: msg.Nfsv3LinkResOk | undefined;
    let resfail: msg.Nfsv3LinkResFail | undefined;
    const fileAttributes = this.readPostOpAttr();
    const linkDirWcc = this.readWccData();
    if (status === 0) {
      resok = new msg.Nfsv3LinkResOk(fileAttributes, linkDirWcc);
    } else {
      resfail = new msg.Nfsv3LinkResFail(fileAttributes, linkDirWcc);
    }
    return new msg.Nfsv3LinkResponse(status, resok, resfail);
  }

  private decodeReaddirRequest(): msg.Nfsv3ReaddirRequest {
    const dir = this.readFh();
    const xdr = this.xdr;
    const cookie = xdr.readUnsignedHyper();
    const cookieverf = xdr.readOpaque(8);
    const count = xdr.readUnsignedInt();
    return new msg.Nfsv3ReaddirRequest(dir, cookie, cookieverf, count);
  }

  private decodeReaddirResponse(): msg.Nfsv3ReaddirResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3ReaddirResOk | undefined;
    let resfail: msg.Nfsv3ReaddirResFail | undefined;
    const dirAttributes = this.readPostOpAttr();
    if (status === 0) {
      const cookieverf = xdr.readOpaque(8);
      const reply = this.readDirList();
      resok = new msg.Nfsv3ReaddirResOk(dirAttributes, cookieverf, reply);
    } else {
      resfail = new msg.Nfsv3ReaddirResFail(dirAttributes);
    }
    return new msg.Nfsv3ReaddirResponse(status, resok, resfail);
  }

  private decodeReaddirplusRequest(): msg.Nfsv3ReaddirplusRequest {
    const dir = this.readFh();
    const xdr = this.xdr;
    const cookie = xdr.readUnsignedHyper();
    const cookieverf = xdr.readOpaque(8);
    const dircount = xdr.readUnsignedInt();
    const maxcount = xdr.readUnsignedInt();
    return new msg.Nfsv3ReaddirplusRequest(dir, cookie, cookieverf, dircount, maxcount);
  }

  private decodeReaddirplusResponse(): msg.Nfsv3ReaddirplusResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3ReaddirplusResOk | undefined;
    let resfail: msg.Nfsv3ReaddirplusResFail | undefined;
    const dirAttributes = this.readPostOpAttr();
    if (status === 0) {
      const cookieverf = xdr.readOpaque(8);
      const reply = this.readDirListPlus();
      resok = new msg.Nfsv3ReaddirplusResOk(dirAttributes, cookieverf, reply);
    } else {
      resfail = new msg.Nfsv3ReaddirplusResFail(dirAttributes);
    }
    return new msg.Nfsv3ReaddirplusResponse(status, resok, resfail);
  }

  private decodeFsstatRequest(): msg.Nfsv3FsstatRequest {
    const fsroot = this.readFh();
    return new msg.Nfsv3FsstatRequest(fsroot);
  }

  private decodeFsstatResponse(): msg.Nfsv3FsstatResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3FsstatResOk | undefined;
    let resfail: msg.Nfsv3FsstatResFail | undefined;
    const objAttributes = this.readPostOpAttr();
    if (status === 0) {
      const tbytes = xdr.readUnsignedHyper();
      const fbytes = xdr.readUnsignedHyper();
      const abytes = xdr.readUnsignedHyper();
      const tfiles = xdr.readUnsignedHyper();
      const ffiles = xdr.readUnsignedHyper();
      const afiles = xdr.readUnsignedHyper();
      const invarsec = xdr.readUnsignedInt();
      resok = new msg.Nfsv3FsstatResOk(objAttributes, tbytes, fbytes, abytes, tfiles, ffiles, afiles, invarsec);
    } else {
      resfail = new msg.Nfsv3FsstatResFail(objAttributes);
    }
    return new msg.Nfsv3FsstatResponse(status, resok, resfail);
  }

  private decodeFsinfoRequest(): msg.Nfsv3FsinfoRequest {
    const fsroot = this.readFh();
    return new msg.Nfsv3FsinfoRequest(fsroot);
  }

  private decodeFsinfoResponse(): msg.Nfsv3FsinfoResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3FsinfoResOk | undefined;
    let resfail: msg.Nfsv3FsinfoResFail | undefined;
    const objAttributes = this.readPostOpAttr();
    if (status === 0) {
      const rtmax = xdr.readUnsignedInt();
      const rtpref = xdr.readUnsignedInt();
      const rtmult = xdr.readUnsignedInt();
      const wtmax = xdr.readUnsignedInt();
      const wtpref = xdr.readUnsignedInt();
      const wtmult = xdr.readUnsignedInt();
      const dtpref = xdr.readUnsignedInt();
      const maxfilesize = xdr.readUnsignedHyper();
      const timeDelta = {seconds: xdr.readUnsignedInt(), nseconds: xdr.readUnsignedInt()};
      const properties = xdr.readUnsignedInt();
      resok = new msg.Nfsv3FsinfoResOk(
        objAttributes,
        rtmax,
        rtpref,
        rtmult,
        wtmax,
        wtpref,
        wtmult,
        dtpref,
        maxfilesize,
        timeDelta,
        properties,
      );
    } else {
      resfail = new msg.Nfsv3FsinfoResFail(objAttributes);
    }
    return new msg.Nfsv3FsinfoResponse(status, resok, resfail);
  }

  private decodePathconfRequest(): msg.Nfsv3PathconfRequest {
    const object = this.readFh();
    return new msg.Nfsv3PathconfRequest(object);
  }

  private decodePathconfResponse(): msg.Nfsv3PathconfResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3PathconfResOk | undefined;
    let resfail: msg.Nfsv3PathconfResFail | undefined;
    const objAttributes = this.readPostOpAttr();
    if (status === 0) {
      const linkmax = xdr.readUnsignedInt();
      const namemax = xdr.readUnsignedInt();
      const noTrunc = xdr.readBoolean();
      const chownRestricted = xdr.readBoolean();
      const caseInsensitive = xdr.readBoolean();
      const casePreserving = xdr.readBoolean();
      resok = new msg.Nfsv3PathconfResOk(
        objAttributes,
        linkmax,
        namemax,
        noTrunc,
        chownRestricted,
        caseInsensitive,
        casePreserving,
      );
    } else {
      resfail = new msg.Nfsv3PathconfResFail(objAttributes);
    }
    return new msg.Nfsv3PathconfResponse(status, resok, resfail);
  }

  private decodeCommitRequest(): msg.Nfsv3CommitRequest {
    const file = this.readFh();
    const xdr = this.xdr;
    const offset = xdr.readUnsignedHyper();
    const count = xdr.readUnsignedInt();
    return new msg.Nfsv3CommitRequest(file, offset, count);
  }

  private decodeCommitResponse(): msg.Nfsv3CommitResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    let resok: msg.Nfsv3CommitResOk | undefined;
    let resfail: msg.Nfsv3CommitResFail | undefined;
    const fileWcc = this.readWccData();
    if (status === 0) {
      const verf = xdr.readOpaque(8);
      resok = new msg.Nfsv3CommitResOk(fileWcc, verf);
    } else {
      resfail = new msg.Nfsv3CommitResFail(fileWcc);
    }
    return new msg.Nfsv3CommitResponse(status, resok, resfail);
  }
}
