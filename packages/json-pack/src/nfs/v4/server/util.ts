import {Nfsv4Op, Nfsv4Proc} from '../constants';
import * as msg from '../messages';

export const toHex = (buffer: Uint8Array | Buffer): string => {
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const getProcName = (proc: number): string => {
  switch (proc) {
    case Nfsv4Proc.NULL:
      return 'NULL';
    case Nfsv4Proc.COMPOUND:
      return 'COMPOUND';
  }
  return 'UNKNOWN(' + proc + ')';
};

export const getOpName = (op: number): string => {
  switch (op) {
    case Nfsv4Op.ACCESS:
      return 'ACCESS';
    case Nfsv4Op.CLOSE:
      return 'CLOSE';
    case Nfsv4Op.COMMIT:
      return 'COMMIT';
    case Nfsv4Op.CREATE:
      return 'CREATE';
    case Nfsv4Op.DELEGPURGE:
      return 'DELEGPURGE';
    case Nfsv4Op.DELEGRETURN:
      return 'DELEGRETURN';
    case Nfsv4Op.GETATTR:
      return 'GETATTR';
    case Nfsv4Op.GETFH:
      return 'GETFH';
    case Nfsv4Op.LINK:
      return 'LINK';
    case Nfsv4Op.LOCK:
      return 'LOCK';
    case Nfsv4Op.LOCKT:
      return 'LOCKT';
    case Nfsv4Op.LOCKU:
      return 'LOCKU';
    case Nfsv4Op.LOOKUP:
      return 'LOOKUP';
    case Nfsv4Op.LOOKUPP:
      return 'LOOKUPP';
    case Nfsv4Op.NVERIFY:
      return 'NVERIFY';
    case Nfsv4Op.OPEN:
      return 'OPEN';
    case Nfsv4Op.OPENATTR:
      return 'OPENATTR';
    case Nfsv4Op.OPEN_CONFIRM:
      return 'OPEN_CONFIRM';
    case Nfsv4Op.OPEN_DOWNGRADE:
      return 'OPEN_DOWNGRADE';
    case Nfsv4Op.PUTFH:
      return 'PUTFH';
    case Nfsv4Op.PUTPUBFH:
      return 'PUTPUBFH';
    case Nfsv4Op.PUTROOTFH:
      return 'PUTROOTFH';
    case Nfsv4Op.READ:
      return 'READ';
    case Nfsv4Op.READDIR:
      return 'READDIR';
    case Nfsv4Op.READLINK:
      return 'READLINK';
    case Nfsv4Op.REMOVE:
      return 'REMOVE';
    case Nfsv4Op.RENAME:
      return 'RENAME';
    case Nfsv4Op.RENEW:
      return 'RENEW';
    case Nfsv4Op.RESTOREFH:
      return 'RESTOREFH';
    case Nfsv4Op.SAVEFH:
      return 'SAVEFH';
    case Nfsv4Op.SECINFO:
      return 'SECINFO';
    case Nfsv4Op.SETATTR:
      return 'SETATTR';
    case Nfsv4Op.SETCLIENTID:
      return 'SETCLIENTID';
    case Nfsv4Op.SETCLIENTID_CONFIRM:
      return 'SETCLIENTID_CONFIRM';
    case Nfsv4Op.VERIFY:
      return 'VERIFY';
    case Nfsv4Op.WRITE:
      return 'WRITE';
    case Nfsv4Op.RELEASE_LOCKOWNER:
      return 'RELEASE_LOCKOWNER';
    case Nfsv4Op.ILLEGAL:
      return 'ILLEGAL';
  }
  return 'UNKNOWN(' + op + ')';
};

export const getOpNameFromRequest = (op: msg.Nfsv4Request | unknown): string => {
  if (op instanceof msg.Nfsv4AccessRequest) return 'ACCESS';
  if (op instanceof msg.Nfsv4CloseRequest) return 'CLOSE';
  if (op instanceof msg.Nfsv4CommitRequest) return 'COMMIT';
  if (op instanceof msg.Nfsv4CreateRequest) return 'CREATE';
  if (op instanceof msg.Nfsv4DelegpurgeRequest) return 'DELEGPURGE';
  if (op instanceof msg.Nfsv4DelegreturnRequest) return 'DELEGRETURN';
  if (op instanceof msg.Nfsv4GetattrRequest) return 'GETATTR';
  if (op instanceof msg.Nfsv4GetfhRequest) return 'GETFH';
  if (op instanceof msg.Nfsv4LinkRequest) return 'LINK';
  if (op instanceof msg.Nfsv4LockRequest) return 'LOCK';
  if (op instanceof msg.Nfsv4LocktRequest) return 'LOCKT';
  if (op instanceof msg.Nfsv4LockuRequest) return 'LOCKU';
  if (op instanceof msg.Nfsv4LookupRequest) return 'LOOKUP';
  if (op instanceof msg.Nfsv4LookuppRequest) return 'LOOKUPP';
  if (op instanceof msg.Nfsv4NverifyRequest) return 'NVERIFY';
  if (op instanceof msg.Nfsv4OpenRequest) return 'OPEN';
  if (op instanceof msg.Nfsv4OpenattrRequest) return 'OPENATTR';
  if (op instanceof msg.Nfsv4OpenConfirmRequest) return 'OPEN_CONFIRM';
  if (op instanceof msg.Nfsv4OpenDowngradeRequest) return 'OPEN_DOWNGRADE';
  if (op instanceof msg.Nfsv4PutfhRequest) return 'PUTFH';
  if (op instanceof msg.Nfsv4PutpubfhRequest) return 'PUTPUBFH';
  if (op instanceof msg.Nfsv4PutrootfhRequest) return 'PUTROOTFH';
  if (op instanceof msg.Nfsv4ReadRequest) return 'READ';
  if (op instanceof msg.Nfsv4ReaddirRequest) return 'READDIR';
  if (op instanceof msg.Nfsv4ReadlinkRequest) return 'READLINK';
  if (op instanceof msg.Nfsv4RemoveRequest) return 'REMOVE';
  if (op instanceof msg.Nfsv4RenameRequest) return 'RENAME';
  if (op instanceof msg.Nfsv4RenewRequest) return 'RENEW';
  if (op instanceof msg.Nfsv4RestorefhRequest) return 'RESTOREFH';
  if (op instanceof msg.Nfsv4SavefhRequest) return 'SAVEFH';
  if (op instanceof msg.Nfsv4SecinfoRequest) return 'SECINFO';
  if (op instanceof msg.Nfsv4SetattrRequest) return 'SETATTR';
  if (op instanceof msg.Nfsv4SetclientidRequest) return 'SETCLIENTID';
  if (op instanceof msg.Nfsv4SetclientidConfirmRequest) return 'SETCLIENTID_CONFIRM';
  if (op instanceof msg.Nfsv4VerifyRequest) return 'VERIFY';
  if (op instanceof msg.Nfsv4WriteRequest) return 'WRITE';
  if (op instanceof msg.Nfsv4ReleaseLockOwnerRequest) return 'RELEASE_LOCKOWNER';
  if (op instanceof msg.Nfsv4IllegalRequest) return 'ILLEGAL';
  return 'UNKNOWN';
};
