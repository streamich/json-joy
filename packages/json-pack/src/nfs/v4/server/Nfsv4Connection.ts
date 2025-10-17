import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {Nfsv4Decoder} from '../Nfsv4Decoder';
import {Nfsv4FullEncoder} from '../Nfsv4FullEncoder';
import {RmRecordDecoder, type RmRecordEncoder} from '../../../rm';
import {
  RpcAcceptStat,
  RpcAcceptedReplyMessage,
  RpcAuthFlavor,
  RpcCallMessage,
  type RpcMessage,
  RpcMessageDecoder,
  type RpcMessageEncoder,
  RpcOpaqueAuth,
  RpcRejectedReplyMessage,
} from '../../../rpc';
import * as msg from '../messages';
import {EMPTY_READER, Nfsv4Proc, Nfsv4Stat} from '../constants';
import {Nfsv4CompoundProcCtx} from './Nfsv4CompoundProcCtx';
import type {Duplex} from 'node:stream';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers/lib/types';
import type {Nfsv4Operations} from './operations/Nfsv4Operations';

const EMPTY_AUTH = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NONE, EMPTY_READER);

export interface Nfsv4ConnectionOpts {
  /**
   * Normally this is a TCP socket, but any Duplex stream will do.
   */
  duplex: Duplex;
  ops: Nfsv4Operations;
  encoder?: Nfsv4FullEncoder;
  decoder?: Nfsv4Decoder;
  debug?: boolean;
  logger?: Pick<typeof console, 'log' | 'error'>;
}

export class Nfsv4Connection {
  public closed = false;
  public maxIncomingMessage: number = 2 * 1024 * 1024;
  public maxBackpressure: number = 2 * 1024 * 1024;

  /** Last known RPC transaction ID. Used to emit fatal connection errors. */
  protected lastXid = 0;

  public readonly duplex: Duplex;

  protected readonly rmDecoder: RmRecordDecoder;
  protected readonly rpcDecoder: RpcMessageDecoder;
  protected readonly nfsDecoder: Nfsv4Decoder;
  protected readonly writer: IWriter & IWriterGrowable;
  protected readonly rmEncoder: RmRecordEncoder;
  protected readonly rpcEncoder: RpcMessageEncoder;
  protected readonly nfsEncoder: Nfsv4FullEncoder;

  public debug: boolean;
  public logger: Pick<typeof console, 'log' | 'error'>;

  public readonly ops: Nfsv4Operations;

  constructor(opts: Nfsv4ConnectionOpts) {
    this.debug = !!opts.debug;
    this.logger = opts.logger || console;
    const duplex = (this.duplex = opts.duplex);
    this.ops = opts.ops;
    this.rmDecoder = new RmRecordDecoder();
    this.rpcDecoder = new RpcMessageDecoder();
    this.nfsDecoder = new Nfsv4Decoder();
    const nfsEncoder = (this.nfsEncoder = new Nfsv4FullEncoder());
    this.writer = nfsEncoder.writer;
    this.rmEncoder = nfsEncoder.rmEncoder;
    this.rpcEncoder = nfsEncoder.rpcEncoder;
    duplex.on('data', this.onData.bind(this));
    duplex.on('timeout', () => this.close());
    duplex.on('close', (hadError: boolean): void => {
      this.close();
    });
    duplex.on('error', (err: Error) => {
      this.logger.error('SOCKET ERROR:', err);
      this.close();
    });
  }

  protected onData(data: Uint8Array): void {
    const {rmDecoder, rpcDecoder} = this;
    rmDecoder.push(data);
    let record = rmDecoder.readRecord();
    while (record) {
      if (record.size()) {
        const rpcMessage = rpcDecoder.decodeMessage(record);
        if (rpcMessage) this.onRpcMessage(rpcMessage);
        else {
          this.close();
          return;
        }
      }
      record = rmDecoder.readRecord();
    }
  }

  protected onRpcMessage(msg: RpcMessage): void {
    if (msg instanceof RpcCallMessage) {
      this.lastXid = msg.xid;
      this.onRpcCallMessage(msg);
    } else if (msg instanceof RpcAcceptedReplyMessage) {
      throw new Error('Not implemented RpcAcceptedReplyMessage');
    } else if (msg instanceof RpcRejectedReplyMessage) {
      throw new Error('Not implemented RpcRejectedReplyMessage');
    }
  }

  protected onRpcCallMessage(procedure: RpcCallMessage): void {
    const {debug, logger, writer, rmEncoder} = this;
    const {xid, proc} = procedure;
    switch (proc) {
      case Nfsv4Proc.COMPOUND: {
        if (debug) logger.log(`\n<COMPOUND{${xid}}>`);
        if (!(procedure.params instanceof Reader)) return;
        const compound = this.nfsDecoder.decodeCompoundRequest(procedure.params);
        if (compound instanceof msg.Nfsv4CompoundRequest) {
          new Nfsv4CompoundProcCtx(this, compound)
            .exec()
            .then((procResponse) => {
              if (debug) logger.log(`</COMPOUND{${xid}}>`);
              this.nfsEncoder.writeAcceptedCompoundReply(xid, EMPTY_AUTH, procResponse);
              this.write(writer.flush());
            })
            .catch((err) => {
              logger.error('NFS COMPOUND error:', xid, err);
              this.nfsEncoder.writeRejectedReply(xid, Nfsv4Stat.NFS4ERR_SERVERFAULT);
            });
        } else this.closeWithError(RpcAcceptStat.GARBAGE_ARGS);
        break;
      }
      case Nfsv4Proc.NULL: {
        if (debug) logger.log('NULL', procedure);
        const state = rmEncoder.startRecord();
        this.rpcEncoder.writeAcceptedReply(xid, EMPTY_AUTH, RpcAcceptStat.SUCCESS);
        rmEncoder.endRecord(state);
        this.write(writer.flush());
        break;
      }
      default: {
        if (debug) logger.error(`Unknown procedure: ${proc}`);
      }
    }
  }

  private closeWithError(
    error:
      | RpcAcceptStat.PROG_UNAVAIL
      | RpcAcceptStat.PROC_UNAVAIL
      | RpcAcceptStat.GARBAGE_ARGS
      | RpcAcceptStat.SYSTEM_ERR,
  ): void {
    if (this.debug) this.logger.log(`Closing with error: RpcAcceptStat = ${error}, xid = ${this.lastXid}`);
    const xid = this.lastXid;
    if (xid) {
      const state = this.rmEncoder.startRecord();
      const verify = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NONE, EMPTY_READER);
      this.rpcEncoder.writeAcceptedReply(xid, verify, error);
      this.rmEncoder.endRecord(state);
      const bin = this.writer.flush();
      this.duplex.write(bin);
    }
    this.close();
  }

  public close(): void {
    if (this.closed) return;
    this.closed = true;
    clearImmediate(this.__uncorkTimer);
    this.__uncorkTimer = null;
    const duplex = this.duplex;
    duplex.removeAllListeners();
    if (!duplex.destroyed) duplex.destroy();
  }

  // ---------------------------------------------------------- Write to socket

  private __uncorkTimer: any = null;

  public write(buf: Uint8Array): void {
    if (this.closed) return;
    const duplex = this.duplex;
    if (duplex.writableLength > this.maxBackpressure) {
      this.closeWithError(RpcAcceptStat.SYSTEM_ERR);
      return;
    }
    const __uncorkTimer = this.__uncorkTimer;
    if (!__uncorkTimer) duplex.cork();
    duplex.write(buf);
    if (!__uncorkTimer)
      this.__uncorkTimer = setImmediate(() => {
        this.__uncorkTimer = null;
        duplex.uncork();
      });
  }

  // TODO: Execute NFS Callback...
  public send(): void {}
}
