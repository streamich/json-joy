import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {XdrDecoder} from '../../../xdr/XdrDecoder';
import {NlmProc, Nlm4Stat} from './constants';
import {Nfsv3DecodingError} from '../errors';
import * as msg from './messages';
import * as structs from './structs';

export class NlmDecoder {
  protected readonly xdr: XdrDecoder;

  constructor(reader: Reader = new Reader()) {
    this.xdr = new XdrDecoder(reader);
  }

  public decodeMessage(reader: Reader, proc: NlmProc, isRequest: boolean): msg.NlmMessage | undefined {
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

  private decodeRequest(proc: NlmProc): msg.NlmRequest | undefined {
    switch (proc) {
      case NlmProc.NULL:
        return undefined;
      case NlmProc.TEST:
        return this.decodeTestRequest();
      case NlmProc.LOCK:
        return this.decodeLockRequest();
      case NlmProc.CANCEL:
        return this.decodeCancelRequest();
      case NlmProc.UNLOCK:
        return this.decodeUnlockRequest();
      case NlmProc.GRANTED:
        return this.decodeGrantedRequest();
      case NlmProc.SHARE:
        return this.decodeShareRequest();
      case NlmProc.UNSHARE:
        return this.decodeUnshareRequest();
      case NlmProc.NM_LOCK:
        return this.decodeNmLockRequest();
      case NlmProc.FREE_ALL:
        return this.decodeFreeAllRequest();
      default:
        throw new Nfsv3DecodingError(`Unknown NLM procedure: ${proc}`);
    }
  }

  private decodeResponse(proc: NlmProc): msg.NlmResponse | undefined {
    switch (proc) {
      case NlmProc.NULL:
        return undefined;
      case NlmProc.TEST:
        return this.decodeTestResponse();
      case NlmProc.LOCK:
      case NlmProc.CANCEL:
      case NlmProc.UNLOCK:
      case NlmProc.GRANTED:
      case NlmProc.NM_LOCK:
        return this.decodeResponse4();
      case NlmProc.SHARE:
      case NlmProc.UNSHARE:
        return this.decodeShareResponse();
      default:
        throw new Nfsv3DecodingError(`Unknown NLM procedure: ${proc}`);
    }
  }

  private readCookie(): Reader {
    const data = this.xdr.readVarlenOpaque();
    return new Reader(data);
  }

  private readNetobj(): Reader {
    const data = this.xdr.readVarlenOpaque();
    return new Reader(data);
  }

  private readNlm4Holder(): structs.Nlm4Holder {
    const xdr = this.xdr;
    const exclusive = xdr.readBoolean();
    const svid = xdr.readInt();
    const oh = this.readNetobj();
    const offset = xdr.readUnsignedHyper();
    const length = xdr.readUnsignedHyper();
    return new structs.Nlm4Holder(exclusive, svid, oh, offset, length);
  }

  private readNlm4Lock(): structs.Nlm4Lock {
    const xdr = this.xdr;
    const callerName = xdr.readString();
    const fh = this.readNetobj();
    const oh = this.readNetobj();
    const svid = xdr.readInt();
    const offset = xdr.readUnsignedHyper();
    const length = xdr.readUnsignedHyper();
    return new structs.Nlm4Lock(callerName, fh, oh, svid, offset, length);
  }

  private readNlm4Share(): structs.Nlm4Share {
    const xdr = this.xdr;
    const callerName = xdr.readString();
    const fh = this.readNetobj();
    const oh = this.readNetobj();
    const mode = xdr.readUnsignedInt();
    const access = xdr.readUnsignedInt();
    return new structs.Nlm4Share(callerName, fh, oh, mode, access);
  }

  private readTestArgs(): msg.Nlm4TestArgs {
    const cookie = this.readCookie();
    const exclusive = this.xdr.readBoolean();
    const lock = this.readNlm4Lock();
    return new msg.Nlm4TestArgs(cookie, exclusive, lock);
  }

  private readLockArgs(): msg.Nlm4LockArgs {
    const xdr = this.xdr;
    const cookie = this.readCookie();
    const block = xdr.readBoolean();
    const exclusive = xdr.readBoolean();
    const lock = this.readNlm4Lock();
    const reclaim = xdr.readBoolean();
    const state = xdr.readInt();
    return new msg.Nlm4LockArgs(cookie, block, exclusive, lock, reclaim, state);
  }

  private readCancelArgs(): msg.Nlm4CancelArgs {
    const xdr = this.xdr;
    const cookie = this.readCookie();
    const block = xdr.readBoolean();
    const exclusive = xdr.readBoolean();
    const lock = this.readNlm4Lock();
    return new msg.Nlm4CancelArgs(cookie, block, exclusive, lock);
  }

  private readUnlockArgs(): msg.Nlm4UnlockArgs {
    const cookie = this.readCookie();
    const lock = this.readNlm4Lock();
    return new msg.Nlm4UnlockArgs(cookie, lock);
  }

  private readShareArgs(): msg.Nlm4ShareArgs {
    const cookie = this.readCookie();
    const share = this.readNlm4Share();
    const reclaim = this.xdr.readBoolean();
    return new msg.Nlm4ShareArgs(cookie, share, reclaim);
  }

  private decodeTestRequest(): msg.Nlm4TestRequest {
    const args = this.readTestArgs();
    return new msg.Nlm4TestRequest(args);
  }

  private decodeTestResponse(): msg.Nlm4TestResponse {
    const xdr = this.xdr;
    const cookie = this.readCookie();
    const stat = xdr.readUnsignedInt() as Nlm4Stat;
    const holder = stat === Nlm4Stat.NLM4_DENIED ? this.readNlm4Holder() : undefined;
    return new msg.Nlm4TestResponse(cookie, stat, holder);
  }

  private decodeLockRequest(): msg.Nlm4LockRequest {
    const args = this.readLockArgs();
    return new msg.Nlm4LockRequest(args);
  }

  private decodeResponse4(): msg.Nlm4Response {
    const cookie = this.readCookie();
    const stat = this.xdr.readUnsignedInt() as Nlm4Stat;
    return new msg.Nlm4Response(cookie, stat);
  }

  private decodeCancelRequest(): msg.Nlm4CancelRequest {
    const args = this.readCancelArgs();
    return new msg.Nlm4CancelRequest(args);
  }

  private decodeUnlockRequest(): msg.Nlm4UnlockRequest {
    const args = this.readUnlockArgs();
    return new msg.Nlm4UnlockRequest(args);
  }

  private decodeGrantedRequest(): msg.Nlm4GrantedRequest {
    const args = this.readTestArgs();
    return new msg.Nlm4GrantedRequest(args);
  }

  private decodeShareRequest(): msg.Nlm4ShareRequest {
    const args = this.readShareArgs();
    return new msg.Nlm4ShareRequest(args);
  }

  private decodeShareResponse(): msg.Nlm4ShareResponse {
    const xdr = this.xdr;
    const cookie = this.readCookie();
    const stat = xdr.readUnsignedInt() as Nlm4Stat;
    const sequence = xdr.readInt();
    return new msg.Nlm4ShareResponse(cookie, stat, sequence);
  }

  private decodeUnshareRequest(): msg.Nlm4UnshareRequest {
    const args = this.readShareArgs();
    return new msg.Nlm4UnshareRequest(args);
  }

  private decodeNmLockRequest(): msg.Nlm4NmLockRequest {
    const args = this.readLockArgs();
    return new msg.Nlm4NmLockRequest(args);
  }

  private decodeFreeAllRequest(): msg.Nlm4FreeAllRequest {
    const xdr = this.xdr;
    const name = xdr.readString();
    const state = xdr.readInt();
    const notify = new structs.Nlm4Notify(name, state);
    return new msg.Nlm4FreeAllRequest(notify);
  }
}
