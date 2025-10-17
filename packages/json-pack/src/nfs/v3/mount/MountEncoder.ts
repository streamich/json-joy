import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {XdrEncoder} from '../../../xdr/XdrEncoder';
import {MountProc} from './constants';
import {Nfsv3EncodingError} from '../errors';
import type * as msg from './messages';
import type * as structs from './structs';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/util/lib/buffers';

export class MountEncoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  protected readonly xdr: XdrEncoder;

  constructor(public readonly writer: W = new Writer() as any) {
    this.xdr = new XdrEncoder(writer);
  }

  public encodeMessage(message: msg.MountMessage, proc: MountProc, isRequest: boolean): Uint8Array {
    if (isRequest) this.writeRequest(message as msg.MountRequest, proc);
    else this.writeResponse(message as msg.MountResponse, proc);
    return this.writer.flush();
  }

  public writeMessage(message: msg.MountMessage, proc: MountProc, isRequest: boolean): void {
    if (isRequest) this.writeRequest(message as msg.MountRequest, proc);
    else this.writeResponse(message as msg.MountResponse, proc);
  }

  private writeRequest(request: msg.MountRequest, proc: MountProc): void {
    switch (proc) {
      case MountProc.NULL:
        return;
      case MountProc.MNT:
        return this.writeMntRequest(request as msg.MountMntRequest);
      case MountProc.DUMP:
        return;
      case MountProc.UMNT:
        return this.writeUmntRequest(request as msg.MountUmntRequest);
      case MountProc.UMNTALL:
        return;
      case MountProc.EXPORT:
        return;
      default:
        throw new Nfsv3EncodingError(`Unknown MOUNT procedure: ${proc}`);
    }
  }

  private writeResponse(response: msg.MountResponse, proc: MountProc): void {
    switch (proc) {
      case MountProc.NULL:
        return;
      case MountProc.MNT:
        return this.writeMntResponse(response as msg.MountMntResponse);
      case MountProc.DUMP:
        return this.writeDumpResponse(response as msg.MountDumpResponse);
      case MountProc.UMNT:
        return;
      case MountProc.UMNTALL:
        return;
      case MountProc.EXPORT:
        return this.writeExportResponse(response as msg.MountExportResponse);
      default:
        throw new Nfsv3EncodingError(`Unknown MOUNT procedure: ${proc}`);
    }
  }

  private writeFhandle3(fh: structs.MountFhandle3): void {
    const data = fh.data.uint8;
    this.xdr.writeVarlenOpaque(data);
  }

  private writeDirpath(path: string): void {
    this.xdr.writeStr(path);
  }

  private writeMountBody(body: structs.MountBody | undefined): void {
    const xdr = this.xdr;
    if (!body) {
      xdr.writeBoolean(false);
      return;
    }
    xdr.writeBoolean(true);
    xdr.writeStr(body.hostname);
    this.writeDirpath(body.directory);
    this.writeMountBody(body.next);
  }

  private writeGroupNode(group: structs.MountGroupNode | undefined): void {
    const xdr = this.xdr;
    if (!group) {
      xdr.writeBoolean(false);
      return;
    }
    xdr.writeBoolean(true);
    xdr.writeStr(group.name);
    this.writeGroupNode(group.next);
  }

  private writeExportNode(exportNode: structs.MountExportNode | undefined): void {
    const xdr = this.xdr;
    if (!exportNode) {
      xdr.writeBoolean(false);
      return;
    }
    xdr.writeBoolean(true);
    this.writeDirpath(exportNode.dir);
    this.writeGroupNode(exportNode.groups);
    this.writeExportNode(exportNode.next);
  }

  private writeMntRequest(req: msg.MountMntRequest): void {
    this.writeDirpath(req.dirpath);
  }

  private writeMntResponse(res: msg.MountMntResponse): void {
    const xdr = this.xdr;
    xdr.writeUnsignedInt(res.status);
    if (res.status === 0 && res.mountinfo) {
      this.writeFhandle3(res.mountinfo.fhandle);
      xdr.writeUnsignedInt(res.mountinfo.authFlavors.length);
      for (const flavor of res.mountinfo.authFlavors) {
        xdr.writeUnsignedInt(flavor);
      }
    }
  }

  private writeDumpResponse(res: msg.MountDumpResponse): void {
    this.writeMountBody(res.mountlist);
  }

  private writeUmntRequest(req: msg.MountUmntRequest): void {
    this.writeDirpath(req.dirpath);
  }

  private writeExportResponse(res: msg.MountExportResponse): void {
    this.writeExportNode(res.exports);
  }
}
