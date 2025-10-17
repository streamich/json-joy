import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {Nfsv3Encoder} from './Nfsv3Encoder';
import {RpcMessageEncoder} from '../../rpc/RpcMessageEncoder';
import {RmRecordEncoder} from '../../rm/RmRecordEncoder';
import {type Nfsv3Proc, Nfsv3Const} from './constants';
import type {RpcOpaqueAuth} from '../../rpc/messages';
import {RpcAcceptStat} from '../../rpc/constants';
import type * as msg from './messages';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/util/lib/buffers';

const MAX_SINGLE_FRAME_SIZE = 0x7fffffff;
const RM_HEADER_SIZE = 4;

export class FullNfsv3Encoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  protected readonly nfsEncoder: Nfsv3Encoder<W>;
  protected readonly rpcEncoder: RpcMessageEncoder<W>;
  protected readonly rmEncoder: RmRecordEncoder<W>;

  constructor(
    public program: number = 100003,
    public readonly writer: W = new Writer() as any,
  ) {
    this.nfsEncoder = new Nfsv3Encoder(writer);
    this.rpcEncoder = new RpcMessageEncoder(writer);
    this.rmEncoder = new RmRecordEncoder(writer);
  }

  public encodeCall(
    xid: number,
    proc: Nfsv3Proc,
    cred: RpcOpaqueAuth,
    verf: RpcOpaqueAuth,
    request: msg.Nfsv3Request,
  ): Uint8Array {
    this.writeCall(xid, proc, cred, verf, request);
    return this.writer.flush();
  }

  public writeCall(
    xid: number,
    proc: Nfsv3Proc,
    cred: RpcOpaqueAuth,
    verf: RpcOpaqueAuth,
    request: msg.Nfsv3Request,
  ): void {
    const writer = this.writer;
    const rmHeaderPosition = writer.x;
    writer.x += RM_HEADER_SIZE;
    this.rpcEncoder.writeCall(xid, Nfsv3Const.PROGRAM, Nfsv3Const.VERSION, proc, cred, verf);
    this.nfsEncoder.writeMessage(request, proc, true);
    this.writeRmHeader(rmHeaderPosition, writer.x);
  }

  public encodeAcceptedReply(
    xid: number,
    proc: Nfsv3Proc,
    verf: RpcOpaqueAuth,
    response: msg.Nfsv3Response,
  ): Uint8Array {
    this.writeAcceptedReply(xid, proc, verf, response);
    return this.writer.flush();
  }

  public writeAcceptedReply(xid: number, proc: Nfsv3Proc, verf: RpcOpaqueAuth, response: msg.Nfsv3Response): void {
    const writer = this.writer;
    const rmHeaderPosition = writer.x;
    writer.x += RM_HEADER_SIZE;
    this.rpcEncoder.writeAcceptedReply(xid, verf, RpcAcceptStat.SUCCESS);
    this.nfsEncoder.writeMessage(response, proc, false);
    this.writeRmHeader(rmHeaderPosition, writer.x);
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

  public writeRejectedReply(
    xid: number,
    rejectStat: number,
    mismatchInfo?: {low: number; high: number},
    authStat?: number,
  ): void {
    const writer = this.writer;
    const rmHeaderPosition = writer.x;
    writer.x += RM_HEADER_SIZE;
    this.rpcEncoder.writeRejectedReply(xid, rejectStat, mismatchInfo, authStat);
    this.writeRmHeader(rmHeaderPosition, writer.x);
  }

  private writeRmHeader(rmHeaderPosition: number, endPosition: number): void {
    const writer = this.writer;
    const rmEncoder = this.rmEncoder;
    const totalSize = endPosition - rmHeaderPosition - RM_HEADER_SIZE;
    if (totalSize <= MAX_SINGLE_FRAME_SIZE) {
      const currentX = writer.x;
      writer.x = rmHeaderPosition;
      rmEncoder.writeHdr(1, totalSize);
      writer.x = currentX;
    } else {
      const currentX = writer.x;
      writer.x = rmHeaderPosition;
      const data = writer.uint8.subarray(rmHeaderPosition + RM_HEADER_SIZE, currentX);
      writer.reset();
      rmEncoder.writeRecord(data);
    }
  }
}
