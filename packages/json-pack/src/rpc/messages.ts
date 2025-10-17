import type {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import type {RpcAuthFlavor, RpcAcceptStat, RpcRejectStat, RpcAuthStat} from './constants';

export {RpcMsgType, RpcReplyStat, RpcAcceptStat, RpcRejectStat, RpcAuthStat, RpcAuthFlavor} from './constants';

export class RpcOpaqueAuth {
  constructor(
    public readonly flavor: RpcAuthFlavor,
    public readonly body: Reader,
  ) {}
}

export class RpcMismatchInfo {
  constructor(
    public readonly low: number,
    public readonly high: number,
  ) {}
}

export class RpcCallMessage {
  constructor(
    public readonly xid: number,
    public readonly rpcvers: number,
    public readonly prog: number,
    public readonly vers: number,
    public readonly proc: number,
    public readonly cred: RpcOpaqueAuth,
    public readonly verf: RpcOpaqueAuth,
    public params: Reader | undefined = undefined,
  ) {}
}

export class RpcAcceptedReplyMessage {
  constructor(
    public readonly xid: number,
    public readonly verf: RpcOpaqueAuth,
    public readonly stat: RpcAcceptStat,
    public readonly mismatchInfo?: RpcMismatchInfo,
    public results: Reader | undefined = undefined,
  ) {}
}

export class RpcRejectedReplyMessage {
  constructor(
    public readonly xid: number,
    public readonly stat: RpcRejectStat,
    public readonly mismatchInfo?: RpcMismatchInfo,
    public readonly authStat?: RpcAuthStat,
  ) {}
}

export type RpcMessage = RpcCallMessage | RpcAcceptedReplyMessage | RpcRejectedReplyMessage;
