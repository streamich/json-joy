import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {RpcMsgType, RpcReplyStat, RPC_VERSION} from './constants';
import {RpcEncodingError} from './errors';
import {
  type RpcOpaqueAuth,
  RpcCallMessage,
  RpcAcceptedReplyMessage,
  RpcRejectedReplyMessage,
  type RpcMessage,
} from './messages';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/util/lib/buffers';

export class RpcMessageEncoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  constructor(public readonly writer: W = new Writer() as any) {}

  public encodeCall(
    xid: number,
    prog: number,
    vers: number,
    proc: number,
    cred: RpcOpaqueAuth,
    verf: RpcOpaqueAuth,
    params?: Reader | Uint8Array,
  ): Uint8Array {
    this.writeCall(xid, prog, vers, proc, cred, verf, params);
    return this.writer.flush();
  }

  public encodeAcceptedReply(
    xid: number,
    verf: RpcOpaqueAuth,
    acceptStat: number,
    mismatchInfo?: {low: number; high: number},
    results?: Reader | Uint8Array,
  ): Uint8Array {
    this.writeAcceptedReply(xid, verf, acceptStat, mismatchInfo, results);
    return this.writer.flush();
  }

  public encodeRejectedReply(
    xid: number,
    rejectStat: number,
    mismatchInfo?: {low: number; high: number},
    authStat?: number,
  ): Uint8Array {
    this.writeRejectedReply(xid, rejectStat, mismatchInfo, authStat);
    return this.writer.flush();
  }

  public encodeMessage(msg: RpcMessage): Uint8Array {
    this.writeMessage(msg);
    return this.writer.flush();
  }

  public writeMessage(msg: RpcMessage): void {
    if (msg instanceof RpcCallMessage) {
      this.writeCall(msg.xid, msg.prog, msg.vers, msg.proc, msg.cred, msg.verf, msg.params);
    } else if (msg instanceof RpcAcceptedReplyMessage) {
      this.writeAcceptedReply(msg.xid, msg.verf, msg.stat, msg.mismatchInfo, msg.results);
    } else if (msg instanceof RpcRejectedReplyMessage) {
      this.writeRejectedReply(msg.xid, msg.stat, msg.mismatchInfo, msg.authStat);
    }
  }

  public writeCall(
    xid: number,
    prog: number,
    vers: number,
    proc: number,
    cred: RpcOpaqueAuth,
    verf: RpcOpaqueAuth,
    params?: Reader | Uint8Array,
  ): void {
    const writer = this.writer;
    writer.ensureCapacity(16 * 4);
    const view = writer.view;
    let x = writer.x;
    view.setUint32(x, xid, false);
    x += 4;
    view.setUint32(x, RpcMsgType.CALL, false);
    x += 4;
    view.setUint32(x, RPC_VERSION, false);
    x += 4;
    view.setUint32(x, prog, false);
    x += 4;
    view.setUint32(x, vers, false);
    x += 4;
    view.setUint32(x, proc, false);
    x += 4;
    writer.x = x;
    this.writeOpaqueAuth(cred);
    this.writeOpaqueAuth(verf);
    if (params instanceof Uint8Array) {
      if (params.length > 0) writer.buf(params, params.length);
    } else if (params instanceof Reader) {
      const size = params.size();
      if (size > 0) writer.buf(params.subarray(0, size), size);
    }
  }

  public writeAcceptedReply(
    xid: number,
    verf: RpcOpaqueAuth,
    acceptStat: number,
    mismatchInfo?: {low: number; high: number},
    results?: Reader | Uint8Array,
  ): void {
    const writer = this.writer;
    writer.ensureCapacity(16 * 4);
    const view = writer.view;
    let x = writer.x;
    view.setUint32(x, xid, false);
    x += 4;
    view.setUint32(x, RpcMsgType.REPLY, false);
    x += 4;
    view.setUint32(x, RpcReplyStat.MSG_ACCEPTED, false);
    x += 4;
    writer.x = x;
    this.writeOpaqueAuth(verf);
    writer.u32(acceptStat);
    if (mismatchInfo) {
      writer.u32(mismatchInfo.low);
      writer.u32(mismatchInfo.high);
    }
    if (results) {
      if (results instanceof Uint8Array) {
        if (results.length > 0) writer.buf(results, results.length);
      } else {
        const size = results.size();
        if (size > 0) writer.buf(results.uint8, size);
      }
    }
  }

  public writeRejectedReply(
    xid: number,
    rejectStat: number,
    mismatchInfo?: {low: number; high: number},
    authStat?: number,
  ): void {
    const writer = this.writer;
    writer.ensureCapacity(7 * 4);
    const view = writer.view;
    let x = writer.x;
    view.setUint32(x, xid, false);
    x += 4;
    view.setUint32(x, RpcMsgType.REPLY, false);
    x += 4;
    view.setUint32(x, RpcReplyStat.MSG_DENIED, false);
    x += 4;
    view.setUint32(x, rejectStat, false);
    x += 4;
    if (mismatchInfo) {
      view.setUint32(x, mismatchInfo.low, false);
      x += 4;
      view.setUint32(x, mismatchInfo.high, false);
      x += 4;
    }
    if (authStat !== undefined) {
      view.setUint32(x, authStat, false);
      x += 4;
    }
    writer.x = x;
  }

  private writeOpaqueAuth(auth: RpcOpaqueAuth): void {
    const writer = this.writer;
    const body = auth.body;
    const length = body.size();
    if (length > 400) throw new RpcEncodingError('Auth body too large');
    writer.ensureCapacity(2 * 4 + length + 3);
    const view = writer.view;
    let x = writer.x;
    view.setUint32(x, auth.flavor, false);
    x += 4;
    view.setUint32(x, length, false);
    x += 4;
    if (length > 0) {
      writer.x = x;
      writer.buf(body.subarray(0, length), length);
      x = writer.x;
      const padding = (4 - (length % 4)) % 4;
      for (let i = 0; i < padding; i++) {
        view.setUint8(x, 0);
        x += 1;
      }
    }
    writer.x = x;
  }
}
