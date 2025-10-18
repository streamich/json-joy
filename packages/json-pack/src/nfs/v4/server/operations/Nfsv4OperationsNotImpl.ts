import type * as msg from '../../messages';
import type {Nfsv4OperationCtx, Nfsv4Operations} from './Nfsv4Operations';

export class Nfsv4OperationsNotImpl implements Nfsv4Operations {
  public async ACCESS(request: msg.Nfsv4AccessRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4AccessResponse> {
    ctx.connection.logger.log('ACCESS', request);
    throw new Error('Not implemented');
  }
  public async CLOSE(request: msg.Nfsv4CloseRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4CloseResponse> {
    ctx.connection.logger.log('CLOSE', request);
    throw new Error('Not implemented');
  }
  public async COMMIT(request: msg.Nfsv4CommitRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4CommitResponse> {
    ctx.connection.logger.log('COMMIT', request);
    throw new Error('Not implemented');
  }
  public async CREATE(request: msg.Nfsv4CreateRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4CreateResponse> {
    ctx.connection.logger.log('CREATE', request);
    throw new Error('Not implemented');
  }
  public async DELEGPURGE(
    request: msg.Nfsv4DelegpurgeRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4DelegpurgeResponse> {
    ctx.connection.logger.log('DELEGPURGE', request);
    throw new Error('Not implemented');
  }
  public async DELEGRETURN(
    request: msg.Nfsv4DelegreturnRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4DelegreturnResponse> {
    ctx.connection.logger.log('DELEGRETURN', request);
    throw new Error('Not implemented');
  }
  public async GETATTR(request: msg.Nfsv4GetattrRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4GetattrResponse> {
    ctx.connection.logger.log('GETATTR', request);
    throw new Error('Not implemented');
  }
  public async GETFH(request: msg.Nfsv4GetfhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4GetfhResponse> {
    ctx.connection.logger.log('GETFH', request);
    throw new Error('Not implemented');
  }
  public async LINK(request: msg.Nfsv4LinkRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LinkResponse> {
    ctx.connection.logger.log('LINK', request);
    throw new Error('Not implemented');
  }
  public async LOCK(request: msg.Nfsv4LockRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LockResponse> {
    ctx.connection.logger.log('LOCK', request);
    throw new Error('Not implemented');
  }
  public async LOCKT(request: msg.Nfsv4LocktRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LocktResponse> {
    ctx.connection.logger.log('LOCKT', request);
    throw new Error('Not implemented');
  }
  public async LOCKU(request: msg.Nfsv4LockuRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LockuResponse> {
    ctx.connection.logger.log('LOCKU', request);
    throw new Error('Not implemented');
  }
  public async LOOKUP(request: msg.Nfsv4LookupRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LookupResponse> {
    ctx.connection.logger.log('LOOKUP', request);
    throw new Error('Not implemented');
  }
  public async LOOKUPP(request: msg.Nfsv4LookuppRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LookuppResponse> {
    ctx.connection.logger.log('LOOKUPP', request);
    throw new Error('Not implemented');
  }
  public async NVERIFY(request: msg.Nfsv4NverifyRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4NverifyResponse> {
    ctx.connection.logger.log('NVERIFY', request);
    throw new Error('Not implemented');
  }
  public async OPEN(request: msg.Nfsv4OpenRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4OpenResponse> {
    ctx.connection.logger.log('OPEN', request);
    throw new Error('Not implemented');
  }
  public async OPENATTR(request: msg.Nfsv4OpenattrRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4OpenattrResponse> {
    ctx.connection.logger.log('OPENATTR', request);
    throw new Error('Not implemented');
  }
  public async OPEN_CONFIRM(
    request: msg.Nfsv4OpenConfirmRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4OpenConfirmResponse> {
    ctx.connection.logger.log('OPEN_CONFIRM', request);
    throw new Error('Not implemented');
  }
  public async OPEN_DOWNGRADE(
    request: msg.Nfsv4OpenDowngradeRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4OpenDowngradeResponse> {
    ctx.connection.logger.log('OPEN_DOWNGRADE', request);
    throw new Error('Not implemented');
  }
  public async PUTFH(request: msg.Nfsv4PutfhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4PutfhResponse> {
    ctx.connection.logger.log('PUTFH', request);
    throw new Error('Not implemented');
  }
  public async PUTPUBFH(request: msg.Nfsv4PutpubfhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4PutpubfhResponse> {
    ctx.connection.logger.log('PUTPUBFH', request);
    throw new Error('Not implemented');
  }
  public async PUTROOTFH(
    request: msg.Nfsv4PutrootfhRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4PutrootfhResponse> {
    ctx.connection.logger.log('PUTROOTFH', request);
    throw new Error('Not implemented');
  }
  public async READ(request: msg.Nfsv4ReadRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4ReadResponse> {
    ctx.connection.logger.log('READ', request);
    throw new Error('Not implemented');
  }
  public async READDIR(request: msg.Nfsv4ReaddirRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4ReaddirResponse> {
    ctx.connection.logger.log('READDIR', request);
    throw new Error('Not implemented');
  }
  public async READLINK(request: msg.Nfsv4ReadlinkRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4ReadlinkResponse> {
    ctx.connection.logger.log('READLINK', request);
    throw new Error('Not implemented');
  }
  public async REMOVE(request: msg.Nfsv4RemoveRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4RemoveResponse> {
    ctx.connection.logger.log('REMOVE', request);
    throw new Error('Not implemented');
  }
  public async RENAME(request: msg.Nfsv4RenameRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4RenameResponse> {
    ctx.connection.logger.log('RENAME', request);
    throw new Error('Not implemented');
  }
  public async RENEW(request: msg.Nfsv4RenewRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4RenewResponse> {
    ctx.connection.logger.log('RENEW', request);
    throw new Error('Not implemented');
  }
  public async RESTOREFH(
    request: msg.Nfsv4RestorefhRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4RestorefhResponse> {
    ctx.connection.logger.log('RESTOREFH', request);
    throw new Error('Not implemented');
  }
  public async SAVEFH(request: msg.Nfsv4SavefhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4SavefhResponse> {
    ctx.connection.logger.log('SAVEFH', request);
    throw new Error('Not implemented');
  }
  public async SECINFO(request: msg.Nfsv4SecinfoRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4SecinfoResponse> {
    ctx.connection.logger.log('SECINFO', request);
    throw new Error('Not implemented');
  }
  public async SETATTR(request: msg.Nfsv4SetattrRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4SetattrResponse> {
    ctx.connection.logger.log('SETATTR', request);
    throw new Error('Not implemented');
  }
  public async SETCLIENTID(
    request: msg.Nfsv4SetclientidRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4SetclientidResponse> {
    ctx.connection.logger.log('SETCLIENTID', request);
    throw new Error('Not implemented');
  }
  public async SETCLIENTID_CONFIRM(
    request: msg.Nfsv4SetclientidConfirmRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4SetclientidConfirmResponse> {
    ctx.connection.logger.log('SETCLIENTID_CONFIRM', request);
    throw new Error('Not implemented');
  }
  public async VERIFY(request: msg.Nfsv4VerifyRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4VerifyResponse> {
    ctx.connection.logger.log('VERIFY', request);
    throw new Error('Not implemented');
  }
  public async WRITE(request: msg.Nfsv4WriteRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4WriteResponse> {
    ctx.connection.logger.log('WRITE', request);
    throw new Error('Not implemented');
  }
  public async RELEASE_LOCKOWNER(
    request: msg.Nfsv4ReleaseLockOwnerRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4ReleaseLockOwnerResponse> {
    ctx.connection.logger.log('RELEASE_LOCKOWNER', request);
    throw new Error('Not implemented');
  }
  public async ILLEGAL(request: msg.Nfsv4IllegalRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4IllegalResponse> {
    ctx.connection.logger.log('ILLEGAL', request);
    throw new Error('Not implemented');
  }
}
