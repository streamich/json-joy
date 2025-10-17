import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {XdrEncoder} from '../../../xdr/XdrEncoder';
import {NlmProc} from './constants';
import {Nfsv3EncodingError} from '../errors';
import type * as msg from './messages';
import type * as structs from './structs';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/util/lib/buffers';

export class NlmEncoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  protected readonly xdr: XdrEncoder;

  constructor(public readonly writer: W = new Writer() as any) {
    this.xdr = new XdrEncoder(writer);
  }

  public encodeMessage(message: msg.NlmMessage, proc: NlmProc, isRequest: boolean): Uint8Array {
    if (isRequest) this.writeRequest(message as msg.NlmRequest, proc);
    else this.writeResponse(message as msg.NlmResponse, proc);
    return this.writer.flush();
  }

  public writeMessage(message: msg.NlmMessage, proc: NlmProc, isRequest: boolean): void {
    if (isRequest) this.writeRequest(message as msg.NlmRequest, proc);
    else this.writeResponse(message as msg.NlmResponse, proc);
  }

  private writeRequest(request: msg.NlmRequest, proc: NlmProc): void {
    switch (proc) {
      case NlmProc.NULL:
        return;
      case NlmProc.TEST:
        return this.writeTestRequest(request as msg.Nlm4TestRequest);
      case NlmProc.LOCK:
        return this.writeLockRequest(request as msg.Nlm4LockRequest);
      case NlmProc.CANCEL:
        return this.writeCancelRequest(request as msg.Nlm4CancelRequest);
      case NlmProc.UNLOCK:
        return this.writeUnlockRequest(request as msg.Nlm4UnlockRequest);
      case NlmProc.GRANTED:
        return this.writeGrantedRequest(request as msg.Nlm4GrantedRequest);
      case NlmProc.SHARE:
        return this.writeShareRequest(request as msg.Nlm4ShareRequest);
      case NlmProc.UNSHARE:
        return this.writeUnshareRequest(request as msg.Nlm4UnshareRequest);
      case NlmProc.NM_LOCK:
        return this.writeNmLockRequest(request as msg.Nlm4NmLockRequest);
      case NlmProc.FREE_ALL:
        return this.writeFreeAllRequest(request as msg.Nlm4FreeAllRequest);
      default:
        throw new Nfsv3EncodingError(`Unknown NLM procedure: ${proc}`);
    }
  }

  private writeResponse(response: msg.NlmResponse, proc: NlmProc): void {
    switch (proc) {
      case NlmProc.NULL:
        return;
      case NlmProc.TEST:
        return this.writeTestResponse(response as msg.Nlm4TestResponse);
      case NlmProc.LOCK:
      case NlmProc.CANCEL:
      case NlmProc.UNLOCK:
      case NlmProc.GRANTED:
      case NlmProc.NM_LOCK:
        return this.writeResponse4(response as msg.Nlm4Response);
      case NlmProc.SHARE:
      case NlmProc.UNSHARE:
        return this.writeShareResponse(response as msg.Nlm4ShareResponse);
      default:
        throw new Nfsv3EncodingError(`Unknown NLM procedure: ${proc}`);
    }
  }

  private writeCookie(cookie: any): void {
    const data = cookie.uint8;
    this.xdr.writeVarlenOpaque(data);
  }

  private writeNetobj(obj: any): void {
    const data = obj.uint8;
    this.xdr.writeVarlenOpaque(data);
  }

  private writeNlm4Holder(holder: structs.Nlm4Holder): void {
    const xdr = this.xdr;
    xdr.writeBoolean(holder.exclusive);
    xdr.writeInt(holder.svid);
    this.writeNetobj(holder.oh);
    xdr.writeUnsignedHyper(holder.offset);
    xdr.writeUnsignedHyper(holder.length);
  }

  private writeNlm4Lock(lock: structs.Nlm4Lock): void {
    const xdr = this.xdr;
    xdr.writeStr(lock.callerName);
    this.writeNetobj(lock.fh);
    this.writeNetobj(lock.oh);
    xdr.writeInt(lock.svid);
    xdr.writeUnsignedHyper(lock.offset);
    xdr.writeUnsignedHyper(lock.length);
  }

  private writeNlm4Share(share: structs.Nlm4Share): void {
    const xdr = this.xdr;
    xdr.writeStr(share.callerName);
    this.writeNetobj(share.fh);
    this.writeNetobj(share.oh);
    xdr.writeUnsignedInt(share.mode);
    xdr.writeUnsignedInt(share.access);
  }

  private writeTestArgs(args: msg.Nlm4TestArgs): void {
    this.writeCookie(args.cookie);
    this.xdr.writeBoolean(args.exclusive);
    this.writeNlm4Lock(args.lock);
  }

  private writeLockArgs(args: msg.Nlm4LockArgs): void {
    const xdr = this.xdr;
    this.writeCookie(args.cookie);
    xdr.writeBoolean(args.block);
    xdr.writeBoolean(args.exclusive);
    this.writeNlm4Lock(args.lock);
    xdr.writeBoolean(args.reclaim);
    xdr.writeInt(args.state);
  }

  private writeCancelArgs(args: msg.Nlm4CancelArgs): void {
    const xdr = this.xdr;
    this.writeCookie(args.cookie);
    xdr.writeBoolean(args.block);
    xdr.writeBoolean(args.exclusive);
    this.writeNlm4Lock(args.lock);
  }

  private writeUnlockArgs(args: msg.Nlm4UnlockArgs): void {
    this.writeCookie(args.cookie);
    this.writeNlm4Lock(args.lock);
  }

  private writeShareArgs(args: msg.Nlm4ShareArgs): void {
    this.writeCookie(args.cookie);
    this.writeNlm4Share(args.share);
    this.xdr.writeBoolean(args.reclaim);
  }

  private writeTestRequest(req: msg.Nlm4TestRequest): void {
    this.writeTestArgs(req.args);
  }

  private writeTestResponse(res: msg.Nlm4TestResponse): void {
    const xdr = this.xdr;
    this.writeCookie(res.cookie);
    xdr.writeUnsignedInt(res.stat);
    if (res.stat === 1 && res.holder) {
      this.writeNlm4Holder(res.holder);
    }
  }

  private writeLockRequest(req: msg.Nlm4LockRequest): void {
    this.writeLockArgs(req.args);
  }

  private writeResponse4(res: msg.Nlm4Response): void {
    this.writeCookie(res.cookie);
    this.xdr.writeUnsignedInt(res.stat);
  }

  private writeCancelRequest(req: msg.Nlm4CancelRequest): void {
    this.writeCancelArgs(req.args);
  }

  private writeUnlockRequest(req: msg.Nlm4UnlockRequest): void {
    this.writeUnlockArgs(req.args);
  }

  private writeGrantedRequest(req: msg.Nlm4GrantedRequest): void {
    this.writeTestArgs(req.args);
  }

  private writeShareRequest(req: msg.Nlm4ShareRequest): void {
    this.writeShareArgs(req.args);
  }

  private writeShareResponse(res: msg.Nlm4ShareResponse): void {
    const xdr = this.xdr;
    this.writeCookie(res.cookie);
    xdr.writeUnsignedInt(res.stat);
    xdr.writeInt(res.sequence);
  }

  private writeUnshareRequest(req: msg.Nlm4UnshareRequest): void {
    this.writeShareArgs(req.args);
  }

  private writeNmLockRequest(req: msg.Nlm4NmLockRequest): void {
    this.writeLockArgs(req.args);
  }

  private writeFreeAllRequest(req: msg.Nlm4FreeAllRequest): void {
    const xdr = this.xdr;
    xdr.writeStr(req.notify.name);
    xdr.writeInt(req.notify.state);
  }
}
