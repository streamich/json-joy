import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../../xdr/XdrEncoder';
import {Nfsv3FType, Nfsv3TimeHow, Nfsv3CreateMode, Nfsv3Proc} from './constants';
import {Nfsv3EncodingError} from './errors';
import type * as msg from './messages';
import type * as structs from './structs';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers';

export class Nfsv3Encoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  protected readonly xdr: XdrEncoder;

  constructor(public readonly writer: W = new Writer() as any) {
    this.xdr = new XdrEncoder(writer);
  }

  public encodeMessage(message: msg.Nfsv3Message, proc: Nfsv3Proc, isRequest: boolean): Uint8Array {
    if (isRequest) this.writeRequest(message as msg.Nfsv3Request, proc);
    else this.writeResponse(message as msg.Nfsv3Response, proc);
    return this.writer.flush();
  }

  public writeMessage(message: msg.Nfsv3Message, proc: Nfsv3Proc, isRequest: boolean): void {
    if (isRequest) this.writeRequest(message as msg.Nfsv3Request, proc);
    else this.writeResponse(message as msg.Nfsv3Response, proc);
  }

  private writeRequest(request: msg.Nfsv3Request, proc: Nfsv3Proc): void {
    switch (proc) {
      case Nfsv3Proc.GETATTR:
        return this.writeGetattrRequest(request as msg.Nfsv3GetattrRequest);
      case Nfsv3Proc.SETATTR:
        return this.writeSetattrRequest(request as msg.Nfsv3SetattrRequest);
      case Nfsv3Proc.LOOKUP:
        return this.writeLookupRequest(request as msg.Nfsv3LookupRequest);
      case Nfsv3Proc.ACCESS:
        return this.writeAccessRequest(request as msg.Nfsv3AccessRequest);
      case Nfsv3Proc.READLINK:
        return this.writeReadlinkRequest(request as msg.Nfsv3ReadlinkRequest);
      case Nfsv3Proc.READ:
        return this.writeReadRequest(request as msg.Nfsv3ReadRequest);
      case Nfsv3Proc.WRITE:
        return this.writeWriteRequest(request as msg.Nfsv3WriteRequest);
      case Nfsv3Proc.CREATE:
        return this.writeCreateRequest(request as msg.Nfsv3CreateRequest);
      case Nfsv3Proc.MKDIR:
        return this.writeMkdirRequest(request as msg.Nfsv3MkdirRequest);
      case Nfsv3Proc.SYMLINK:
        return this.writeSymlinkRequest(request as msg.Nfsv3SymlinkRequest);
      case Nfsv3Proc.MKNOD:
        return this.writeMknodRequest(request as msg.Nfsv3MknodRequest);
      case Nfsv3Proc.REMOVE:
        return this.writeRemoveRequest(request as msg.Nfsv3RemoveRequest);
      case Nfsv3Proc.RMDIR:
        return this.writeRmdirRequest(request as msg.Nfsv3RmdirRequest);
      case Nfsv3Proc.RENAME:
        return this.writeRenameRequest(request as msg.Nfsv3RenameRequest);
      case Nfsv3Proc.LINK:
        return this.writeLinkRequest(request as msg.Nfsv3LinkRequest);
      case Nfsv3Proc.READDIR:
        return this.writeReaddirRequest(request as msg.Nfsv3ReaddirRequest);
      case Nfsv3Proc.READDIRPLUS:
        return this.writeReaddirplusRequest(request as msg.Nfsv3ReaddirplusRequest);
      case Nfsv3Proc.FSSTAT:
        return this.writeFsstatRequest(request as msg.Nfsv3FsstatRequest);
      case Nfsv3Proc.FSINFO:
        return this.writeFsinfoRequest(request as msg.Nfsv3FsinfoRequest);
      case Nfsv3Proc.PATHCONF:
        return this.writePathconfRequest(request as msg.Nfsv3PathconfRequest);
      case Nfsv3Proc.COMMIT:
        return this.writeCommitRequest(request as msg.Nfsv3CommitRequest);
      default:
        throw new Nfsv3EncodingError(`Unknown procedure: ${proc}`);
    }
  }

  private writeResponse(response: msg.Nfsv3Response, proc: Nfsv3Proc): void {
    switch (proc) {
      case Nfsv3Proc.GETATTR:
        return this.writeGetattrResponse(response as msg.Nfsv3GetattrResponse);
      case Nfsv3Proc.SETATTR:
        return this.writeSetattrResponse(response as msg.Nfsv3SetattrResponse);
      case Nfsv3Proc.LOOKUP:
        return this.writeLookupResponse(response as msg.Nfsv3LookupResponse);
      case Nfsv3Proc.ACCESS:
        return this.writeAccessResponse(response as msg.Nfsv3AccessResponse);
      case Nfsv3Proc.READLINK:
        return this.writeReadlinkResponse(response as msg.Nfsv3ReadlinkResponse);
      case Nfsv3Proc.READ:
        return this.writeReadResponse(response as msg.Nfsv3ReadResponse);
      case Nfsv3Proc.WRITE:
        return this.writeWriteResponse(response as msg.Nfsv3WriteResponse);
      case Nfsv3Proc.CREATE:
        return this.writeCreateResponse(response as msg.Nfsv3CreateResponse);
      case Nfsv3Proc.MKDIR:
        return this.writeMkdirResponse(response as msg.Nfsv3MkdirResponse);
      case Nfsv3Proc.SYMLINK:
        return this.writeSymlinkResponse(response as msg.Nfsv3SymlinkResponse);
      case Nfsv3Proc.MKNOD:
        return this.writeMknodResponse(response as msg.Nfsv3MknodResponse);
      case Nfsv3Proc.REMOVE:
        return this.writeRemoveResponse(response as msg.Nfsv3RemoveResponse);
      case Nfsv3Proc.RMDIR:
        return this.writeRmdirResponse(response as msg.Nfsv3RmdirResponse);
      case Nfsv3Proc.RENAME:
        return this.writeRenameResponse(response as msg.Nfsv3RenameResponse);
      case Nfsv3Proc.LINK:
        return this.writeLinkResponse(response as msg.Nfsv3LinkResponse);
      case Nfsv3Proc.READDIR:
        return this.writeReaddirResponse(response as msg.Nfsv3ReaddirResponse);
      case Nfsv3Proc.READDIRPLUS:
        return this.writeReaddirplusResponse(response as msg.Nfsv3ReaddirplusResponse);
      case Nfsv3Proc.FSSTAT:
        return this.writeFsstatResponse(response as msg.Nfsv3FsstatResponse);
      case Nfsv3Proc.FSINFO:
        return this.writeFsinfoResponse(response as msg.Nfsv3FsinfoResponse);
      case Nfsv3Proc.PATHCONF:
        return this.writePathconfResponse(response as msg.Nfsv3PathconfResponse);
      case Nfsv3Proc.COMMIT:
        return this.writeCommitResponse(response as msg.Nfsv3CommitResponse);
      default:
        throw new Nfsv3EncodingError(`Unknown procedure: ${proc}`);
    }
  }

  private writeFh(fh: structs.Nfsv3Fh): void {
    this.xdr.writeVarlenOpaque(fh.data);
  }

  private writeFilename(filename: string): void {
    this.xdr.writeStr(filename);
  }

  private writeTime(time: structs.Nfsv3Time): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(time.seconds);
    xdr.writeUnsignedInt(time.nseconds);
  }

  private writeSpecData(spec: structs.Nfsv3SpecData): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(spec.specdata1);
    xdr.writeUnsignedInt(spec.specdata2);
  }

  private writeFattr(attr: structs.Nfsv3Fattr): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(attr.type);
    xdr.writeUnsignedInt(attr.mode);
    xdr.writeUnsignedInt(attr.nlink);
    xdr.writeUnsignedInt(attr.uid);
    xdr.writeUnsignedInt(attr.gid);
    xdr.writeUnsignedHyper(attr.size);
    xdr.writeUnsignedHyper(attr.used);
    this.writeSpecData(attr.rdev);
    xdr.writeUnsignedHyper(attr.fsid);
    xdr.writeUnsignedHyper(attr.fileid);
    this.writeTime(attr.atime);
    this.writeTime(attr.mtime);
    this.writeTime(attr.ctime);
  }

  private writePostOpAttr(attr: structs.Nfsv3PostOpAttr): void {
    this.xdr.writeBoolean(attr.attributesFollow);
    if (attr.attributesFollow && attr.attributes) {
      this.writeFattr(attr.attributes);
    }
  }

  private writeWccAttr(attr: structs.Nfsv3WccAttr): void {
    this.xdr.writeUnsignedHyper(attr.size);
    this.writeTime(attr.mtime);
    this.writeTime(attr.ctime);
  }

  private writePreOpAttr(attr: structs.Nfsv3PreOpAttr): void {
    this.xdr.writeBoolean(attr.attributesFollow);
    if (attr.attributesFollow && attr.attributes) {
      this.writeWccAttr(attr.attributes);
    }
  }

  private writeWccData(wcc: structs.Nfsv3WccData): void {
    this.writePreOpAttr(wcc.before);
    this.writePostOpAttr(wcc.after);
  }

  private writePostOpFh(fh: structs.Nfsv3PostOpFh): void {
    this.xdr.writeBoolean(fh.handleFollows);
    if (fh.handleFollows && fh.handle) {
      this.writeFh(fh.handle);
    }
  }

  private writeSetMode(setMode: structs.Nfsv3SetMode): void {
    const xdr = this.xdr;
    xdr.writeBoolean(setMode.set);
    if (setMode.set && setMode.mode !== undefined) {
      xdr.writeUnsignedInt(setMode.mode);
    }
  }

  private writeSetUid(setUid: structs.Nfsv3SetUid): void {
    const xdr = this.xdr;
    xdr.writeBoolean(setUid.set);
    if (setUid.set && setUid.uid !== undefined) {
      xdr.writeUnsignedInt(setUid.uid);
    }
  }

  private writeSetGid(setGid: structs.Nfsv3SetGid): void {
    const xdr = this.xdr;
    xdr.writeBoolean(setGid.set);
    if (setGid.set && setGid.gid !== undefined) {
      xdr.writeUnsignedInt(setGid.gid);
    }
  }

  private writeSetSize(setSize: structs.Nfsv3SetSize): void {
    const xdr = this.xdr;
    xdr.writeBoolean(setSize.set);
    if (setSize.set && setSize.size !== undefined) {
      xdr.writeUnsignedHyper(setSize.size);
    }
  }

  private writeSetAtime(setAtime: structs.Nfsv3SetAtime): void {
    this.xdr.writeUnsignedInt(setAtime.how);
    if (setAtime.how === Nfsv3TimeHow.SET_TO_CLIENT_TIME && setAtime.atime) {
      this.writeTime(setAtime.atime);
    }
  }

  private writeSetMtime(setMtime: structs.Nfsv3SetMtime): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(setMtime.how);
    if (setMtime.how === Nfsv3TimeHow.SET_TO_CLIENT_TIME && setMtime.mtime) {
      this.writeTime(setMtime.mtime);
    }
  }

  private writeSattr(sattr: structs.Nfsv3Sattr): void {
    this.writeSetMode(sattr.mode);
    this.writeSetUid(sattr.uid);
    this.writeSetGid(sattr.gid);
    this.writeSetSize(sattr.size);
    this.writeSetAtime(sattr.atime);
    this.writeSetMtime(sattr.mtime);
  }

  private writeSattrGuard(guard: structs.Nfsv3SattrGuard): void {
    const xdr = this.xdr;
    xdr.writeBoolean(guard.check);
    if (guard.check && guard.objCtime) {
      this.writeTime(guard.objCtime);
    }
  }

  private writeDirOpArgs(args: structs.Nfsv3DirOpArgs): void {
    this.writeFh(args.dir);
    this.writeFilename(args.name);
  }

  private writeCreateHow(how: structs.Nfsv3CreateHow): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(how.mode);
    switch (how.mode) {
      case Nfsv3CreateMode.UNCHECKED:
      case Nfsv3CreateMode.GUARDED:
        if (how.objAttributes) {
          this.writeSattr(how.objAttributes);
        }
        break;
      case Nfsv3CreateMode.EXCLUSIVE:
        if (how.verf) {
          xdr.writeOpaque(how.verf);
        }
        break;
    }
  }

  private writeMknodData(data: structs.Nfsv3MknodData): void {
    this.xdr.writeUnsignedInt(data.type);
    switch (data.type) {
      case Nfsv3FType.NF3CHR:
        if (data.chr) {
          this.writeSattr(data.chr.devAttributes);
          this.writeSpecData(data.chr.spec);
        }
        break;
      case Nfsv3FType.NF3BLK:
        if (data.blk) {
          this.writeSattr(data.blk.devAttributes);
          this.writeSpecData(data.blk.spec);
        }
        break;
      case Nfsv3FType.NF3SOCK:
        if (data.sock) {
          this.writeSattr(data.sock);
        }
        break;
      case Nfsv3FType.NF3FIFO:
        if (data.pipe) {
          this.writeSattr(data.pipe);
        }
        break;
    }
  }

  private writeEntry(entry: structs.Nfsv3Entry | undefined): void {
    const xdr = this.xdr;
    if (!entry) {
      xdr.writeBoolean(false);
      return;
    }
    xdr.writeBoolean(true);
    xdr.writeUnsignedHyper(entry.fileid);
    this.writeFilename(entry.name);
    xdr.writeUnsignedHyper(entry.cookie);
    this.writeEntry(entry.nextentry);
  }

  private writeEntryPlus(entry: structs.Nfsv3EntryPlus | undefined): void {
    const xdr = this.xdr;
    if (!entry) {
      xdr.writeBoolean(false);
      return;
    }
    xdr.writeBoolean(true);
    xdr.writeUnsignedHyper(entry.fileid);
    this.writeFilename(entry.name);
    xdr.writeUnsignedHyper(entry.cookie);
    this.writePostOpAttr(entry.nameAttributes);
    this.writePostOpFh(entry.nameHandle);
    this.writeEntryPlus(entry.nextentry);
  }

  private writeDirList(dirList: structs.Nfsv3DirList): void {
    this.writeEntry(dirList.entries);
    this.xdr.writeBoolean(dirList.eof);
  }

  private writeDirListPlus(dirList: structs.Nfsv3DirListPlus): void {
    this.writeEntryPlus(dirList.entries);
    this.xdr.writeBoolean(dirList.eof);
  }

  private writeGetattrRequest(req: msg.Nfsv3GetattrRequest): void {
    this.writeFh(req.object);
  }

  private writeGetattrResponse(res: msg.Nfsv3GetattrResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeFattr(res.resok.objAttributes);
    }
  }

  private writeSetattrRequest(req: msg.Nfsv3SetattrRequest): void {
    this.writeFh(req.object);
    this.writeSattr(req.newAttributes);
    this.writeSattrGuard(req.guard);
  }

  private writeSetattrResponse(res: msg.Nfsv3SetattrResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeWccData(res.resok.objWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.objWcc);
    }
  }

  private writeLookupRequest(req: msg.Nfsv3LookupRequest): void {
    this.writeDirOpArgs(req.what);
  }

  private writeLookupResponse(res: msg.Nfsv3LookupResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeFh(res.resok.object);
      this.writePostOpAttr(res.resok.objAttributes);
      this.writePostOpAttr(res.resok.dirAttributes);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.dirAttributes);
    }
  }

  private writeAccessRequest(req: msg.Nfsv3AccessRequest): void {
    this.writeFh(req.object);
    this.xdr.writeUnsignedInt(req.access);
  }

  private writeAccessResponse(res: msg.Nfsv3AccessResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.objAttributes);
      xdr.writeUnsignedInt(res.resok.access);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.objAttributes);
    }
  }

  private writeReadlinkRequest(req: msg.Nfsv3ReadlinkRequest): void {
    this.writeFh(req.symlink);
  }

  private writeReadlinkResponse(res: msg.Nfsv3ReadlinkResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.symlinkAttributes);
      this.writeFilename(res.resok.data);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.symlinkAttributes);
    }
  }

  private writeReadRequest(req: msg.Nfsv3ReadRequest): void {
    this.writeFh(req.file);
    const xdr = this.xdr;
    xdr.writeUnsignedHyper(req.offset);
    xdr.writeUnsignedInt(req.count);
  }

  private writeReadResponse(res: msg.Nfsv3ReadResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.fileAttributes);
      xdr.writeUnsignedInt(res.resok.count);
      xdr.writeBoolean(res.resok.eof);
      xdr.writeVarlenOpaque(res.resok.data);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.fileAttributes);
    }
  }

  private writeWriteRequest(req: msg.Nfsv3WriteRequest): void {
    this.writeFh(req.file);
    const xdr = this.xdr;
    xdr.writeUnsignedHyper(req.offset);
    xdr.writeUnsignedInt(req.count);
    xdr.writeUnsignedInt(req.stable);
    xdr.writeVarlenOpaque(req.data);
  }

  private writeWriteResponse(res: msg.Nfsv3WriteResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeWccData(res.resok.fileWcc);
      xdr.writeUnsignedInt(res.resok.count);
      xdr.writeUnsignedInt(res.resok.committed);
      xdr.writeOpaque(res.resok.verf);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.fileWcc);
    }
  }

  private writeCreateRequest(req: msg.Nfsv3CreateRequest): void {
    this.writeDirOpArgs(req.where);
    this.writeCreateHow(req.how);
  }

  private writeCreateResponse(res: msg.Nfsv3CreateResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpFh(res.resok.obj);
      this.writePostOpAttr(res.resok.objAttributes);
      this.writeWccData(res.resok.dirWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.dirWcc);
    }
  }

  private writeMkdirRequest(req: msg.Nfsv3MkdirRequest): void {
    this.writeDirOpArgs(req.where);
    this.writeSattr(req.attributes);
  }

  private writeMkdirResponse(res: msg.Nfsv3MkdirResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpFh(res.resok.obj);
      this.writePostOpAttr(res.resok.objAttributes);
      this.writeWccData(res.resok.dirWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.dirWcc);
    }
  }

  private writeSymlinkRequest(req: msg.Nfsv3SymlinkRequest): void {
    this.writeDirOpArgs(req.where);
    this.writeSattr(req.symlinkAttributes);
    this.writeFilename(req.symlinkData);
  }

  private writeSymlinkResponse(res: msg.Nfsv3SymlinkResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpFh(res.resok.obj);
      this.writePostOpAttr(res.resok.objAttributes);
      this.writeWccData(res.resok.dirWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.dirWcc);
    }
  }

  private writeMknodRequest(req: msg.Nfsv3MknodRequest): void {
    this.writeDirOpArgs(req.where);
    this.writeMknodData(req.what);
  }

  private writeMknodResponse(res: msg.Nfsv3MknodResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpFh(res.resok.obj);
      this.writePostOpAttr(res.resok.objAttributes);
      this.writeWccData(res.resok.dirWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.dirWcc);
    }
  }

  private writeRemoveRequest(req: msg.Nfsv3RemoveRequest): void {
    this.writeDirOpArgs(req.object);
  }

  private writeRemoveResponse(res: msg.Nfsv3RemoveResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeWccData(res.resok.dirWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.dirWcc);
    }
  }

  private writeRmdirRequest(req: msg.Nfsv3RmdirRequest): void {
    this.writeDirOpArgs(req.object);
  }

  private writeRmdirResponse(res: msg.Nfsv3RmdirResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeWccData(res.resok.dirWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.dirWcc);
    }
  }

  private writeRenameRequest(req: msg.Nfsv3RenameRequest): void {
    this.writeDirOpArgs(req.from);
    this.writeDirOpArgs(req.to);
  }

  private writeRenameResponse(res: msg.Nfsv3RenameResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeWccData(res.resok.fromDirWcc);
      this.writeWccData(res.resok.toDirWcc);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.fromDirWcc);
      this.writeWccData(res.resfail.toDirWcc);
    }
  }

  private writeLinkRequest(req: msg.Nfsv3LinkRequest): void {
    this.writeFh(req.file);
    this.writeDirOpArgs(req.link);
  }

  private writeLinkResponse(res: msg.Nfsv3LinkResponse): void {
    this.xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.fileAttributes);
      this.writeWccData(res.resok.linkDirWcc);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.fileAttributes);
      this.writeWccData(res.resfail.linkDirWcc);
    }
  }

  private writeReaddirRequest(req: msg.Nfsv3ReaddirRequest): void {
    this.writeFh(req.dir);
    const xdr = this.xdr;
    xdr.writeUnsignedHyper(req.cookie);
    xdr.writeOpaque(req.cookieverf);
    xdr.writeUnsignedInt(req.count);
  }

  private writeReaddirResponse(res: msg.Nfsv3ReaddirResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.dirAttributes);
      xdr.writeOpaque(res.resok.cookieverf);
      this.writeDirList(res.resok.reply);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.dirAttributes);
    }
  }

  private writeReaddirplusRequest(req: msg.Nfsv3ReaddirplusRequest): void {
    this.writeFh(req.dir);
    const xdr = this.xdr;
    xdr.writeUnsignedHyper(req.cookie);
    xdr.writeOpaque(req.cookieverf);
    xdr.writeUnsignedInt(req.dircount);
    xdr.writeUnsignedInt(req.maxcount);
  }

  private writeReaddirplusResponse(res: msg.Nfsv3ReaddirplusResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.dirAttributes);
      xdr.writeOpaque(res.resok.cookieverf);
      this.writeDirListPlus(res.resok.reply);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.dirAttributes);
    }
  }

  private writeFsstatRequest(req: msg.Nfsv3FsstatRequest): void {
    this.writeFh(req.fsroot);
  }

  private writeFsstatResponse(res: msg.Nfsv3FsstatResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.objAttributes);
      xdr.writeUnsignedHyper(res.resok.tbytes);
      xdr.writeUnsignedHyper(res.resok.fbytes);
      xdr.writeUnsignedHyper(res.resok.abytes);
      xdr.writeUnsignedHyper(res.resok.tfiles);
      xdr.writeUnsignedHyper(res.resok.ffiles);
      xdr.writeUnsignedHyper(res.resok.afiles);
      xdr.writeUnsignedInt(res.resok.invarsec);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.objAttributes);
    }
  }

  private writeFsinfoRequest(req: msg.Nfsv3FsinfoRequest): void {
    this.writeFh(req.fsroot);
  }

  private writeFsinfoResponse(res: msg.Nfsv3FsinfoResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.objAttributes);
      xdr.writeUnsignedInt(res.resok.rtmax);
      xdr.writeUnsignedInt(res.resok.rtpref);
      xdr.writeUnsignedInt(res.resok.rtmult);
      xdr.writeUnsignedInt(res.resok.wtmax);
      xdr.writeUnsignedInt(res.resok.wtpref);
      xdr.writeUnsignedInt(res.resok.wtmult);
      xdr.writeUnsignedInt(res.resok.dtpref);
      xdr.writeUnsignedHyper(res.resok.maxfilesize);
      xdr.writeUnsignedInt(res.resok.timeDelta.seconds);
      xdr.writeUnsignedInt(res.resok.timeDelta.nseconds);
      xdr.writeUnsignedInt(res.resok.properties);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.objAttributes);
    }
  }

  private writePathconfRequest(req: msg.Nfsv3PathconfRequest): void {
    this.writeFh(req.object);
  }

  private writePathconfResponse(res: msg.Nfsv3PathconfResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writePostOpAttr(res.resok.objAttributes);
      xdr.writeUnsignedInt(res.resok.linkmax);
      xdr.writeUnsignedInt(res.resok.namemax);
      xdr.writeBoolean(res.resok.noTrunc);
      xdr.writeBoolean(res.resok.chownRestricted);
      xdr.writeBoolean(res.resok.caseInsensitive);
      xdr.writeBoolean(res.resok.casePreserving);
    } else if (res.resfail) {
      this.writePostOpAttr(res.resfail.objAttributes);
    }
  }

  private writeCommitRequest(req: msg.Nfsv3CommitRequest): void {
    this.writeFh(req.file);
    const xdr = this.xdr;
    xdr.writeUnsignedHyper(req.offset);
    xdr.writeUnsignedInt(req.count);
  }

  private writeCommitResponse(res: msg.Nfsv3CommitResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.resok) {
      this.writeWccData(res.resok.fileWcc);
      xdr.writeOpaque(res.resok.verf);
    } else if (res.resfail) {
      this.writeWccData(res.resfail.fileWcc);
    }
  }
}
