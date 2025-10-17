import {Nfsv4Stat, type Nfsv4LockType, Nfsv4Op, Nfsv4CbOp} from './constants';
import * as structs from './structs';
import type {XdrDecoder, XdrEncoder, XdrType} from '../../xdr';

export type Nfsv4Operation = Nfsv4Request | Nfsv4Response;

export type Nfsv4Request =
  | Nfsv4AccessRequest
  | Nfsv4CloseRequest
  | Nfsv4CommitRequest
  | Nfsv4CreateRequest
  | Nfsv4DelegpurgeRequest
  | Nfsv4DelegreturnRequest
  | Nfsv4GetattrRequest
  | Nfsv4GetfhRequest
  | Nfsv4LinkRequest
  | Nfsv4LockRequest
  | Nfsv4LocktRequest
  | Nfsv4LockuRequest
  | Nfsv4LookupRequest
  | Nfsv4LookuppRequest
  | Nfsv4NverifyRequest
  | Nfsv4OpenRequest
  | Nfsv4OpenattrRequest
  | Nfsv4OpenConfirmRequest
  | Nfsv4OpenDowngradeRequest
  | Nfsv4PutfhRequest
  | Nfsv4PutpubfhRequest
  | Nfsv4PutrootfhRequest
  | Nfsv4ReadRequest
  | Nfsv4ReaddirRequest
  | Nfsv4ReadlinkRequest
  | Nfsv4RemoveRequest
  | Nfsv4RenameRequest
  | Nfsv4RenewRequest
  | Nfsv4RestorefhRequest
  | Nfsv4SavefhRequest
  | Nfsv4SecinfoRequest
  | Nfsv4SetattrRequest
  | Nfsv4SetclientidRequest
  | Nfsv4SetclientidConfirmRequest
  | Nfsv4VerifyRequest
  | Nfsv4WriteRequest
  | Nfsv4ReleaseLockOwnerRequest
  | Nfsv4IllegalRequest;

export type Nfsv4Response =
  | Nfsv4AccessResponse
  | Nfsv4CloseResponse
  | Nfsv4CommitResponse
  | Nfsv4CreateResponse
  | Nfsv4DelegpurgeResponse
  | Nfsv4DelegreturnResponse
  | Nfsv4GetattrResponse
  | Nfsv4GetfhResponse
  | Nfsv4LinkResponse
  | Nfsv4LockResponse
  | Nfsv4LocktResponse
  | Nfsv4LockuResponse
  | Nfsv4LookupResponse
  | Nfsv4LookuppResponse
  | Nfsv4NverifyResponse
  | Nfsv4OpenResponse
  | Nfsv4OpenattrResponse
  | Nfsv4OpenConfirmResponse
  | Nfsv4OpenDowngradeResponse
  | Nfsv4PutfhResponse
  | Nfsv4PutpubfhResponse
  | Nfsv4PutrootfhResponse
  | Nfsv4ReadResponse
  | Nfsv4ReaddirResponse
  | Nfsv4ReadlinkResponse
  | Nfsv4RemoveResponse
  | Nfsv4RenameResponse
  | Nfsv4RenewResponse
  | Nfsv4RestorefhResponse
  | Nfsv4SavefhResponse
  | Nfsv4SecinfoResponse
  | Nfsv4SetattrResponse
  | Nfsv4SetclientidResponse
  | Nfsv4SetclientidConfirmResponse
  | Nfsv4VerifyResponse
  | Nfsv4WriteResponse
  | Nfsv4ReleaseLockOwnerResponse
  | Nfsv4IllegalResponse;

export class Nfsv4AccessRequest implements XdrType {
  static decode(xdr: XdrDecoder): Nfsv4AccessRequest {
    const access = xdr.readUnsignedInt();
    return new Nfsv4AccessRequest(access);
  }

  constructor(public readonly access: number) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.ACCESS);
    xdr.writeUnsignedInt(this.access);
  }
}

export class Nfsv4AccessResOk {
  constructor(
    public readonly supported: number,
    public readonly access: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.supported);
    xdr.writeUnsignedInt(this.access);
  }
}

export class Nfsv4AccessResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4AccessResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.ACCESS);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4CloseRequest {
  static decode(xdr: XdrDecoder): Nfsv4CloseRequest {
    const seqid = xdr.readUnsignedInt();
    const openStateid = structs.Nfsv4Stateid.decode(xdr);
    return new Nfsv4CloseRequest(seqid, openStateid);
  }

  constructor(
    public readonly seqid: number,
    public readonly openStateid: structs.Nfsv4Stateid,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.CLOSE);
    xdr.writeUnsignedInt(this.seqid);
    this.openStateid.encode(xdr);
  }
}

export class Nfsv4CloseResOk {
  constructor(public readonly openStateid: structs.Nfsv4Stateid) {}

  encode(xdr: XdrEncoder): void {
    this.openStateid.encode(xdr);
  }
}

export class Nfsv4CloseResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4CloseResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.CLOSE);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4CommitRequest implements XdrType {
  public static decode(xdr: XdrDecoder): Nfsv4CommitRequest {
    const offset = xdr.readUnsignedHyper();
    const count = xdr.readUnsignedInt();
    return new Nfsv4CommitRequest(offset, count);
  }

  constructor(
    public readonly offset: bigint,
    public readonly count: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.COMMIT);
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedInt(this.count);
  }
}

export class Nfsv4CommitResOk {
  constructor(public readonly writeverf: structs.Nfsv4Verifier) {}

  encode(xdr: XdrEncoder): void {
    this.writeverf.encode(xdr);
  }
}

export class Nfsv4CommitResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4CommitResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.COMMIT);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4CreateRequest implements XdrType {
  constructor(
    public readonly objtype: structs.Nfsv4CreateType,
    public readonly objname: string,
    public readonly createattrs: structs.Nfsv4Fattr,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.CREATE);
    this.objtype.encode(xdr);
    xdr.writeStr(this.objname);
    this.createattrs.encode(xdr);
  }
}

export class Nfsv4CreateResOk {
  constructor(
    public readonly cinfo: structs.Nfsv4ChangeInfo,
    public readonly attrset: structs.Nfsv4Bitmap,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.cinfo.encode(xdr);
    this.attrset.encode(xdr);
  }
}

export class Nfsv4CreateResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4CreateResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.CREATE);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4DelegpurgeRequest implements XdrType {
  static decode(xdr: XdrDecoder): Nfsv4DelegpurgeRequest {
    const clientid = xdr.readUnsignedHyper();
    return new Nfsv4DelegpurgeRequest(clientid);
  }

  constructor(public readonly clientid: bigint) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.DELEGPURGE);
    xdr.writeUnsignedHyper(this.clientid);
  }
}

export class Nfsv4DelegpurgeResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.DELEGPURGE);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4DelegreturnRequest implements XdrType {
  static decode(xdr: XdrDecoder): Nfsv4DelegreturnRequest {
    const delegStateid = structs.Nfsv4Stateid.decode(xdr);
    return new Nfsv4DelegreturnRequest(delegStateid);
  }

  constructor(public readonly delegStateid: structs.Nfsv4Stateid) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.DELEGRETURN);
    this.delegStateid.encode(xdr);
  }
}

export class Nfsv4DelegreturnResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.DELEGRETURN);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4GetattrRequest implements XdrType {
  constructor(public readonly attrRequest: structs.Nfsv4Bitmap) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.GETATTR);
    this.attrRequest.encode(xdr);
  }
}

export class Nfsv4GetattrResOk {
  constructor(public readonly objAttributes: structs.Nfsv4Fattr) {}

  encode(xdr: XdrEncoder): void {
    this.objAttributes.encode(xdr);
  }
}

export class Nfsv4GetattrResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4GetattrResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.GETATTR);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4GetfhRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.GETFH);
  }
}

export class Nfsv4GetfhResOk {
  constructor(public readonly object: structs.Nfsv4Fh) {}

  encode(xdr: XdrEncoder): void {
    this.object.encode(xdr);
  }
}

export class Nfsv4GetfhResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4GetfhResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.GETFH);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4LinkRequest implements XdrType {
  constructor(public readonly newname: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LINK);
    xdr.writeStr(this.newname);
  }
}

export class Nfsv4LinkResOk {
  constructor(public readonly cinfo: structs.Nfsv4ChangeInfo) {}

  encode(xdr: XdrEncoder): void {
    this.cinfo.encode(xdr);
  }
}

export class Nfsv4LinkResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4LinkResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LINK);
    xdr.writeUnsignedInt(this.status);
    if (this.status === 0) this.resok?.encode(xdr);
  }
}

export class Nfsv4LockRequest implements XdrType {
  constructor(
    public readonly locktype: Nfsv4LockType,
    public readonly reclaim: boolean,
    public readonly offset: bigint,
    public readonly length: bigint,
    public readonly locker: structs.Nfsv4LockOwnerInfo,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOCK);
    xdr.writeUnsignedInt(this.locktype);
    xdr.writeBoolean(this.reclaim);
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedHyper(this.length);
    this.locker.encode(xdr);
  }
}

export class Nfsv4LockResOk {
  constructor(public readonly lockStateid: structs.Nfsv4Stateid) {}

  encode(xdr: XdrEncoder): void {
    this.lockStateid.encode(xdr);
  }
}

export class Nfsv4LockResDenied {
  constructor(
    public readonly offset: bigint,
    public readonly length: bigint,
    public readonly locktype: Nfsv4LockType,
    public readonly owner: structs.Nfsv4LockOwner,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedHyper(this.length);
    xdr.writeUnsignedInt(this.locktype);
    this.owner.encode(xdr);
  }
}

export class Nfsv4LockResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4LockResOk,
    public readonly denied?: Nfsv4LockResDenied,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOCK);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    } else if (this.denied) {
      this.denied.encode(xdr);
    }
  }
}

export class Nfsv4LocktRequest implements XdrType {
  constructor(
    public readonly locktype: Nfsv4LockType,
    public readonly offset: bigint,
    public readonly length: bigint,
    public readonly owner: structs.Nfsv4LockOwner,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOCKT);
    xdr.writeUnsignedInt(this.locktype);
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedHyper(this.length);
    this.owner.encode(xdr);
  }
}

export class Nfsv4LocktResDenied {
  constructor(
    public readonly offset: bigint,
    public readonly length: bigint,
    public readonly locktype: Nfsv4LockType,
    public readonly owner: structs.Nfsv4LockOwner,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedHyper(this.length);
    xdr.writeUnsignedInt(this.locktype);
    this.owner.encode(xdr);
  }
}

export class Nfsv4LocktResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly denied?: Nfsv4LocktResDenied,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOCKT);
    xdr.writeUnsignedInt(this.status);
    this.denied?.encode(xdr);
  }
}

export class Nfsv4LockuRequest implements XdrType {
  constructor(
    public readonly locktype: Nfsv4LockType,
    public readonly seqid: number,
    public readonly lockStateid: structs.Nfsv4Stateid,
    public readonly offset: bigint,
    public readonly length: bigint,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOCKU);
    xdr.writeUnsignedInt(this.locktype);
    xdr.writeUnsignedInt(this.seqid);
    this.lockStateid.encode(xdr);
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedHyper(this.length);
  }
}

export class Nfsv4LockuResOk {
  constructor(public readonly lockStateid: structs.Nfsv4Stateid) {}

  encode(xdr: XdrEncoder): void {
    this.lockStateid.encode(xdr);
  }
}

export class Nfsv4LockuResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4LockuResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOCKU);
    xdr.writeUnsignedInt(this.status);
    if (this.status === 0) this.resok?.encode(xdr);
  }
}

export class Nfsv4LookupRequest implements XdrType {
  constructor(public readonly objname: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOOKUP);
    xdr.writeStr(this.objname);
  }
}

export class Nfsv4LookupResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOOKUP);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4LookuppRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOOKUPP);
  }
}

export class Nfsv4LookuppResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.LOOKUPP);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4NverifyRequest implements XdrType {
  constructor(public readonly objAttributes: structs.Nfsv4Fattr) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.NVERIFY);
    this.objAttributes.encode(xdr);
  }
}

export class Nfsv4NverifyResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.NVERIFY);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4OpenRequest implements XdrType {
  constructor(
    public readonly seqid: number,
    public readonly shareAccess: number,
    public readonly shareDeny: number,
    public readonly owner: structs.Nfsv4OpenOwner,
    public readonly openhow: structs.Nfsv4OpenHow,
    public readonly claim: structs.Nfsv4OpenClaim,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPEN);
    xdr.writeUnsignedInt(this.seqid);
    xdr.writeUnsignedInt(this.shareAccess);
    xdr.writeUnsignedInt(this.shareDeny);
    this.owner.encode(xdr);
    this.openhow.encode(xdr);
    this.claim.encode(xdr);
  }
}

export class Nfsv4OpenResOk {
  constructor(
    public readonly stateid: structs.Nfsv4Stateid,
    public readonly cinfo: structs.Nfsv4ChangeInfo,
    public readonly rflags: number,
    public readonly attrset: structs.Nfsv4Bitmap,
    public readonly delegation: structs.Nfsv4OpenDelegation,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.stateid.encode(xdr);
    this.cinfo.encode(xdr);
    xdr.writeUnsignedInt(this.rflags);
    this.attrset.encode(xdr);
    this.delegation.encode(xdr);
  }
}

export class Nfsv4OpenResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4OpenResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPEN);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4OpenattrRequest implements XdrType {
  constructor(public readonly createdir: boolean) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPENATTR);
    xdr.writeBoolean(this.createdir);
  }
}

export class Nfsv4OpenattrResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPENATTR);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4OpenConfirmRequest implements XdrType {
  constructor(
    public readonly openStateid: structs.Nfsv4Stateid,
    public readonly seqid: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPEN_CONFIRM);
    this.openStateid.encode(xdr);
    xdr.writeUnsignedInt(this.seqid);
  }
}

export class Nfsv4OpenConfirmResOk {
  constructor(public readonly openStateid: structs.Nfsv4Stateid) {}

  encode(xdr: XdrEncoder): void {
    this.openStateid.encode(xdr);
  }
}

export class Nfsv4OpenConfirmResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4OpenConfirmResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPEN_CONFIRM);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4OpenDowngradeRequest implements XdrType {
  constructor(
    public readonly openStateid: structs.Nfsv4Stateid,
    public readonly seqid: number,
    public readonly shareAccess: number,
    public readonly shareDeny: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPEN_DOWNGRADE);
    this.openStateid.encode(xdr);
    xdr.writeUnsignedInt(this.seqid);
    xdr.writeUnsignedInt(this.shareAccess);
    xdr.writeUnsignedInt(this.shareDeny);
  }
}

export class Nfsv4OpenDowngradeResOk {
  constructor(public readonly openStateid: structs.Nfsv4Stateid) {}

  encode(xdr: XdrEncoder): void {
    this.openStateid.encode(xdr);
  }
}

export class Nfsv4OpenDowngradeResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4OpenDowngradeResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.OPEN_DOWNGRADE);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4PutfhRequest implements XdrType {
  constructor(public readonly object: structs.Nfsv4Fh) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.PUTFH);
    this.object.encode(xdr);
  }
}

export class Nfsv4PutfhResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.PUTFH);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4PutpubfhRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.PUTPUBFH);
  }
}

export class Nfsv4PutpubfhResponse implements XdrType {
  static decode(xdr: XdrDecoder): Nfsv4PutpubfhResponse {
    const status = xdr.readUnsignedInt();
    return new Nfsv4PutpubfhResponse(status);
  }

  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.PUTPUBFH);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4PutrootfhRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.PUTROOTFH);
  }
}

export class Nfsv4PutrootfhResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.PUTROOTFH);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4ReadRequest implements XdrType {
  constructor(
    public readonly stateid: structs.Nfsv4Stateid,
    public readonly offset: bigint,
    public readonly count: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.READ);
    this.stateid.encode(xdr);
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedInt(this.count);
  }
}

export class Nfsv4ReadResOk {
  constructor(
    public readonly eof: boolean,
    public readonly data: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeBoolean(this.eof);
    xdr.writeVarlenOpaque(this.data);
  }
}

export class Nfsv4ReadResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4ReadResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.READ);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4ReaddirRequest implements XdrType {
  constructor(
    public readonly cookie: bigint,
    public readonly cookieverf: structs.Nfsv4Verifier,
    public readonly dircount: number,
    public readonly maxcount: number,
    public readonly attrRequest: structs.Nfsv4Bitmap,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.READDIR);
    xdr.writeUnsignedHyper(this.cookie);
    this.cookieverf.encode(xdr);
    xdr.writeUnsignedInt(this.dircount);
    xdr.writeUnsignedInt(this.maxcount);
    this.attrRequest.encode(xdr);
  }
}

export class Nfsv4ReaddirResOk {
  constructor(
    public readonly cookieverf: structs.Nfsv4Verifier,
    public readonly entries: structs.Nfsv4Entry[],
    public readonly eof: boolean,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.cookieverf.encode(xdr);
    const entries = this.entries;
    const length = entries.length;
    for (let i = 0; i < length; i++) {
      const entry = entries[i];
      xdr.writeBoolean(true);
      entry.encode(xdr);
    }
    xdr.writeBoolean(false);
    xdr.writeBoolean(this.eof);
  }
}

export class Nfsv4ReaddirResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4ReaddirResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.READDIR);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4ReadlinkRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.READLINK);
  }
}

export class Nfsv4ReadlinkResOk {
  constructor(public readonly link: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeStr(this.link);
  }
}

export class Nfsv4ReadlinkResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4ReadlinkResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.READLINK);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4RemoveRequest implements XdrType {
  constructor(public readonly target: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.REMOVE);
    xdr.writeStr(this.target);
  }
}

export class Nfsv4RemoveResOk {
  constructor(public readonly cinfo: structs.Nfsv4ChangeInfo) {}

  encode(xdr: XdrEncoder): void {
    this.cinfo.encode(xdr);
  }
}

export class Nfsv4RemoveResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4RemoveResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.REMOVE);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4RenameRequest implements XdrType {
  constructor(
    public readonly oldname: string,
    public readonly newname: string,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RENAME);
    xdr.writeStr(this.oldname);
    xdr.writeStr(this.newname);
  }
}

export class Nfsv4RenameResOk {
  constructor(
    public readonly sourceCinfo: structs.Nfsv4ChangeInfo,
    public readonly targetCinfo: structs.Nfsv4ChangeInfo,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.sourceCinfo.encode(xdr);
    this.targetCinfo.encode(xdr);
  }
}

export class Nfsv4RenameResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4RenameResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RENAME);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4RenewRequest implements XdrType {
  constructor(public readonly clientid: bigint) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RENEW);
    xdr.writeUnsignedHyper(this.clientid);
  }
}

export class Nfsv4RenewResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RENEW);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4RestorefhRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RESTOREFH);
  }
}

export class Nfsv4RestorefhResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RESTOREFH);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4SavefhRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SAVEFH);
  }
}

export class Nfsv4SavefhResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SAVEFH);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4SecinfoRequest implements XdrType {
  constructor(public readonly name: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SECINFO);
    xdr.writeStr(this.name);
  }
}

export class Nfsv4SecinfoResOk {
  constructor(public readonly flavors: structs.Nfsv4SecInfoFlavor[]) {}

  encode(xdr: XdrEncoder): void {
    const flavors = this.flavors;
    const len = flavors.length;
    xdr.writeUnsignedInt(len);
    for (let i = 0; i < len; i++) flavors[i].encode(xdr);
  }
}

export class Nfsv4SecinfoResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4SecinfoResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SECINFO);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) this.resok.encode(xdr);
  }
}

export class Nfsv4SetattrRequest implements XdrType {
  constructor(
    public readonly stateid: structs.Nfsv4Stateid,
    public readonly objAttributes: structs.Nfsv4Fattr,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SETATTR);
    this.stateid.encode(xdr);
    this.objAttributes.encode(xdr);
  }
}

export class Nfsv4SetattrResOk {
  constructor(public readonly attrsset: structs.Nfsv4Bitmap) {}

  encode(xdr: XdrEncoder): void {
    this.attrsset.encode(xdr);
  }
}

export class Nfsv4SetattrResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4SetattrResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SETATTR);
    xdr.writeUnsignedInt(this.status);
    this.resok?.encode(xdr);
  }
}

export class Nfsv4SetclientidRequest implements XdrType {
  constructor(
    public readonly client: structs.Nfsv4ClientId,
    public readonly callback: structs.Nfsv4CbClient,
    public readonly callbackIdent: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SETCLIENTID);
    this.client.encode(xdr);
    this.callback.encode(xdr);
    xdr.writeUnsignedInt(this.callbackIdent);
  }
}

export class Nfsv4SetclientidResOk {
  constructor(
    public readonly clientid: bigint,
    public readonly setclientidConfirm: structs.Nfsv4Verifier,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedHyper(this.clientid);
    this.setclientidConfirm.encode(xdr);
  }
}

export class Nfsv4SetclientidResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4SetclientidResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SETCLIENTID);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK) this.resok?.encode(xdr);
  }
}

export class Nfsv4SetclientidConfirmRequest implements XdrType {
  constructor(
    public readonly clientid: bigint,
    public readonly setclientidConfirm: structs.Nfsv4Verifier,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SETCLIENTID_CONFIRM);
    xdr.writeUnsignedHyper(this.clientid);
    this.setclientidConfirm.encode(xdr);
  }
}

export class Nfsv4SetclientidConfirmResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.SETCLIENTID_CONFIRM);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4VerifyRequest implements XdrType {
  constructor(public readonly objAttributes: structs.Nfsv4Fattr) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.VERIFY);
    this.objAttributes.encode(xdr);
  }
}

export class Nfsv4VerifyResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.VERIFY);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4WriteRequest implements XdrType {
  constructor(
    public readonly stateid: structs.Nfsv4Stateid,
    public readonly offset: bigint,
    public readonly stable: number,
    public readonly data: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.WRITE);
    this.stateid.encode(xdr);
    xdr.writeUnsignedHyper(this.offset);
    xdr.writeUnsignedInt(this.stable);
    xdr.writeVarlenOpaque(this.data);
  }
}

export class Nfsv4WriteResOk {
  constructor(
    public readonly count: number,
    public readonly committed: number,
    public readonly writeverf: structs.Nfsv4Verifier,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.count);
    xdr.writeUnsignedInt(this.committed);
    this.writeverf.encode(xdr);
  }
}

export class Nfsv4WriteResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4WriteResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.WRITE);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) this.resok.encode(xdr);
  }
}

export class Nfsv4ReleaseLockOwnerRequest implements XdrType {
  constructor(public readonly lockOwner: structs.Nfsv4LockOwner) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RELEASE_LOCKOWNER);
    this.lockOwner.encode(xdr);
  }
}

export class Nfsv4ReleaseLockOwnerResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.RELEASE_LOCKOWNER);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4IllegalRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.ILLEGAL);
  }
}

export class Nfsv4IllegalResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4Op.ILLEGAL);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4CompoundRequest implements XdrType {
  constructor(
    public readonly tag: string,
    public readonly minorversion: number,
    public readonly argarray: Nfsv4Request[],
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeStr(this.tag);
    xdr.writeUnsignedInt(this.minorversion);
    const argarray = this.argarray;
    const len = argarray.length;
    xdr.writeUnsignedInt(len);
    for (let i = 0; i < len; i++) argarray[i].encode(xdr);
  }
}

export class Nfsv4CompoundResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly tag: string,
    public readonly resarray: Nfsv4Response[],
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.status);
    xdr.writeStr(this.tag);
    const resarray = this.resarray;
    const len = resarray.length;
    xdr.writeUnsignedInt(len);
    for (let i = 0; i < len; i++) resarray[i].encode(xdr);
  }
}

export type Nfsv4CbOperation = Nfsv4CbRequest | Nfsv4CbResponse;

export type Nfsv4CbRequest = Nfsv4CbGetattrRequest | Nfsv4CbRecallRequest | Nfsv4CbIllegalRequest;

export type Nfsv4CbResponse = Nfsv4CbGetattrResponse | Nfsv4CbRecallResponse | Nfsv4CbIllegalResponse;

export class Nfsv4CbGetattrRequest implements XdrType {
  constructor(
    public readonly fh: structs.Nfsv4Fh,
    public readonly attrRequest: structs.Nfsv4Bitmap,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4CbOp.CB_GETATTR);
    this.fh.encode(xdr);
    this.attrRequest.encode(xdr);
  }
}

export class Nfsv4CbGetattrResOk {
  constructor(public readonly objAttributes: structs.Nfsv4Fattr) {}

  encode(xdr: XdrEncoder): void {
    this.objAttributes.encode(xdr);
  }
}

export class Nfsv4CbGetattrResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly resok?: Nfsv4CbGetattrResOk,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4CbOp.CB_GETATTR);
    xdr.writeUnsignedInt(this.status);
    if (this.status === Nfsv4Stat.NFS4_OK && this.resok) {
      this.resok.encode(xdr);
    }
  }
}

export class Nfsv4CbRecallRequest implements XdrType {
  constructor(
    public readonly stateid: structs.Nfsv4Stateid,
    public readonly truncate: boolean,
    public readonly fh: structs.Nfsv4Fh,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4CbOp.CB_RECALL);
    this.stateid.encode(xdr);
    xdr.writeBoolean(this.truncate);
    this.fh.encode(xdr);
  }
}

export class Nfsv4CbRecallResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4CbOp.CB_RECALL);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4CbIllegalRequest implements XdrType {
  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4CbOp.CB_ILLEGAL);
  }
}

export class Nfsv4CbIllegalResponse implements XdrType {
  constructor(public readonly status: Nfsv4Stat) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(Nfsv4CbOp.CB_ILLEGAL);
    xdr.writeUnsignedInt(this.status);
  }
}

export class Nfsv4CbCompoundRequest implements XdrType {
  constructor(
    public readonly tag: string,
    public readonly minorversion: number,
    public readonly callbackIdent: number,
    public readonly argarray: Nfsv4CbRequest[],
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeStr(this.tag);
    xdr.writeUnsignedInt(this.minorversion);
    xdr.writeUnsignedInt(this.callbackIdent);
    const argarray = this.argarray;
    const len = argarray.length;
    xdr.writeUnsignedInt(len);
    for (let i = 0; i < len; i++) argarray[i].encode(xdr);
  }
}

export class Nfsv4CbCompoundResponse implements XdrType {
  constructor(
    public readonly status: Nfsv4Stat,
    public readonly tag: string,
    public readonly resarray: Nfsv4CbResponse[],
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.status);
    xdr.writeStr(this.tag);
    const resarray = this.resarray;
    const len = resarray.length;
    xdr.writeUnsignedInt(len);
    for (let i = 0; i < len; i++) resarray[i].encode(xdr);
  }
}
