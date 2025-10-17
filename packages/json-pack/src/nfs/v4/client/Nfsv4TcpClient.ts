import * as net from 'node:net';
import type * as stream from 'node:stream';
import {Nfsv4Decoder} from '../Nfsv4Decoder';
import {Nfsv4FullEncoder} from '../Nfsv4FullEncoder';
import {RmRecordDecoder} from '../../../rm';
import {
  RpcAcceptedReplyMessage,
  type RpcMessage,
  RpcMessageDecoder,
  RpcOpaqueAuth,
  RpcRejectedReplyMessage,
} from '../../../rpc';
import {EMPTY_READER, Nfsv4Proc, Nfsv4Const} from '../constants';
import {Nfsv4CompoundRequest, type Nfsv4CompoundResponse, type Nfsv4Request} from '../messages';
import type {Nfsv4Client} from './types';

export interface Nfsv4TcpClientOpts {
  host?: string;
  port?: number;
  timeout?: number;
  debug?: boolean;
  logger?: Pick<typeof console, 'log' | 'error'>;
}

interface PendingRequest {
  resolve: (response: Nfsv4CompoundResponse) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
}

export class Nfsv4TcpClient implements Nfsv4Client {
  public static fromDuplex(duplex: stream.Duplex, opts: Nfsv4TcpClientOpts = {}): Nfsv4TcpClient {
    const client = new Nfsv4TcpClient(opts);
    client.setSocket(duplex);
    return client;
  }

  public readonly host: string;
  public readonly port: number;
  public readonly timeout: number;
  public debug: boolean;
  public logger: Pick<typeof console, 'log' | 'error'>;

  private socket: stream.Duplex | null = null;
  private connected = false;
  private connecting = false;
  private xid = 0;
  private pendingRequests = new Map<number, PendingRequest>();
  private readonly nfsDecoder: Nfsv4Decoder;
  private readonly nfsEncoder: Nfsv4FullEncoder;

  constructor(opts: Nfsv4TcpClientOpts = {}) {
    this.host = opts.host || '127.0.0.1';
    this.port = opts.port || 2049;
    this.timeout = opts.timeout || 30000;
    this.debug = !!opts.debug;
    this.logger = opts.logger || console;
    this.rmDecoder = new RmRecordDecoder();
    this.rpcDecoder = new RpcMessageDecoder();
    this.nfsDecoder = new Nfsv4Decoder();
    this.nfsEncoder = new Nfsv4FullEncoder();
  }

  private nextXid(): number {
    this.xid = (this.xid + 1) >>> 0;
    if (this.xid === 0) this.xid = 1;
    return this.xid;
  }

  public async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connecting) throw new Error('Connection already in progress');
    return new Promise((resolve, reject) => {
      this.connecting = true;
      const onError = (err: Error) => {
        this.connecting = false;
        this.connected = false;
        if (this.debug) this.logger.error('Socket error:', err);
        reject(err);
      };
      const socket = net.connect({host: this.host, port: this.port}, () => {
        if (this.debug) this.logger.log(`Connected to NFSv4 server at ${this.host}:${this.port}`);
        socket.removeListener('error', onError);
        resolve();
        this.setSocket(socket);
      });
      socket.once('error', onError);
    });
  }

  protected setSocket(socket: stream.Duplex): void {
    socket.on('data', this.onData.bind(this));
    socket.on('close', this.onClose.bind(this));
    socket.on('error', (err: Error) => {
      this.connecting = false;
      this.connected = false;
      if (this.debug) this.logger.error('Socket error:', err);
    });
    this.connected = true;
    this.connecting = false;
    this.socket = socket;
  }

  private onData(data: Uint8Array): void {
    const {rmDecoder, rpcDecoder} = this;
    rmDecoder.push(data);
    let record = rmDecoder.readRecord();
    while (record) {
      if (record.size()) {
        const rpcMessage = rpcDecoder.decodeMessage(record);
        if (rpcMessage) this.onRpcMessage(rpcMessage);
        else if (this.debug) this.logger.error('Failed to decode RPC message');
      }
      record = rmDecoder.readRecord();
    }
  }

  private onRpcMessage(msg: RpcMessage): void {
    if (msg instanceof RpcAcceptedReplyMessage) {
      const pending = this.pendingRequests.get(msg.xid);
      if (!pending) {
        if (this.debug) this.logger.error(`No pending request for XID ${msg.xid}`);
        return;
      }
      this.pendingRequests.delete(msg.xid);
      if (pending.timeout) clearTimeout(pending.timeout);
      if (msg.stat !== 0) {
        pending.reject(new Error(`RPC accepted reply error: stat=${msg.stat}`));
        return;
      }
      if (!msg.results) {
        // NULL procedure has no results, check if resolve expects no arguments
        if (pending.resolve.length === 0) {
          (pending.resolve as any)();
          return;
        }
        pending.reject(new Error('No results in accepted reply'));
        return;
      }
      const response = this.nfsDecoder.decodeCompoundResponse(msg.results);
      if (!response) {
        pending.reject(new Error('Failed to decode COMPOUND response'));
        return;
      }
      pending.resolve(response);
    } else if (msg instanceof RpcRejectedReplyMessage) {
      const pending = this.pendingRequests.get(msg.xid);
      if (!pending) {
        if (this.debug) this.logger.error(`No pending request for XID ${msg.xid}`);
        return;
      }
      this.pendingRequests.delete(msg.xid);
      if (pending.timeout) clearTimeout(pending.timeout);
      pending.reject(new Error(`RPC rejected reply: stat=${msg.stat}`));
    } else {
      if (this.debug) this.logger.error('Unexpected RPC message type:', msg);
    }
  }

  private onClose(): void {
    this.connected = false;
    this.connecting = false;
    if (this.debug) this.logger.log('Connection closed');
    const error = new Error('Connection closed');
    this.pendingRequests.forEach((pending, xid) => {
      if (pending.timeout) clearTimeout(pending.timeout);
      pending.reject(error);
    });
    this.pendingRequests.clear();
  }

  public async compound(request: Nfsv4CompoundRequest): Promise<Nfsv4CompoundResponse>;
  public async compound(
    operations: Nfsv4Request[],
    tag?: string,
    minorversion?: number,
  ): Promise<Nfsv4CompoundResponse>;
  public async compound(
    requestOrOps: Nfsv4CompoundRequest | Nfsv4Request[],
    tag: string = '',
    minorversion: number = 0,
  ): Promise<Nfsv4CompoundResponse> {
    if (!this.connected) throw new Error('Not connected');
    const request =
      requestOrOps instanceof Nfsv4CompoundRequest
        ? requestOrOps
        : new Nfsv4CompoundRequest(tag, minorversion, requestOrOps);
    const xid = this.nextXid();
    const cred = new RpcOpaqueAuth(0, EMPTY_READER);
    const verf = new RpcOpaqueAuth(0, EMPTY_READER);
    const encoded = this.nfsEncoder.encodeCall(xid, Nfsv4Proc.COMPOUND, cred, verf, request);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(xid);
        reject(new Error(`Request timeout (XID ${xid})`));
      }, this.timeout);
      this.pendingRequests.set(xid, {resolve, reject, timeout});
      this.socket!.write(encoded);
      if (this.debug) {
        this.logger.log(`Sent COMPOUND request (XID ${xid}): ${request.argarray.length} operations`);
      }
    });
  }

  public async null(): Promise<void> {
    if (!this.connected) throw new Error('Not connected');
    const xid = this.nextXid();
    const cred = new RpcOpaqueAuth(0, EMPTY_READER);
    const verf = new RpcOpaqueAuth(0, EMPTY_READER);
    const writer = this.nfsEncoder.writer;
    const rmEncoder = this.nfsEncoder.rmEncoder;
    const rpcEncoder = this.nfsEncoder.rpcEncoder;
    const state = rmEncoder.startRecord();
    rpcEncoder.writeCall(xid, Nfsv4Const.PROGRAM, Nfsv4Const.VERSION, Nfsv4Proc.NULL, cred, verf);
    rmEncoder.endRecord(state);
    const encoded = writer.flush();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(xid);
        reject(new Error(`NULL request timeout (XID ${xid})`));
      }, this.timeout);
      this.pendingRequests.set(xid, {
        resolve: () => resolve(),
        reject,
        timeout,
      } as any);
      this.socket!.write(encoded);
      if (this.debug) this.logger.log(`Sent NULL request (XID ${xid})`);
    });
  }

  public close(): void {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.connected = false;
    this.connecting = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }
}
