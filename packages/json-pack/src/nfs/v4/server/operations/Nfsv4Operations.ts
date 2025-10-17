import type * as msg from '../../messages';
import type {Nfsv4CompoundProcCtx} from '../Nfsv4CompoundProcCtx';

export type Nfsv4OperationCtx = Pick<Nfsv4CompoundProcCtx, 'cfh' | 'sfh' | 'req' | 'getPrincipal' | 'connection'>;
export type Nfsv4OperationFn<Req extends msg.Nfsv4Request, Res extends msg.Nfsv4Response> = (
  request: Req,
  ctx: Nfsv4OperationCtx,
) => Promise<Res>;

export interface Nfsv4Operations {
  ACCESS: Nfsv4OperationFn<msg.Nfsv4AccessRequest, msg.Nfsv4AccessResponse>;
  CLOSE: Nfsv4OperationFn<msg.Nfsv4CloseRequest, msg.Nfsv4CloseResponse>;
  COMMIT: Nfsv4OperationFn<msg.Nfsv4CommitRequest, msg.Nfsv4CommitResponse>;
  CREATE: Nfsv4OperationFn<msg.Nfsv4CreateRequest, msg.Nfsv4CreateResponse>;
  DELEGPURGE: Nfsv4OperationFn<msg.Nfsv4DelegpurgeRequest, msg.Nfsv4DelegpurgeResponse>;
  DELEGRETURN: Nfsv4OperationFn<msg.Nfsv4DelegreturnRequest, msg.Nfsv4DelegreturnResponse>;
  GETATTR: Nfsv4OperationFn<msg.Nfsv4GetattrRequest, msg.Nfsv4GetattrResponse>;
  GETFH: Nfsv4OperationFn<msg.Nfsv4GetfhRequest, msg.Nfsv4GetfhResponse>;
  LINK: Nfsv4OperationFn<msg.Nfsv4LinkRequest, msg.Nfsv4LinkResponse>;
  LOCK: Nfsv4OperationFn<msg.Nfsv4LockRequest, msg.Nfsv4LockResponse>;
  LOCKT: Nfsv4OperationFn<msg.Nfsv4LocktRequest, msg.Nfsv4LocktResponse>;
  LOCKU: Nfsv4OperationFn<msg.Nfsv4LockuRequest, msg.Nfsv4LockuResponse>;
  LOOKUP: Nfsv4OperationFn<msg.Nfsv4LookupRequest, msg.Nfsv4LookupResponse>;
  LOOKUPP: Nfsv4OperationFn<msg.Nfsv4LookuppRequest, msg.Nfsv4LookuppResponse>;
  NVERIFY: Nfsv4OperationFn<msg.Nfsv4NverifyRequest, msg.Nfsv4NverifyResponse>;
  OPEN: Nfsv4OperationFn<msg.Nfsv4OpenRequest, msg.Nfsv4OpenResponse>;
  OPENATTR: Nfsv4OperationFn<msg.Nfsv4OpenattrRequest, msg.Nfsv4OpenattrResponse>;
  OPEN_CONFIRM: Nfsv4OperationFn<msg.Nfsv4OpenConfirmRequest, msg.Nfsv4OpenConfirmResponse>;
  OPEN_DOWNGRADE: Nfsv4OperationFn<msg.Nfsv4OpenDowngradeRequest, msg.Nfsv4OpenDowngradeResponse>;
  PUTFH: Nfsv4OperationFn<msg.Nfsv4PutfhRequest, msg.Nfsv4PutfhResponse>;
  PUTPUBFH: Nfsv4OperationFn<msg.Nfsv4PutpubfhRequest, msg.Nfsv4PutpubfhResponse>;
  PUTROOTFH: Nfsv4OperationFn<msg.Nfsv4PutrootfhRequest, msg.Nfsv4PutrootfhResponse>;
  READ: Nfsv4OperationFn<msg.Nfsv4ReadRequest, msg.Nfsv4ReadResponse>;
  READDIR: Nfsv4OperationFn<msg.Nfsv4ReaddirRequest, msg.Nfsv4ReaddirResponse>;
  READLINK: Nfsv4OperationFn<msg.Nfsv4ReadlinkRequest, msg.Nfsv4ReadlinkResponse>;
  REMOVE: Nfsv4OperationFn<msg.Nfsv4RemoveRequest, msg.Nfsv4RemoveResponse>;
  RENAME: Nfsv4OperationFn<msg.Nfsv4RenameRequest, msg.Nfsv4RenameResponse>;
  RENEW: Nfsv4OperationFn<msg.Nfsv4RenewRequest, msg.Nfsv4RenewResponse>;
  RESTOREFH: Nfsv4OperationFn<msg.Nfsv4RestorefhRequest, msg.Nfsv4RestorefhResponse>;
  SAVEFH: Nfsv4OperationFn<msg.Nfsv4SavefhRequest, msg.Nfsv4SavefhResponse>;
  SECINFO: Nfsv4OperationFn<msg.Nfsv4SecinfoRequest, msg.Nfsv4SecinfoResponse>;
  SETATTR: Nfsv4OperationFn<msg.Nfsv4SetattrRequest, msg.Nfsv4SetattrResponse>;

  /** @see {@link https://datatracker.ietf.org/doc/html/rfc7530#section-16.33} */
  SETCLIENTID: Nfsv4OperationFn<msg.Nfsv4SetclientidRequest, msg.Nfsv4SetclientidResponse>;

  SETCLIENTID_CONFIRM: Nfsv4OperationFn<msg.Nfsv4SetclientidConfirmRequest, msg.Nfsv4SetclientidConfirmResponse>;
  VERIFY: Nfsv4OperationFn<msg.Nfsv4VerifyRequest, msg.Nfsv4VerifyResponse>;
  WRITE: Nfsv4OperationFn<msg.Nfsv4WriteRequest, msg.Nfsv4WriteResponse>;
  RELEASE_LOCKOWNER: Nfsv4OperationFn<msg.Nfsv4ReleaseLockOwnerRequest, msg.Nfsv4ReleaseLockOwnerResponse>;
  ILLEGAL: Nfsv4OperationFn<msg.Nfsv4IllegalRequest, msg.Nfsv4IllegalResponse>;
}
