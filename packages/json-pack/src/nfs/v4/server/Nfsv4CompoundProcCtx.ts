import {Nfsv4Stat} from '../constants';
import type {Nfsv4OperationFn} from './operations/Nfsv4Operations';
import type {Nfsv4Connection} from './Nfsv4Connection';
import * as msg from '../messages';
import {formatNfsv4Request, formatNfsv4Response} from '../format';

/**
 * NFS v4 COMPOUND Procedure Context, holds state for a single COMPOUND procedure
 * call. This state is injected into each operation handler called as part of
 * the COMPOUND procedure.
 */
export class Nfsv4CompoundProcCtx {
  /** Current file handle */
  cfh: Uint8Array | null = null;
  /** Saved file handle */
  sfh: Uint8Array | null = null;

  constructor(
    public readonly connection: Nfsv4Connection,
    public readonly req: msg.Nfsv4CompoundRequest,
  ) {}

  /**
   * Returns the principal associated with the current RPC call. For now,
   * this is a stub returning "none" since we don't have real authentication.
   * In a real implementation, this would extract the principal from the RPC
   * credentials in the connection's current RPC call context.
   *
   * - AUTH_NONE -> `none`
   * - AUTH_SYS -> `sys:machinename:uid`
   * - GSS -> `gss:client@REALM`
   *
   * @returns The principal associated with the current RPC call.
   */
  public getPrincipal(): string {
    return 'none';
  }

  public async exec(): Promise<msg.Nfsv4CompoundResponse> {
    const {req, connection} = this;
    const {ops, debug, logger} = connection;
    const {argarray, tag} = req;
    const length = argarray.length;
    let status: Nfsv4Stat = Nfsv4Stat.NFS4_OK;
    const resarray: msg.Nfsv4Response[] = [];
    OPS_LOOP: for (let i = 0; i < length; i++) {
      const op = argarray[i];
      const opReq: msg.Nfsv4Request = op;
      type Res = msg.Nfsv4Response;
      let fn: Nfsv4OperationFn<any, any> | undefined = void 0;
      let Response: (new (status: Nfsv4Stat) => Res) | undefined = void 0;
      if (op instanceof msg.Nfsv4AccessRequest) (fn = ops.ACCESS), (Response = msg.Nfsv4AccessResponse);
      else if (op instanceof msg.Nfsv4PutrootfhRequest) (fn = ops.PUTROOTFH), (Response = msg.Nfsv4PutrootfhResponse);
      else if (op instanceof msg.Nfsv4PutpubfhRequest) (fn = ops.PUTPUBFH), (Response = msg.Nfsv4PutpubfhResponse);
      else if (op instanceof msg.Nfsv4PutfhRequest) (fn = ops.PUTFH), (Response = msg.Nfsv4PutfhResponse);
      else if (op instanceof msg.Nfsv4GetfhRequest) (fn = ops.GETFH), (Response = msg.Nfsv4GetfhResponse);
      else if (op instanceof msg.Nfsv4SavefhRequest) (fn = ops.SAVEFH), (Response = msg.Nfsv4SavefhResponse);
      else if (op instanceof msg.Nfsv4ReadRequest) (fn = ops.READ), (Response = msg.Nfsv4ReadResponse);
      else if (op instanceof msg.Nfsv4ReaddirRequest) (fn = ops.READDIR), (Response = msg.Nfsv4ReaddirResponse);
      else if (op instanceof msg.Nfsv4ReadlinkRequest) (fn = ops.READLINK), (Response = msg.Nfsv4ReadlinkResponse);
      else if (op instanceof msg.Nfsv4WriteRequest) (fn = ops.WRITE), (Response = msg.Nfsv4WriteResponse);
      else if (op instanceof msg.Nfsv4OpenRequest) (fn = ops.OPEN), (Response = msg.Nfsv4OpenResponse);
      else if (op instanceof msg.Nfsv4CloseRequest) (fn = ops.CLOSE), (Response = msg.Nfsv4CloseResponse);
      else if (op instanceof msg.Nfsv4RemoveRequest) (fn = ops.REMOVE), (Response = msg.Nfsv4RemoveResponse);
      else if (op instanceof msg.Nfsv4RenameRequest) (fn = ops.RENAME), (Response = msg.Nfsv4RenameResponse);
      else if (op instanceof msg.Nfsv4OpenattrRequest) (fn = ops.OPENATTR), (Response = msg.Nfsv4OpenattrResponse);
      else if (op instanceof msg.Nfsv4GetattrRequest) (fn = ops.GETATTR), (Response = msg.Nfsv4GetattrResponse);
      else if (op instanceof msg.Nfsv4SetattrRequest) (fn = ops.SETATTR), (Response = msg.Nfsv4SetattrResponse);
      else if (op instanceof msg.Nfsv4CreateRequest) (fn = ops.CREATE), (Response = msg.Nfsv4CreateResponse);
      else if (op instanceof msg.Nfsv4SetclientidRequest)
        (fn = ops.SETCLIENTID), (Response = msg.Nfsv4SetclientidResponse);
      else if (op instanceof msg.Nfsv4SetclientidConfirmRequest)
        (fn = ops.SETCLIENTID_CONFIRM), (Response = msg.Nfsv4SetclientidConfirmResponse);
      else if (op instanceof msg.Nfsv4OpenConfirmRequest)
        (fn = ops.OPEN_CONFIRM), (Response = msg.Nfsv4OpenConfirmResponse);
      else if (op instanceof msg.Nfsv4OpenDowngradeRequest)
        (fn = ops.OPEN_DOWNGRADE), (Response = msg.Nfsv4OpenDowngradeResponse);
      else if (op instanceof msg.Nfsv4CommitRequest) (fn = ops.COMMIT), (Response = msg.Nfsv4CommitResponse);
      else if (op instanceof msg.Nfsv4LinkRequest) (fn = ops.LINK), (Response = msg.Nfsv4LinkResponse);
      else if (op instanceof msg.Nfsv4RenewRequest) (fn = ops.RENEW), (Response = msg.Nfsv4RenewResponse);
      else if (op instanceof msg.Nfsv4DelegpurgeRequest)
        (fn = ops.DELEGPURGE), (Response = msg.Nfsv4DelegpurgeResponse);
      else if (op instanceof msg.Nfsv4DelegreturnRequest)
        (fn = ops.DELEGRETURN), (Response = msg.Nfsv4DelegreturnResponse);
      else if (op instanceof msg.Nfsv4RestorefhRequest) (fn = ops.RESTOREFH), (Response = msg.Nfsv4RestorefhResponse);
      else if (op instanceof msg.Nfsv4SecinfoRequest) (fn = ops.SECINFO), (Response = msg.Nfsv4SecinfoResponse);
      else if (op instanceof msg.Nfsv4VerifyRequest) (fn = ops.VERIFY), (Response = msg.Nfsv4VerifyResponse);
      else if (op instanceof msg.Nfsv4LockRequest) (fn = ops.LOCK), (Response = msg.Nfsv4LockResponse);
      else if (op instanceof msg.Nfsv4LocktRequest) (fn = ops.LOCKT), (Response = msg.Nfsv4LocktResponse);
      else if (op instanceof msg.Nfsv4LockuRequest) (fn = ops.LOCKU), (Response = msg.Nfsv4LockuResponse);
      else if (op instanceof msg.Nfsv4LookupRequest) (fn = ops.LOOKUP), (Response = msg.Nfsv4LookupResponse);
      else if (op instanceof msg.Nfsv4LookuppRequest) (fn = ops.LOOKUPP), (Response = msg.Nfsv4LookuppResponse);
      else if (op instanceof msg.Nfsv4NverifyRequest) (fn = ops.NVERIFY), (Response = msg.Nfsv4NverifyResponse);
      else if (op instanceof msg.Nfsv4ReleaseLockOwnerRequest)
        (fn = ops.RELEASE_LOCKOWNER), (Response = msg.Nfsv4ReleaseLockOwnerResponse);
      else if (op instanceof msg.Nfsv4IllegalRequest) (fn = ops.ILLEGAL), (Response = msg.Nfsv4IllegalResponse);
      if (!fn || !Response) return new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4ERR_OP_ILLEGAL, tag, resarray);
      EXEC_OP: try {
        // if (debug) logger.log(fn.name, opReq);
        if (debug) logger.log(formatNfsv4Request(opReq));
        const opResponse = await fn.call(ops, opReq, this);
        if (!(opResponse instanceof Response)) throw new Error('Unexpected response, fn = ' + fn.name);
        // if (debug) logger.log(fn.name, opResponse);
        if (debug) logger.log(': ' + formatNfsv4Response(opResponse));
        status = opResponse.status;
        resarray.push(opResponse);
      } catch (err) {
        if (debug) logger.error(': ERROR', fn.name, err);
        if (err instanceof Response) {
          if (err.status !== Nfsv4Stat.NFS4_OK) {
            status = err.status;
            resarray.push(err);
            break EXEC_OP;
          } else {
            logger.error('Operation [' + fn.name + '] threw response with NFS4_OK');
            err = Nfsv4Stat.NFS4ERR_SERVERFAULT;
          }
        }
        FIND_STATUS_CODE: {
          if (typeof err === 'number') {
            if (err > Nfsv4Stat.NFS4_OK && err <= 0x00_ff_ff_ff) {
              status = err;
              break FIND_STATUS_CODE;
            }
            status = Nfsv4Stat.NFS4ERR_SERVERFAULT;
            logger.error('Invalid status [code = ' + err + ', fn = ' + fn.name + ']');
            break FIND_STATUS_CODE;
          }
          status = Nfsv4Stat.NFS4ERR_SERVERFAULT;
          logger.error(fn.name, err);
        }
        const opResponse = new Response(status);
        resarray.push(opResponse);
      }
      if (status !== Nfsv4Stat.NFS4_OK) break OPS_LOOP;
    }
    return new msg.Nfsv4CompoundResponse(status, tag, resarray);
  }
}
