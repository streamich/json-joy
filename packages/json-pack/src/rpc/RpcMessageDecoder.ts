import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {RpcMsgType, RpcReplyStat, RpcAcceptStat, RpcRejectStat} from './constants';
import {RpcDecodingError} from './errors';
import {
  RpcOpaqueAuth,
  RpcCallMessage,
  RpcAcceptedReplyMessage,
  RpcRejectedReplyMessage,
  type RpcMessage,
  RpcMismatchInfo,
} from './messages';

const EMPTY_BUFFER = new Uint8Array(0);
const EMPTY_READER = new Reader(EMPTY_BUFFER);

export class RpcMessageDecoder {
  public decodeMessage(reader: Reader): RpcMessage | undefined {
    const startPos = reader.x;
    try {
      if (reader.size() < 8) return undefined;
      const xid = reader.u32();
      const msgType = reader.u32();
      if (msgType === RpcMsgType.CALL) {
        if (reader.size() < 20) return (reader.x = startPos), undefined;
        const rpcvers = reader.u32();
        // if (rpcvers !== RPC_VERSION) throw new RpcDecodingError(`Unsupported RPC version: ${rpcvers}`);
        const prog = reader.u32();
        const vers = reader.u32();
        const proc = reader.u32();
        const cred = this.readOpaqueAuth(reader);
        if (!cred) return (reader.x = startPos), undefined;
        const verf = this.readOpaqueAuth(reader);
        if (!verf) return (reader.x = startPos), undefined;
        const params = reader.size() > 0 ? reader.cut(reader.size()) : undefined;
        return new RpcCallMessage(xid, rpcvers, prog, vers, proc, cred, verf, params);
      } else if (msgType === RpcMsgType.REPLY) {
        if (reader.size() < 4) return (reader.x = startPos), undefined;
        const replyStat = reader.u32();
        if (replyStat === RpcReplyStat.MSG_ACCEPTED) {
          const verf = this.readOpaqueAuth(reader);
          if (!verf || reader.size() < 4) return (reader.x = startPos), undefined;
          const acceptStat = reader.u32();
          let mismatchInfo: RpcMismatchInfo | undefined;
          if (acceptStat === RpcAcceptStat.PROG_MISMATCH) {
            if (reader.size() < 8) return (reader.x = startPos), undefined;
            const low = reader.u32();
            const high = reader.u32();
            mismatchInfo = new RpcMismatchInfo(low, high);
          }
          const results = reader.size() > 0 ? reader.cut(reader.size()) : undefined;
          return new RpcAcceptedReplyMessage(xid, verf, acceptStat, mismatchInfo, results);
        } else if (replyStat === RpcReplyStat.MSG_DENIED) {
          if (reader.size() < 4) return (reader.x = startPos), undefined;
          const rejectStat = reader.u32();
          let mismatchInfo: RpcMismatchInfo | undefined;
          let authStat: number | undefined;
          if (rejectStat === RpcRejectStat.RPC_MISMATCH) {
            if (reader.size() < 8) return (reader.x = startPos), undefined;
            const low = reader.u32();
            const high = reader.u32();
            mismatchInfo = new RpcMismatchInfo(low, high);
            if (!mismatchInfo) return (reader.x = startPos), undefined;
          } else if (rejectStat === RpcRejectStat.AUTH_ERROR) {
            if (reader.size() < 4) return (reader.x = startPos), undefined;
            authStat = reader.u32();
          }
          return new RpcRejectedReplyMessage(xid, rejectStat, mismatchInfo, authStat);
        } else {
          throw new RpcDecodingError('Invalid reply_stat');
        }
      } else {
        throw new RpcDecodingError('Invalid msg_type');
      }
    } catch (err) {
      if (err instanceof RangeError) {
        reader.x = startPos;
        return undefined;
      }
      throw err;
    }
  }

  private readOpaqueAuth(reader: Reader): RpcOpaqueAuth | undefined {
    if (reader.size() < 8) return undefined;
    const flavor = reader.u32();
    const length = reader.u32();
    if (length > 400) throw new RpcDecodingError('Auth body too large');
    const paddedLength = (length + 3) & ~3;
    if (reader.size() < paddedLength) return undefined;
    const body = length > 0 ? reader.cut(length) : EMPTY_READER;
    const padding = paddedLength - length;
    if (padding > 0) reader.skip(padding);
    return new RpcOpaqueAuth(flavor, body);
  }
}
