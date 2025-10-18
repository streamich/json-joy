import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {XdrDecoder} from '../../../xdr/XdrDecoder';
import {MountProc} from './constants';
import {Nfsv3DecodingError} from '../errors';
import * as msg from './messages';
import * as structs from './structs';

export class MountDecoder {
  protected readonly xdr: XdrDecoder;

  constructor(reader: Reader = new Reader()) {
    this.xdr = new XdrDecoder(reader);
  }

  public decodeMessage(reader: Reader, proc: MountProc, isRequest: boolean): msg.MountMessage | undefined {
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

  private decodeRequest(proc: MountProc): msg.MountRequest | undefined {
    switch (proc) {
      case MountProc.NULL:
        return undefined;
      case MountProc.MNT:
        return this.decodeMntRequest();
      case MountProc.DUMP:
        return new msg.MountDumpRequest();
      case MountProc.UMNT:
        return this.decodeUmntRequest();
      case MountProc.UMNTALL:
        return new msg.MountUmntallRequest();
      case MountProc.EXPORT:
        return new msg.MountExportRequest();
      default:
        throw new Nfsv3DecodingError(`Unknown MOUNT procedure: ${proc}`);
    }
  }

  private decodeResponse(proc: MountProc): msg.MountResponse | undefined {
    switch (proc) {
      case MountProc.NULL:
        return undefined;
      case MountProc.MNT:
        return this.decodeMntResponse();
      case MountProc.DUMP:
        return this.decodeDumpResponse();
      case MountProc.UMNT:
        return undefined;
      case MountProc.UMNTALL:
        return undefined;
      case MountProc.EXPORT:
        return this.decodeExportResponse();
      default:
        throw new Nfsv3DecodingError(`Unknown MOUNT procedure: ${proc}`);
    }
  }

  private readFhandle3(): structs.MountFhandle3 {
    const data = this.xdr.readVarlenOpaque();
    return new structs.MountFhandle3(new Reader(data));
  }

  private readDirpath(): string {
    return this.xdr.readString();
  }

  private readMountBody(): structs.MountBody | undefined {
    const valueFollows = this.xdr.readBoolean();
    if (!valueFollows) return undefined;
    const hostname = this.xdr.readString();
    const directory = this.readDirpath();
    const next = this.readMountBody();
    return new structs.MountBody(hostname, directory, next);
  }

  private readGroupNode(): structs.MountGroupNode | undefined {
    const valueFollows = this.xdr.readBoolean();
    if (!valueFollows) return undefined;
    const name = this.xdr.readString();
    const next = this.readGroupNode();
    return new structs.MountGroupNode(name, next);
  }

  private readExportNode(): structs.MountExportNode | undefined {
    const valueFollows = this.xdr.readBoolean();
    if (!valueFollows) return undefined;
    const dir = this.readDirpath();
    const groups = this.readGroupNode();
    const next = this.readExportNode();
    return new structs.MountExportNode(dir, groups, next);
  }

  private decodeMntRequest(): msg.MountMntRequest {
    const dirpath = this.readDirpath();
    return new msg.MountMntRequest(dirpath);
  }

  private decodeMntResponse(): msg.MountMntResponse {
    const xdr = this.xdr;
    const status = xdr.readUnsignedInt();
    if (status !== 0) {
      return new msg.MountMntResponse(status);
    }
    const fhandle = this.readFhandle3();
    const authFlavorsCount = xdr.readUnsignedInt();
    const authFlavors: number[] = [];
    for (let i = 0; i < authFlavorsCount; i++) {
      authFlavors.push(xdr.readUnsignedInt());
    }
    const mountinfo = new msg.MountMntResOk(fhandle, authFlavors);
    return new msg.MountMntResponse(status, mountinfo);
  }

  private decodeDumpResponse(): msg.MountDumpResponse {
    const mountlist = this.readMountBody();
    return new msg.MountDumpResponse(mountlist);
  }

  private decodeUmntRequest(): msg.MountUmntRequest {
    const dirpath = this.readDirpath();
    return new msg.MountUmntRequest(dirpath);
  }

  private decodeExportResponse(): msg.MountExportResponse {
    const exports = this.readExportNode();
    return new msg.MountExportResponse(exports);
  }
}
