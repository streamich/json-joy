import type {Stats, Dirent} from 'node:fs';
import * as NodePath from 'node:path';
import {randomBytes} from 'node:crypto';
import {
  Nfsv4Access,
  Nfsv4Const,
  Nfsv4Stat,
  Nfsv4OpenAccess,
  Nfsv4OpenClaimType,
  Nfsv4DelegType,
  Nfsv4LockType,
  Nfsv4OpenFlags,
  Nfsv4FType,
  Nfsv4CreateMode,
} from '../../../constants';
import type {Nfsv4OperationCtx, Nfsv4Operations} from '../Nfsv4Operations';
import * as msg from '../../../messages';
import * as struct from '../../../structs';
import {cmpUint8Array} from '@jsonjoy.com/buffers/lib/cmpUint8Array';
import {ClientRecord} from '../ClientRecord';
import {OpenFileState} from '../OpenFileState';
import {OpenOwnerState} from '../OpenOwnerState';
import {LockOwnerState} from '../LockOwnerState';
import {ByteRangeLock} from '../ByteRangeLock';
import {LockStateid} from '../LockStateid';
import {FilesystemStats} from '../FilesystemStats';
import {FileHandleMapper, ROOT_FH} from './fh';
import {isErrCode, normalizeNodeFsError} from './util';
import {Nfsv4StableHow, Nfsv4Attr} from '../../../constants';
import {encodeAttrs} from './attrs';
import {parseBitmask, requiresLstat, attrNumsToBitmap, requiresFsStats} from '../../../attributes';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../../../../../xdr/XdrEncoder';
import {XdrDecoder} from '../../../../../xdr/XdrDecoder';

export interface Nfsv4OperationsNodeOpts {
  /** Node.js `fs` module. */
  fs: typeof import('node:fs');

  /**
   * Absolute path to the root directory to serve. This is some directory on the
   * host filesystem that the NFS server will use as its root.
   */
  dir: string;

  /**
   * Maximum number of confirmed clients to allow.
   * @default 1000
   */
  maxClients?: number;

  /**
   * Maximum number of pending clients to allow.
   * @default 1000
   */
  maxPendingClients?: number;

  /**
   * Optional function to provide filesystem statistics.
   * If not provided, defaults to 2TB available space and 2M available inodes.
   */
  fsStats?: () => Promise<FilesystemStats>;
}

/**
 * NFS v4 Operations implementation for Node.js `fs` filesystem.
 */
export class Nfsv4OperationsNode implements Nfsv4Operations {
  protected readonly fs: typeof import('node:fs');
  protected readonly promises: typeof import('node:fs')['promises'];
  protected dir: string;

  /**
   * Lease time in seconds.
   * Per RFC 7530 §9.5, this is the time a client has to renew its lease
   * before the server may reclaim its state. Default is 90 seconds.
   */
  protected readonly leaseTime: number = 90;

  /** Confirmed clients. */
  protected clients: Map<bigint, ClientRecord> = new Map();
  /** Clients pending SETCLIENTID_CONFIRM confirmation. */
  protected pendingClients: Map<bigint, ClientRecord> = new Map();
  /** Maximum number of client records to keep. */
  protected maxClients;
  /** Maximum number of pending client records to keep. */
  protected maxPendingClients;
  /** Next client ID to assign. */
  protected nextClientId = 1n;

  /** Boot stamp, identifies server instance, 16 bits. */
  protected bootStamp: number = Math.round(Math.random() * 0xffff);

  protected readonly fh: FileHandleMapper;

  /** Next stateid sequence number. */
  protected nextStateidSeqid = 1;
  /** Map from stateid (as string key) to open file state. */
  protected openFiles: Map<string, OpenFileState> = new Map();
  /** Map from open-owner key to owner state. */
  protected openOwners: Map<string, OpenOwnerState> = new Map();

  /** Map from lock key to byte-range lock. */
  protected locks: Map<string, ByteRangeLock> = new Map();
  /** Map from lock-owner key to lock-owner state. */
  protected lockOwners: Map<string, LockOwnerState> = new Map();
  /** Map from lock stateid 'other' field to lock stateid state. Per RFC 7530, one stateid per lock-owner per file. */
  protected lockStateids: Map<string, LockStateid> = new Map();

  /**
   * Server-wide monotonic change counter for directory change_info.
   * Incremented on every mutating operation (RENAME, REMOVE, CREATE, etc.).
   * Used to populate change_info4 before/after values for client cache validation.
   */
  protected changeCounter: bigint = 0n;

  /**
   * Function to retrieve filesystem statistics.
   */
  protected fsStats: () => Promise<FilesystemStats>;

  constructor(opts: Nfsv4OperationsNodeOpts) {
    this.fs = opts.fs;
    this.promises = this.fs.promises;
    this.dir = opts.dir;
    this.fh = new FileHandleMapper(this.bootStamp, this.dir);
    this.maxClients = opts.maxClients ?? 1000;
    this.maxPendingClients = opts.maxPendingClients ?? 1000;
    this.fsStats = opts.fsStats ?? this.defaultFsStats;
  }

  /**
   * Default filesystem statistics: 2TB available space, 2M available inodes.
   */
  protected defaultFsStats = async (): Promise<FilesystemStats> => {
    const twoTB = BigInt(2 * 1024 * 1024 * 1024 * 1024); // 2TB
    const twoM = BigInt(2 * 1000 * 1000); // 2M inodes
    return new FilesystemStats(twoTB, twoTB, twoTB * 2n, twoM, twoM, twoM * 2n);
  };

  protected findClientByIdString(
    map: Map<bigint, ClientRecord>,
    clientIdString: Uint8Array,
  ): [bigint, ClientRecord] | undefined {
    for (const entry of map.entries()) if (cmpUint8Array(entry[1].clientIdString, clientIdString)) return entry;
    return;
  }

  protected enforceClientLimit(): void {
    if (this.clients.size <= this.maxClients) return;
    const firstKey = this.clients.keys().next().value;
    if (firstKey !== undefined) this.clients.delete(firstKey);
  }

  protected enforcePendingClientLimit(): void {
    if (this.pendingClients.size < this.maxPendingClients) return;
    const firstKey = this.pendingClients.keys().next().value;
    if (firstKey !== undefined) this.pendingClients.delete(firstKey);
  }

  protected makeOpenOwnerKey(clientid: bigint, owner: Uint8Array): string {
    return `${clientid}:${Buffer.from(owner).toString('hex')}`;
  }

  /**
   * Validates a seqid from a client request against the owner's current seqid.
   * Per RFC 7530 §9.1.7, the server expects seqid = last_seqid + 1 for new operations,
   * or seqid = last_seqid for replayed requests (idempotent retry).
   *
   * @param requestSeqid - seqid from the client request
   * @param ownerSeqid - current seqid stored for the owner
   * @returns 'valid' if seqid matches expected next value, 'replay' if it matches last value, 'invalid' otherwise
   */
  protected validateSeqid(requestSeqid: number, ownerSeqid: number): 'valid' | 'replay' | 'invalid' {
    const nextSeqid = ownerSeqid === 0xffffffff ? 1 : ownerSeqid + 1;
    if (requestSeqid === nextSeqid) return 'valid';
    if (requestSeqid === ownerSeqid) return 'replay';
    return 'invalid';
  }

  /**
   * Renews the lease for a client.
   * Per RFC 7530 §9.5, any stateful operation renews the client's lease.
   *
   * @param clientid - The client ID whose lease should be renewed
   */
  protected renewClientLease(clientid: bigint): void {
    const client = this.clients.get(clientid);
    if (client) {
      client.lastRenew = Date.now();
    }
  }

  protected makeStateidKey(stateid: struct.Nfsv4Stateid): string {
    return `${stateid.seqid}:${Buffer.from(stateid.other).toString('hex')}`;
  }

  protected createStateid(): struct.Nfsv4Stateid {
    const seqid = this.nextStateidSeqid++;
    const other = randomBytes(12);
    return new struct.Nfsv4Stateid(seqid, other);
  }

  protected canAccessFile(path: string, shareAccess: number, shareDeny: number): boolean {
    for (const openFile of this.openFiles.values()) {
      if (openFile.path !== path) continue;
      if ((openFile.shareDeny & shareAccess) !== 0) return false;
      if ((shareDeny & openFile.shareAccess) !== 0) return false;
    }
    return true;
  }

  protected makeLockOwnerKey(clientid: bigint, owner: Uint8Array): string {
    return `${clientid}:${Buffer.from(owner).toString('hex')}`;
  }

  protected makeOpenRequestKey(ownerKey: string, currentPath: string, request: msg.Nfsv4OpenRequest): string {
    const writer = new Writer(256);
    const encoder = new XdrEncoder(writer);
    request.encode(encoder);
    const requestBytes = writer.flush();
    const requestHex = Buffer.from(requestBytes).toString('hex');
    return `OPEN:${ownerKey}:${currentPath}:${requestHex}`;
  }

  protected makeLockRequestKey(
    lockOwnerKey: string,
    filePath: string,
    locktype: number,
    offset: bigint,
    length: bigint,
    seqid: number,
  ): string {
    return `LOCK:${lockOwnerKey}:${filePath}:${locktype}:${offset.toString()}:${length.toString()}:${seqid}`;
  }

  protected makeLockuRequestKey(
    lockOwnerKey: string,
    stateid: struct.Nfsv4Stateid,
    offset: bigint,
    length: bigint,
    seqid: number,
  ): string {
    const stateidKey = this.makeStateidKey(stateid);
    return `LOCKU:${lockOwnerKey}:${stateidKey}:${offset.toString()}:${length.toString()}:${seqid}`;
  }

  protected makeLockKey(stateid: struct.Nfsv4Stateid, offset: bigint, length: bigint): string {
    return `${this.makeStateidKey(stateid)}:${offset}:${length}`;
  }

  protected makeLockStateidKey(lockOwnerKey: string, path: string): string {
    return `${lockOwnerKey}:${path}`;
  }

  protected getOrCreateLockStateid(lockOwnerKey: string, path: string): LockStateid {
    const key = this.makeLockStateidKey(lockOwnerKey, path);
    let lockStateid = this.lockStateids.get(key);
    if (!lockStateid) {
      const other = randomBytes(12);
      lockStateid = new LockStateid(other, 1, lockOwnerKey, path);
      this.lockStateids.set(key, lockStateid);
      const otherKey = Buffer.from(other).toString('hex');
      this.lockStateids.set(otherKey, lockStateid);
    }
    return lockStateid;
  }

  protected findLockStateidByOther(other: Uint8Array): LockStateid | undefined {
    const otherKey = Buffer.from(other).toString('hex');
    return this.lockStateids.get(otherKey);
  }

  protected hasConflictingLock(
    path: string,
    locktype: number,
    offset: bigint,
    length: bigint,
    ownerKey: string,
  ): boolean {
    const isWriteLock = locktype === Nfsv4LockType.WRITE_LT;
    for (const lock of this.locks.values()) {
      if (lock.path !== path) continue;
      if (!lock.overlaps(offset, length)) continue;
      if (lock.lockOwnerKey === ownerKey) continue;
      if (isWriteLock || lock.locktype === Nfsv4LockType.WRITE_LT) return true;
    }
    return false;
  }

  /**
   * Establishes client ID or updates callback information.
   * Returns a client ID and confirmation verifier for SETCLIENTID_CONFIRM.
   */
  public async SETCLIENTID(
    request: msg.Nfsv4SetclientidRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4SetclientidResponse> {
    const principal = ctx.getPrincipal();
    const verifier = request.client.verifier.data;
    const clientIdString = request.client.id;
    const callback = request.callback;
    const callbackIdent = request.callbackIdent;
    const confirmedClientEntry = this.findClientByIdString(this.clients, clientIdString);
    let clientid: bigint = 0n;
    if (confirmedClientEntry) {
      const existingRecord = confirmedClientEntry[1];
      if (existingRecord.principal !== principal) return new msg.Nfsv4SetclientidResponse(Nfsv4Stat.NFS4ERR_CLID_INUSE);
      this.pendingClients.delete(clientid);
      clientid = confirmedClientEntry[0];
      const verifierMatch = cmpUint8Array(existingRecord.verifier, verifier);
      if (verifierMatch) {
        // The client is re-registering with the same ID string and verifier.
        // Update callback information, return existing client ID and issue
        // new confirm verifier.
      } else {
        // The client is re-registering with the same ID string but different verifier.
        clientid = this.nextClientId++;
      }
    } else {
      const pendingClientEntry = this.findClientByIdString(this.pendingClients, clientIdString);
      if (pendingClientEntry) {
        const existingRecord = pendingClientEntry[1];
        if (existingRecord.principal !== principal)
          return new msg.Nfsv4SetclientidResponse(Nfsv4Stat.NFS4ERR_CLID_INUSE);
        const verifierMatch = cmpUint8Array(existingRecord.verifier, verifier);
        if (verifierMatch && existingRecord.cache) {
          // The client is re-registering with the same ID string and verifier.
          // Return cached response.
          return existingRecord.cache;
        }
      }
      // New client ID string. Create new client record.
      clientid = this.nextClientId++;
    }
    const setclientidConfirm = randomBytes(8);
    const verifierStruct = new struct.Nfsv4Verifier(setclientidConfirm);
    const body = new msg.Nfsv4SetclientidResOk(clientid, verifierStruct);
    const response = new msg.Nfsv4SetclientidResponse(Nfsv4Stat.NFS4_OK, body);
    const newRecord = new ClientRecord(
      principal,
      verifier,
      clientIdString,
      callback,
      callbackIdent,
      setclientidConfirm,
      response,
    );

    // Remove any existing pending records with same ID string.
    for (const [id, entry] of this.pendingClients.entries())
      if (cmpUint8Array(entry.clientIdString, clientIdString)) this.pendingClients.delete(id);
    this.enforcePendingClientLimit();
    this.pendingClients.set(clientid, newRecord);

    return response;
  }

  /**
   * Confirms a client ID established by SETCLIENTID.
   * Transitions unconfirmed client record to confirmed state.
   */
  public async SETCLIENTID_CONFIRM(
    request: msg.Nfsv4SetclientidConfirmRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4SetclientidConfirmResponse> {
    const {clients, pendingClients} = this;
    const clientid = request.clientid;
    const setclientidConfirm = request.setclientidConfirm.data;
    const pendingRecord = pendingClients.get(clientid);
    if (!pendingRecord) {
      const confirmedRecord = this.clients.get(clientid);
      if (confirmedRecord && cmpUint8Array(confirmedRecord.setclientidConfirm, setclientidConfirm))
        return new msg.Nfsv4SetclientidConfirmResponse(Nfsv4Stat.NFS4_OK);
      return new msg.Nfsv4SetclientidConfirmResponse(Nfsv4Stat.NFS4ERR_STALE_CLIENTID);
    }
    const principal = ctx.getPrincipal();
    if (pendingRecord.principal !== principal)
      return new msg.Nfsv4SetclientidConfirmResponse(Nfsv4Stat.NFS4ERR_CLID_INUSE);
    if (!cmpUint8Array(pendingRecord.setclientidConfirm, setclientidConfirm))
      return new msg.Nfsv4SetclientidConfirmResponse(Nfsv4Stat.NFS4ERR_STALE_CLIENTID);
    const oldConfirmed = this.findClientByIdString(this.clients, pendingRecord.clientIdString);
    if (oldConfirmed) {
      const clientid2 = oldConfirmed[0];
      this.clients.delete(clientid2);
      pendingClients.delete(clientid2);
    }
    this.clients.delete(clientid);
    pendingClients.delete(clientid);

    // Remove any existing pending records with same ID string.
    const clientIdString = pendingRecord.clientIdString;
    for (const [id, entry] of pendingClients.entries())
      if (cmpUint8Array(entry.clientIdString, clientIdString)) pendingClients.delete(id);
    for (const [id, entry] of clients.entries())
      if (cmpUint8Array(entry.clientIdString, clientIdString)) clients.delete(id);

    this.enforceClientLimit();
    clients.set(clientid, pendingRecord);
    return new msg.Nfsv4SetclientidConfirmResponse(Nfsv4Stat.NFS4_OK);
  }

  public async ILLEGAL(request: msg.Nfsv4IllegalRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4IllegalResponse> {
    ctx.connection.logger.log('ILLEGAL', request);
    return new msg.Nfsv4IllegalResponse(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
  }

  public async PUTROOTFH(
    request: msg.Nfsv4PutrootfhRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4PutrootfhResponse> {
    ctx.cfh = ROOT_FH;
    return new msg.Nfsv4PutrootfhResponse(Nfsv4Stat.NFS4_OK);
  }

  public async PUTPUBFH(request: msg.Nfsv4PutpubfhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4PutpubfhResponse> {
    ctx.cfh = ROOT_FH;
    return new msg.Nfsv4PutpubfhResponse(Nfsv4Stat.NFS4_OK);
  }

  public async PUTFH(request: msg.Nfsv4PutfhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4PutfhResponse> {
    const fh = request.object.data;
    if (fh.length > Nfsv4Const.FHSIZE) throw Nfsv4Stat.NFS4ERR_BADHANDLE;
    const valid = this.fh.validate(fh);
    if (!valid) throw Nfsv4Stat.NFS4ERR_BADHANDLE;
    ctx.cfh = fh;
    return new msg.Nfsv4PutfhResponse(Nfsv4Stat.NFS4_OK);
  }

  public async GETFH(request: msg.Nfsv4GetfhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4GetfhResponse> {
    const cfh = ctx.cfh;
    if (!cfh) throw Nfsv4Stat.NFS4ERR_NOFILEHANDLE;
    const fh = new struct.Nfsv4Fh(cfh);
    const body = new msg.Nfsv4GetfhResOk(fh);
    return new msg.Nfsv4GetfhResponse(Nfsv4Stat.NFS4_OK, body);
  }

  public async RESTOREFH(
    request: msg.Nfsv4RestorefhRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4RestorefhResponse> {
    if (!ctx.sfh) throw Nfsv4Stat.NFS4ERR_RESTOREFH;
    ctx.cfh = ctx.sfh;
    return new msg.Nfsv4RestorefhResponse(Nfsv4Stat.NFS4_OK);
  }

  public async SAVEFH(request: msg.Nfsv4SavefhRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4SavefhResponse> {
    if (!ctx.cfh) throw Nfsv4Stat.NFS4ERR_NOFILEHANDLE;
    ctx.sfh = ctx.cfh;
    return new msg.Nfsv4SavefhResponse(Nfsv4Stat.NFS4_OK);
  }

  private absolutePath(path: string): string {
    const dir = this.dir;
    if (path === dir) return dir;
    if (path.startsWith(dir + NodePath.sep) || path.startsWith(dir + '/')) return path;
    const absolutePath = NodePath.join(dir, path);
    if (absolutePath.length < dir.length) throw Nfsv4Stat.NFS4ERR_NOENT;
    if (!absolutePath.startsWith(dir)) throw Nfsv4Stat.NFS4ERR_NOENT;
    return absolutePath;
  }

  public async LOOKUP(request: msg.Nfsv4LookupRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LookupResponse> {
    const fh = this.fh;
    const currentPath = fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const component = request.objname;
    if (component.length === 0) throw Nfsv4Stat.NFS4ERR_INVAL;
    const promises = this.promises;
    let stats: Stats;
    try {
      stats = await promises.stat(currentPathAbsolute);
    } catch (err: unknown) {
      if (isErrCode('ENOENT', err)) throw Nfsv4Stat.NFS4ERR_NOENT;
      throw Nfsv4Stat.NFS4ERR_IO;
    }
    if (stats.isSymbolicLink()) throw Nfsv4Stat.NFS4ERR_SYMLINK;
    if (!stats.isDirectory()) throw Nfsv4Stat.NFS4ERR_NOTDIR;
    const targetAbsolutePath = NodePath.join(currentPathAbsolute, component);
    try {
      const targetStats = await promises.stat(targetAbsolutePath);
      if (!targetStats) throw Nfsv4Stat.NFS4ERR_NOENT;
    } catch (err: any) {
      if (isErrCode('ENOENT', err)) throw Nfsv4Stat.NFS4ERR_NOENT;
      if (isErrCode('EACCES', err)) throw Nfsv4Stat.NFS4ERR_ACCESS;
      throw Nfsv4Stat.NFS4ERR_IO;
    }
    fh.setCfh(ctx, targetAbsolutePath);
    return new msg.Nfsv4LookupResponse(Nfsv4Stat.NFS4_OK);
  }

  public async LOOKUPP(request: msg.Nfsv4LookuppRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LookuppResponse> {
    const fh = this.fh;
    const currentPath = fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const promises = this.promises;
    let stats: Stats;
    try {
      stats = await promises.stat(currentPathAbsolute);
    } catch (err: any) {
      if (isErrCode('ENOENT', err)) throw Nfsv4Stat.NFS4ERR_NOENT;
      throw Nfsv4Stat.NFS4ERR_IO;
    }
    if (!stats.isDirectory()) throw Nfsv4Stat.NFS4ERR_NOTDIR;
    const parentAbsolutePath = NodePath.dirname(currentPathAbsolute);
    if (parentAbsolutePath.length < this.dir.length) throw Nfsv4Stat.NFS4ERR_NOENT;
    fh.setCfh(ctx, parentAbsolutePath);
    return new msg.Nfsv4LookuppResponse(Nfsv4Stat.NFS4_OK);
  }

  public async GETATTR(request: msg.Nfsv4GetattrRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4GetattrResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const requestedAttrNums = parseBitmask(request.attrRequest.mask);
    let stats: Stats | undefined;
    if (requiresLstat(requestedAttrNums)) {
      try {
        if (ctx.connection.debug) ctx.connection.logger.log('lstat', currentPathAbsolute);
        stats = await this.promises.lstat(currentPathAbsolute);
      } catch (error: unknown) {
        throw normalizeNodeFsError(error, ctx.connection.logger);
      }
    }
    let fsStats: FilesystemStats | undefined;
    if (requiresFsStats(requestedAttrNums)) {
      try {
        fsStats = await this.fsStats();
      } catch (error: unknown) {
        ctx.connection.logger.error(error);
      }
    }
    const attrs = encodeAttrs(request.attrRequest, stats, currentPath, ctx.cfh!, this.leaseTime, fsStats);
    return new msg.Nfsv4GetattrResponse(Nfsv4Stat.NFS4_OK, new msg.Nfsv4GetattrResOk(attrs));
  }

  public async ACCESS(request: msg.Nfsv4AccessRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4AccessResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const promises = this.promises;
    let stats: Stats;
    try {
      stats = await promises.lstat(currentPathAbsolute);
    } catch (error: unknown) {
      throw normalizeNodeFsError(error, ctx.connection.logger);
    }
    const requestedAccess = request.access;
    const isDirectory = stats.isDirectory();
    const mode = stats.mode;
    let supported = 0;
    let access = 0;
    if (requestedAccess & Nfsv4Access.ACCESS4_READ) {
      supported |= Nfsv4Access.ACCESS4_READ;
      if (mode & 0o444) access |= Nfsv4Access.ACCESS4_READ;
    }
    if (requestedAccess & Nfsv4Access.ACCESS4_LOOKUP) {
      supported |= Nfsv4Access.ACCESS4_LOOKUP;
      if (isDirectory && mode & 0o111) access |= Nfsv4Access.ACCESS4_LOOKUP;
    }
    if (requestedAccess & Nfsv4Access.ACCESS4_MODIFY) {
      supported |= Nfsv4Access.ACCESS4_MODIFY;
      if (mode & 0o222) access |= Nfsv4Access.ACCESS4_MODIFY;
    }
    if (requestedAccess & Nfsv4Access.ACCESS4_EXTEND) {
      supported |= Nfsv4Access.ACCESS4_EXTEND;
      if (mode & 0o222) access |= Nfsv4Access.ACCESS4_EXTEND;
    }
    if (requestedAccess & Nfsv4Access.ACCESS4_DELETE) {
      if (!isDirectory) {
        supported |= 0;
      } else {
        supported |= Nfsv4Access.ACCESS4_DELETE;
        if (mode & 0o222) access |= Nfsv4Access.ACCESS4_DELETE;
      }
    }
    if (requestedAccess & Nfsv4Access.ACCESS4_EXECUTE) {
      supported |= Nfsv4Access.ACCESS4_EXECUTE;
      if (!isDirectory && mode & 0o111) access |= Nfsv4Access.ACCESS4_EXECUTE;
    }
    const body = new msg.Nfsv4AccessResOk(supported, access);
    return new msg.Nfsv4AccessResponse(Nfsv4Stat.NFS4_OK, body);
  }

  public async READDIR(request: msg.Nfsv4ReaddirRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4ReaddirResponse> {
    const fh = this.fh;
    const currentPath = fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const promises = this.promises;
    let stats: Stats;
    try {
      stats = await promises.lstat(currentPathAbsolute);
    } catch (error: unknown) {
      throw normalizeNodeFsError(error, ctx.connection.logger);
    }
    if (!stats.isDirectory()) throw Nfsv4Stat.NFS4ERR_NOTDIR;
    const cookie = request.cookie;
    const requestedCookieverf = request.cookieverf.data;
    const maxcount = request.maxcount;
    const attrRequest = request.attrRequest;
    let cookieverf: Uint8Array;
    if (cookie === 0n) {
      cookieverf = new Uint8Array(8);
      const changeTime = BigInt(Math.floor(stats.mtimeMs * 1000000));
      const view = new DataView(cookieverf.buffer);
      view.setBigUint64(0, changeTime, false);
    } else {
      cookieverf = new Uint8Array(8);
      const changeTime = BigInt(Math.floor(stats.mtimeMs * 1000000));
      const view = new DataView(cookieverf.buffer);
      view.setBigUint64(0, changeTime, false);
      if (!cmpUint8Array(requestedCookieverf, cookieverf)) throw Nfsv4Stat.NFS4ERR_NOT_SAME;
    }
    let dirents: Dirent[];
    try {
      dirents = await promises.readdir(currentPathAbsolute, {withFileTypes: true});
    } catch (error: unknown) {
      throw normalizeNodeFsError(error, ctx.connection.logger);
    }
    const entries: struct.Nfsv4Entry[] = [];
    let totalBytes = 0;
    const overheadPerEntry = 32;
    let startIndex = 0;
    if (cookie > 0n) {
      startIndex = Number(cookie) - 2;
      if (startIndex < 0) startIndex = 0;
      if (startIndex > dirents.length) startIndex = dirents.length;
    }
    let eof = true;
    const fsStats = await this.fsStats();
    for (let i = startIndex; i < dirents.length; i++) {
      const dirent = dirents[i];
      const name = dirent.name;
      const entryCookie = BigInt(i + 3);
      const entryPath = NodePath.join(currentPathAbsolute, name);
      let entryStats: Stats | undefined;
      try {
        entryStats = await promises.lstat(entryPath);
      } catch (_error: unknown) {
        continue;
      }
      const entryFh = fh.encode(entryPath);
      const attrs = encodeAttrs(attrRequest, entryStats, entryPath, entryFh, this.leaseTime, fsStats);
      const nameBytes = Buffer.byteLength(name, 'utf8');
      const attrBytes = attrs.attrVals.length;
      const entryBytes = overheadPerEntry + nameBytes + attrBytes;
      if (totalBytes + entryBytes > maxcount && entries.length > 0) {
        eof = false;
        break;
      }
      const entry = new struct.Nfsv4Entry(entryCookie, name, attrs);
      entries.push(entry);
      totalBytes += entryBytes;
    }
    const cookieverf2 = new struct.Nfsv4Verifier(cookieverf);
    const body = new msg.Nfsv4ReaddirResOk(cookieverf2, entries, eof);
    return new msg.Nfsv4ReaddirResponse(Nfsv4Stat.NFS4_OK, body);
  }

  public async OPEN(request: msg.Nfsv4OpenRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4OpenResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const ownerKey = this.makeOpenOwnerKey(request.owner.clientid, request.owner.owner);
    this.renewClientLease(request.owner.clientid);
    let ownerState = this.openOwners.get(ownerKey);
    let replayCandidate = false;
    let previousSeqid = ownerState?.seqid ?? 0;
    if (!ownerState) {
      ownerState = new OpenOwnerState(request.owner.clientid, request.owner.owner, 0);
      this.openOwners.set(ownerKey, ownerState);
      previousSeqid = 0;
    } else {
      const seqidValidation = this.validateSeqid(request.seqid, ownerState.seqid);
      if (seqidValidation === 'invalid') {
        if (request.seqid === 0) {
          ownerState.seqid = 0;
          previousSeqid = 0;
        } else {
          return new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
        }
      } else if (seqidValidation === 'replay') {
        replayCandidate = true;
      }
    }
    if (request.claim.claimType !== Nfsv4OpenClaimType.CLAIM_NULL) {
      return new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4ERR_NOTSUPP);
    }
    const claimNull = request.claim.claim as struct.Nfsv4OpenClaimNull;
    const filename = claimNull.file;
    const filePath = NodePath.join(currentPathAbsolute, filename);
    const requestKey = this.makeOpenRequestKey(ownerKey, filePath, request);
    if (replayCandidate) {
      if (ownerState.lastRequestKey === requestKey && ownerState.lastResponse) {
        return ownerState.lastResponse;
      }
      return new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    }
    ownerState.seqid = request.seqid;
    const opentype = request.openhow.opentype;
    const isCreate = opentype === Nfsv4OpenFlags.OPEN4_CREATE;
    let fileExists = false;
    try {
      const stats = await this.promises.lstat(filePath);
      if (!stats.isFile()) {
        const response = new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4ERR_ISDIR);
        ownerState.lastResponse = response;
        ownerState.lastRequestKey = requestKey;
        return response;
      }
      fileExists = true;
    } catch (err) {
      if (isErrCode('ENOENT', err)) {
        if (!isCreate) {
          const response = new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4ERR_NOENT);
          ownerState.lastResponse = response;
          ownerState.lastRequestKey = requestKey;
          return response;
        }
      } else {
        const status = normalizeNodeFsError(err, ctx.connection.logger);
        const response = new msg.Nfsv4OpenResponse(status);
        ownerState.lastResponse = response;
        ownerState.lastRequestKey = requestKey;
        return response;
      }
    }
    if (fileExists && !this.canAccessFile(filePath, request.shareAccess, request.shareDeny)) {
      ownerState.seqid = previousSeqid;
      const response = new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4ERR_SHARE_DENIED);
      ownerState.lastResponse = response;
      ownerState.lastRequestKey = requestKey;
      return response;
    }
    let flags = 0;
    const isWrite = (request.shareAccess & Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE) !== 0;
    const isRead = (request.shareAccess & Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ) !== 0;
    if (isCreate) {
      flags = this.fs.constants.O_CREAT;
      const createHow = request.openhow.how;
      if (createHow && createHow.mode === Nfsv4CreateMode.EXCLUSIVE4) {
        flags |= this.fs.constants.O_EXCL;
      }
    }
    if (isRead && isWrite) {
      flags |= this.fs.constants.O_RDWR;
    } else if (isWrite) {
      flags |= this.fs.constants.O_WRONLY;
    } else {
      flags |= this.fs.constants.O_RDONLY;
    }
    try {
      const fd = await this.promises.open(filePath, flags, 0o644);
      const stateid = this.createStateid();
      const stateidKey = this.makeStateidKey(stateid);
      const openFile = new OpenFileState(
        stateid,
        filePath,
        fd,
        request.shareAccess,
        request.shareDeny,
        ownerKey,
        ownerState.seqid,
        false,
      );
      this.openFiles.set(stateidKey, openFile);
      ownerState.opens.add(stateidKey);
      const fh = this.fh.encode(filePath);
      ctx.cfh = fh;
      const before = this.changeCounter;
      const after = ++this.changeCounter;
      const cinfo = new struct.Nfsv4ChangeInfo(true, before, after);
      const attrset = new struct.Nfsv4Bitmap([]);
      const delegation = new struct.Nfsv4OpenDelegation(Nfsv4DelegType.OPEN_DELEGATE_NONE);
      const resok = new msg.Nfsv4OpenResOk(stateid, cinfo, 0, attrset, delegation);
      const response = new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4_OK, resok);
      ownerState.lastResponse = response;
      ownerState.lastRequestKey = requestKey;
      return response;
    } catch (err) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      const response = new msg.Nfsv4OpenResponse(status);
      ownerState.lastResponse = response;
      ownerState.lastRequestKey = requestKey;
      return response;
    }
  }

  public async OPENATTR(request: msg.Nfsv4OpenattrRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4OpenattrResponse> {
    return new msg.Nfsv4OpenattrResponse(Nfsv4Stat.NFS4ERR_NOTSUPP);
  }

  public async OPEN_CONFIRM(
    request: msg.Nfsv4OpenConfirmRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4OpenConfirmResponse> {
    const stateidKey = this.makeStateidKey(request.openStateid);
    const openFile = this.openFiles.get(stateidKey);
    if (!openFile) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    const ownerState = this.openOwners.get(openFile.openOwnerKey);
    if (!ownerState) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    const seqidValidation = this.validateSeqid(request.seqid, ownerState.seqid);
    if (seqidValidation === 'invalid') throw Nfsv4Stat.NFS4ERR_BAD_SEQID;
    if (seqidValidation === 'replay') {
      const newStateid = new struct.Nfsv4Stateid(openFile.stateid.seqid, openFile.stateid.other);
      const resok = new msg.Nfsv4OpenConfirmResOk(newStateid);
      return new msg.Nfsv4OpenConfirmResponse(Nfsv4Stat.NFS4_OK, resok);
    }
    ownerState.seqid = request.seqid;
    openFile.confirmed = true;
    const newSeqid = this.nextStateidSeqid++;
    const newStateid = new struct.Nfsv4Stateid(newSeqid, openFile.stateid.other);
    const oldKey = stateidKey;
    const newKey = this.makeStateidKey(newStateid);
    const updatedOpenFile = new OpenFileState(
      newStateid,
      openFile.path,
      openFile.fd,
      openFile.shareAccess,
      openFile.shareDeny,
      openFile.openOwnerKey,
      ownerState.seqid,
      true,
    );
    this.openFiles.delete(oldKey);
    this.openFiles.set(newKey, updatedOpenFile);
    ownerState.opens.delete(oldKey);
    ownerState.opens.add(newKey);
    const resok = new msg.Nfsv4OpenConfirmResOk(newStateid);
    return new msg.Nfsv4OpenConfirmResponse(Nfsv4Stat.NFS4_OK, resok);
  }

  public async OPEN_DOWNGRADE(
    request: msg.Nfsv4OpenDowngradeRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4OpenDowngradeResponse> {
    const stateidKey = this.makeStateidKey(request.openStateid);
    const openFile = this.openFiles.get(stateidKey);
    if (!openFile) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    const ownerState = this.openOwners.get(openFile.openOwnerKey);
    if (!ownerState) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    const seqidValidation = this.validateSeqid(request.seqid, ownerState.seqid);
    if (seqidValidation === 'invalid') throw Nfsv4Stat.NFS4ERR_BAD_SEQID;
    if (seqidValidation === 'replay') {
      const newStateid = new struct.Nfsv4Stateid(openFile.stateid.seqid, openFile.stateid.other);
      const resok = new msg.Nfsv4OpenDowngradeResOk(newStateid);
      return new msg.Nfsv4OpenDowngradeResponse(Nfsv4Stat.NFS4_OK, resok);
    }
    ownerState.seqid = request.seqid;
    if ((request.shareAccess & ~openFile.shareAccess) !== 0) throw Nfsv4Stat.NFS4ERR_INVAL;
    if ((request.shareDeny & ~openFile.shareDeny) !== 0) throw Nfsv4Stat.NFS4ERR_INVAL;
    const newSeqid = this.nextStateidSeqid++;
    const newStateid = new struct.Nfsv4Stateid(newSeqid, openFile.stateid.other);
    const oldKey = stateidKey;
    const newKey = this.makeStateidKey(newStateid);
    const updatedOpenFile = new OpenFileState(
      newStateid,
      openFile.path,
      openFile.fd,
      request.shareAccess,
      request.shareDeny,
      openFile.openOwnerKey,
      ownerState.seqid,
      openFile.confirmed,
    );
    this.openFiles.delete(oldKey);
    this.openFiles.set(newKey, updatedOpenFile);
    ownerState.opens.delete(oldKey);
    ownerState.opens.add(newKey);
    const resok = new msg.Nfsv4OpenDowngradeResOk(newStateid);
    return new msg.Nfsv4OpenDowngradeResponse(Nfsv4Stat.NFS4_OK, resok);
  }

  public async CLOSE(request: msg.Nfsv4CloseRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4CloseResponse> {
    const stateidKey = this.makeStateidKey(request.openStateid);
    const openFile = this.openFiles.get(stateidKey);
    if (!openFile) {
      return new msg.Nfsv4CloseResponse(Nfsv4Stat.NFS4_OK, new msg.Nfsv4CloseResOk(request.openStateid));
    }
    const ownerState = this.openOwners.get(openFile.openOwnerKey);
    if (!ownerState) {
      return new msg.Nfsv4CloseResponse(Nfsv4Stat.NFS4ERR_BAD_STATEID);
    }
    this.renewClientLease(ownerState.clientid);
    const seqidValidation = this.validateSeqid(request.seqid, ownerState.seqid);
    if (seqidValidation === 'invalid') {
      return new msg.Nfsv4CloseResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    }
    if (seqidValidation === 'replay') {
      const newStateid = new struct.Nfsv4Stateid(openFile.stateid.seqid, openFile.stateid.other);
      const resok = new msg.Nfsv4CloseResOk(newStateid);
      return new msg.Nfsv4CloseResponse(Nfsv4Stat.NFS4_OK, resok);
    }
    ownerState.seqid = request.seqid;
    try {
      const handle = openFile.fd as any;
      if (handle && typeof handle.close === 'function') {
        await handle.close();
      }
    } catch (err) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      if (status !== Nfsv4Stat.NFS4ERR_NOENT) {
        return new msg.Nfsv4CloseResponse(status);
      }
    }
    ownerState.opens.delete(stateidKey);
    if (ownerState.opens.size === 0) {
      this.openOwners.delete(openFile.openOwnerKey);
    }
    this.openFiles.delete(stateidKey);
    const newSeqid = this.nextStateidSeqid++;
    const newStateid = new struct.Nfsv4Stateid(newSeqid, openFile.stateid.other);
    const resok = new msg.Nfsv4CloseResOk(newStateid);
    return new msg.Nfsv4CloseResponse(Nfsv4Stat.NFS4_OK, resok);
  }

  public async SECINFO(request: msg.Nfsv4SecinfoRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4SecinfoResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const filePath = NodePath.join(currentPathAbsolute, request.name);
    try {
      await this.promises.lstat(filePath);
    } catch (err) {
      if (isErrCode(err, 'ENOENT')) {
        return new msg.Nfsv4SecinfoResponse(Nfsv4Stat.NFS4ERR_NOENT);
      }
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4SecinfoResponse(status);
    }
    const flavors: struct.Nfsv4SecInfoFlavor[] = [new struct.Nfsv4SecInfoFlavor(1)];
    const resok = new msg.Nfsv4SecinfoResOk(flavors);
    return new msg.Nfsv4SecinfoResponse(Nfsv4Stat.NFS4_OK, resok);
  }

  public async LOCK(request: msg.Nfsv4LockRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LockResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const {locktype, offset, length, locker} = request;
    if (!locker.newLockOwner) {
      const existingOwner = locker.owner as struct.Nfsv4LockExistingOwner;
      const stateidKey = this.makeStateidKey(existingOwner.lockStateid);
      let existingLockOwnerKey: string | undefined;
      for (const lock of this.locks.values()) {
        if (this.makeStateidKey(lock.stateid) === stateidKey) {
          existingLockOwnerKey = lock.lockOwnerKey;
          break;
        }
      }
      if (!existingLockOwnerKey) {
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_STATEID);
      }
      const lockOwnerState = this.lockOwners.get(existingLockOwnerKey);
      if (!lockOwnerState) {
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_STATEID);
      }
      this.renewClientLease(lockOwnerState.clientid);
      const seqidValidation = this.validateSeqid(existingOwner.lockSeqid, lockOwnerState.seqid);
      const requestKey = this.makeLockRequestKey(
        existingLockOwnerKey,
        currentPath,
        locktype,
        offset,
        length,
        existingOwner.lockSeqid,
      );
      if (seqidValidation === 'invalid') {
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
      }
      if (seqidValidation === 'replay') {
        if (lockOwnerState.lastRequestKey !== requestKey) {
          return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
        }
        if (lockOwnerState.lastResponse) return lockOwnerState.lastResponse;
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
      }
      lockOwnerState.seqid = existingOwner.lockSeqid;
      if (this.hasConflictingLock(currentPath, locktype, offset, length, existingLockOwnerKey)) {
        const conflictOwner = new struct.Nfsv4LockOwner(BigInt(0), new Uint8Array());
        const denied = new msg.Nfsv4LockResDenied(offset, length, locktype, conflictOwner);
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_DENIED, undefined, denied);
      }
      const lockStateid = this.getOrCreateLockStateid(existingLockOwnerKey, currentPath);
      const stateid = lockStateid.incrementAndGetStateid();
      const lock = new ByteRangeLock(stateid, currentPath, locktype, offset, length, existingLockOwnerKey);
      const lockKey = this.makeLockKey(stateid, offset, length);
      this.locks.set(lockKey, lock);
      lockOwnerState.locks.add(lockKey);
      const resok = new msg.Nfsv4LockResOk(stateid);
      const response = new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4_OK, resok);
      lockOwnerState.lastResponse = response;
      lockOwnerState.lastRequestKey = requestKey;
      return response;
    }
    const newOwner = locker.owner as struct.Nfsv4LockNewOwner;
    const openToLock = newOwner.openToLockOwner;
    const lockOwnerData = openToLock.lockOwner;
    const openStateidKey = this.makeStateidKey(openToLock.openStateid);
    const openFile = this.openFiles.get(openStateidKey);
    if (!openFile) {
      return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_STATEID);
    }
    const openOwnerKey = openFile.openOwnerKey;
    const openOwnerState = this.openOwners.get(openOwnerKey);
    if (!openOwnerState) {
      return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_STATEID);
    }
    this.renewClientLease(lockOwnerData.clientid);
    const seqidValidation = this.validateSeqid(openToLock.openSeqid, openOwnerState.seqid);
    if (seqidValidation === 'invalid') {
      return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    }
    if (seqidValidation === 'replay') {
      for (const [_key, lock] of this.locks.entries()) {
        if (
          lock.lockOwnerKey === this.makeLockOwnerKey(lockOwnerData.clientid, lockOwnerData.owner) &&
          lock.path === currentPath &&
          lock.offset === offset &&
          lock.length === length
        ) {
          const resok = new msg.Nfsv4LockResOk(lock.stateid);
          return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4_OK, resok);
        }
      }
    }
    openOwnerState.seqid = openToLock.openSeqid;
    const lockOwnerKey = this.makeLockOwnerKey(lockOwnerData.clientid, lockOwnerData.owner);
    const lockRequestKey = this.makeLockRequestKey(
      lockOwnerKey,
      currentPath,
      locktype,
      offset,
      length,
      openToLock.lockSeqid,
    );
    if (this.hasConflictingLock(currentPath, locktype, offset, length, lockOwnerKey)) {
      const conflictOwner = new struct.Nfsv4LockOwner(BigInt(0), new Uint8Array());
      const denied = new msg.Nfsv4LockResDenied(offset, length, locktype, conflictOwner);
      return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_DENIED, undefined, denied);
    }
    let lockOwnerState = this.lockOwners.get(lockOwnerKey);
    if (!lockOwnerState) {
      if (openToLock.lockSeqid !== 0) {
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
      }
      lockOwnerState = new LockOwnerState(lockOwnerData.clientid, lockOwnerData.owner, 0);
      this.lockOwners.set(lockOwnerKey, lockOwnerState);
    } else {
      const lockSeqidValidation = this.validateSeqid(openToLock.lockSeqid, lockOwnerState.seqid);
      if (lockSeqidValidation === 'invalid') {
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
      }
      if (lockSeqidValidation === 'replay') {
        if (lockOwnerState.lastRequestKey === lockRequestKey && lockOwnerState.lastResponse) {
          return lockOwnerState.lastResponse;
        }
        return new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4ERR_BAD_SEQID);
      }
    }
    lockOwnerState.seqid = openToLock.lockSeqid;
    const lockStateid = this.getOrCreateLockStateid(lockOwnerKey, currentPath);
    const stateid = lockStateid.incrementAndGetStateid();
    const lock = new ByteRangeLock(stateid, currentPath, locktype, offset, length, lockOwnerKey);
    const lockKey = this.makeLockKey(stateid, offset, length);
    this.locks.set(lockKey, lock);
    lockOwnerState.locks.add(lockKey);
    const resok = new msg.Nfsv4LockResOk(stateid);
    const response = new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4_OK, resok);
    lockOwnerState.lastResponse = response;
    lockOwnerState.lastRequestKey = lockRequestKey;
    return response;
  }

  public async LOCKT(request: msg.Nfsv4LocktRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LocktResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const {locktype, offset, length, owner} = request;
    const ownerKey = this.makeLockOwnerKey(owner.clientid, owner.owner);
    if (this.hasConflictingLock(currentPath, locktype, offset, length, ownerKey)) {
      const conflictOwner = new struct.Nfsv4LockOwner(BigInt(0), new Uint8Array());
      const denied = new msg.Nfsv4LocktResDenied(offset, length, locktype, conflictOwner);
      return new msg.Nfsv4LocktResponse(Nfsv4Stat.NFS4ERR_DENIED, denied);
    }
    return new msg.Nfsv4LocktResponse(Nfsv4Stat.NFS4_OK);
  }

  public async LOCKU(request: msg.Nfsv4LockuRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LockuResponse> {
    const {lockStateid, offset, length, seqid} = request;
    const lockStateidState = this.findLockStateidByOther(lockStateid.other);
    if (!lockStateidState) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    const ownerKey = lockStateidState.lockOwnerKey;
    const lockOwnerState = this.lockOwners.get(ownerKey);
    if (!lockOwnerState) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    this.renewClientLease(lockOwnerState.clientid);
    const currentPath = this.fh.currentPath(ctx);
    if (lockStateidState.path !== currentPath) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    const requestKey = this.makeLockuRequestKey(ownerKey, lockStateid, offset, length, seqid);
    const seqidValidation = this.validateSeqid(seqid, lockOwnerState.seqid);
    if (seqidValidation === 'invalid') {
      throw Nfsv4Stat.NFS4ERR_BAD_SEQID;
    }
    if (seqidValidation === 'replay') {
      if (lockOwnerState.lastRequestKey === requestKey && lockOwnerState.lastResponse) {
        return lockOwnerState.lastResponse;
      }
      throw Nfsv4Stat.NFS4ERR_BAD_SEQID;
    }
    lockOwnerState.seqid = seqid;
    const lockKey = this.makeLockKey(lockStateid, offset, length);
    const lock = this.locks.get(lockKey);
    if (lock) {
      this.locks.delete(lockKey);
      lockOwnerState.locks.delete(lockKey);
    }
    const stateid = lockStateidState.incrementAndGetStateid();
    const resok = new msg.Nfsv4LockuResOk(stateid);
    const response = new msg.Nfsv4LockuResponse(Nfsv4Stat.NFS4_OK, resok);
    lockOwnerState.lastResponse = response;
    lockOwnerState.lastRequestKey = requestKey;
    return response;
  }

  public async RELEASE_LOCKOWNER(
    request: msg.Nfsv4ReleaseLockOwnerRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4ReleaseLockOwnerResponse> {
    const {lockOwner} = request;
    const ownerKey = this.makeLockOwnerKey(lockOwner.clientid, lockOwner.owner);
    const lockOwnerState = this.lockOwners.get(ownerKey);
    if (!lockOwnerState) throw Nfsv4Stat.NFS4ERR_BAD_STATEID;
    for (const lockKey of lockOwnerState.locks) this.locks.delete(lockKey);
    this.lockOwners.delete(ownerKey);
    return new msg.Nfsv4ReleaseLockOwnerResponse(Nfsv4Stat.NFS4_OK);
  }

  public async RENEW(request: msg.Nfsv4RenewRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4RenewResponse> {
    const clientid = request.clientid;
    const client = this.clients.get(clientid);
    if (!client) throw Nfsv4Stat.NFS4ERR_STALE_CLIENTID;
    return new msg.Nfsv4RenewResponse(Nfsv4Stat.NFS4_OK);
  }

  public async READ(request: msg.Nfsv4ReadRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4ReadResponse> {
    const stateidKey = this.makeStateidKey(request.stateid);
    const openFile = this.openFiles.get(stateidKey);
    if (!openFile) return new msg.Nfsv4ReadResponse(Nfsv4Stat.NFS4ERR_BAD_STATEID);
    const fdHandle = openFile.fd as any;
    // If we have an fd-like handle, use its .read; otherwise open the path
    let fd: any;
    let openedHere = false;
    try {
      if (fdHandle && typeof fdHandle.read === 'function') {
        fd = fdHandle;
      } else {
        fd = await this.promises.open(openFile.path, this.fs.constants.O_RDONLY);
        openedHere = true;
      }
      const buf = Buffer.alloc(request.count);
      const {bytesRead} = await fd.read(buf, 0, request.count, Number(request.offset));
      const eof = bytesRead < request.count;
      const data = buf.slice(0, bytesRead);
      const resok = new msg.Nfsv4ReadResOk(eof, data);
      return new msg.Nfsv4ReadResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4ReadResponse(status);
    } finally {
      try {
        if (openedHere && fd && typeof fd.close === 'function') await fd.close();
      } catch (_e) {
        /* ignore close errors */
      }
    }
  }

  public async READLINK(request: msg.Nfsv4ReadlinkRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4ReadlinkResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    try {
      const target = await this.promises.readlink(currentPathAbsolute);
      const resok = new msg.Nfsv4ReadlinkResOk(target);
      return new msg.Nfsv4ReadlinkResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4ReadlinkResponse(status);
    }
  }

  public async REMOVE(request: msg.Nfsv4RemoveRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4RemoveResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const targetPath = this.absolutePath(NodePath.join(currentPath, request.target));
    try {
      const stats = await this.promises.lstat(targetPath);
      if (stats.isDirectory()) {
        await this.promises.rmdir(targetPath);
      } else {
        await this.promises.unlink(targetPath);
      }
      this.fh.remove(targetPath);
      const before = this.changeCounter;
      const after = ++this.changeCounter;
      const cinfo = new struct.Nfsv4ChangeInfo(true, before, after);
      const resok = new msg.Nfsv4RemoveResOk(cinfo);
      return new msg.Nfsv4RemoveResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4RemoveResponse(status);
    }
  }

  public async RENAME(request: msg.Nfsv4RenameRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4RenameResponse> {
    const savedPath = this.fh.savedPath(ctx);
    const currentPath = this.fh.currentPath(ctx);
    const savedPathAbsolute = this.absolutePath(savedPath);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const oldFull = NodePath.join(savedPathAbsolute, request.oldname);
    const newFull = NodePath.join(currentPathAbsolute, request.newname);
    if (oldFull.length < this.dir.length || newFull.length < this.dir.length) throw Nfsv4Stat.NFS4ERR_NOENT;
    if (!oldFull.startsWith(this.dir)) return new msg.Nfsv4RenameResponse(Nfsv4Stat.NFS4ERR_NOENT);
    if (!newFull.startsWith(this.dir)) return new msg.Nfsv4RenameResponse(Nfsv4Stat.NFS4ERR_NOENT);
    let oldPath: string;
    let newPath: string;
    try {
      oldPath = this.absolutePath(oldFull);
      newPath = this.absolutePath(newFull);
    } catch (e: any) {
      const status = typeof e === 'number' ? e : Nfsv4Stat.NFS4ERR_NOENT;
      return new msg.Nfsv4RenameResponse(status);
    }
    try {
      await this.promises.rename(oldPath, newPath);
      this.fh.rename(oldPath, newPath);
      const before = this.changeCounter;
      const after = ++this.changeCounter;
      const sourceCinfo = new struct.Nfsv4ChangeInfo(true, before, after);
      const targetCinfo = new struct.Nfsv4ChangeInfo(true, before, after);
      const resok = new msg.Nfsv4RenameResOk(sourceCinfo, targetCinfo);
      return new msg.Nfsv4RenameResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      if (isErrCode('EXDEV', err)) return new msg.Nfsv4RenameResponse(Nfsv4Stat.NFS4ERR_XDEV);
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4RenameResponse(status);
    }
  }

  public async WRITE(request: msg.Nfsv4WriteRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4WriteResponse> {
    const stateidKey = this.makeStateidKey(request.stateid);
    const openFile = this.openFiles.get(stateidKey);
    if (!openFile) return new msg.Nfsv4WriteResponse(Nfsv4Stat.NFS4ERR_BAD_STATEID);
    const fdHandle = openFile.fd as any;
    let fd: any;
    let openedHere = false;
    try {
      if (fdHandle && typeof fdHandle.write === 'function') {
        fd = fdHandle;
      } else {
        fd = await this.promises.open(openFile.path, this.fs.constants.O_RDWR);
        openedHere = true;
      }
      const buffer = Buffer.from(request.data);
      const {bytesWritten} = await fd.write(buffer, 0, buffer.length, Number(request.offset));
      // Handle stable flag
      const committed =
        request.stable === Nfsv4StableHow.UNSTABLE4 ? Nfsv4StableHow.UNSTABLE4 : Nfsv4StableHow.FILE_SYNC4;
      if (request.stable === Nfsv4StableHow.FILE_SYNC4 || request.stable === Nfsv4StableHow.DATA_SYNC4) {
        // fd.datasync or fd.sync
        if (typeof fd.datasync === 'function') await fd.datasync();
        else if (typeof fd.sync === 'function') await fd.sync();
      }
      const verifier = new struct.Nfsv4Verifier(randomBytes(8));
      const resok = new msg.Nfsv4WriteResOk(bytesWritten, committed, verifier);
      return new msg.Nfsv4WriteResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4WriteResponse(status);
    } finally {
      try {
        if (openedHere && fd && typeof fd.close === 'function') await fd.close();
      } catch (_e) {
        /* ignore close errors */
      }
    }
  }

  public async DELEGPURGE(
    request: msg.Nfsv4DelegpurgeRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4DelegpurgeResponse> {
    return new msg.Nfsv4DelegpurgeResponse(Nfsv4Stat.NFS4ERR_NOTSUPP);
  }

  public async DELEGRETURN(
    request: msg.Nfsv4DelegreturnRequest,
    ctx: Nfsv4OperationCtx,
  ): Promise<msg.Nfsv4DelegreturnResponse> {
    return new msg.Nfsv4DelegreturnResponse(Nfsv4Stat.NFS4ERR_NOTSUPP);
  }
  public async COMMIT(request: msg.Nfsv4CommitRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4CommitResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    // If there is an open file corresponding to this path, prefer that fd
    let fd: any;
    for (const openFile of this.openFiles.values()) {
      if (openFile.path === currentPathAbsolute) {
        fd = openFile.fd as any;
        break;
      }
    }
    try {
      if (fd && typeof fd.datasync === 'function') {
        await fd.datasync();
      } else if (fd && typeof fd.sync === 'function') {
        await fd.sync();
      } else {
        // fallback: open and fdatasync
        const handle = await this.promises.open(currentPathAbsolute, this.fs.constants.O_RDONLY);
        try {
          if (typeof handle.datasync === 'function') await handle.datasync();
          else if (typeof handle.sync === 'function') await handle.sync();
        } finally {
          try {
            await handle.close();
          } catch (_e) {
            /* ignore */
          }
        }
      }
      // Return OK; no specific commit verifier currently persisted
      return new msg.Nfsv4CommitResponse(Nfsv4Stat.NFS4_OK);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4CommitResponse(status);
    }
  }

  public async CREATE(request: msg.Nfsv4CreateRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4CreateResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    const name = request.objname;
    const createPath = NodePath.join(currentPathAbsolute, name);
    if (createPath.length < this.dir.length) throw Nfsv4Stat.NFS4ERR_NOENT;
    try {
      const objType = request.objtype.type;
      if (objType === Nfsv4FType.NF4DIR) {
        let mode = 0o777;
        try {
          if (request.createattrs && request.createattrs.attrmask) {
            const dec = new XdrDecoder();
            dec.reader.reset(request.createattrs.attrVals);
            const maskSet = parseBitmask(request.createattrs.attrmask.mask);
            if (maskSet.has(Nfsv4Attr.FATTR4_MODE)) {
              const m = dec.readUnsignedInt();
              mode = m & 0o7777;
            }
          }
        } catch (_e) {
          // ignore parsing errors, fall back to default mode
        }
        await this.promises.mkdir(createPath, mode);
      } else if (objType === Nfsv4FType.NF4LNK) {
        const linkTarget = (request.objtype.objtype as struct.Nfsv4CreateTypeLink).linkdata;
        await this.promises.symlink(linkTarget, createPath);
      } else {
        let mode = 0o666;
        try {
          if (request.createattrs && request.createattrs.attrmask) {
            const dec = new XdrDecoder();
            dec.reader.reset(request.createattrs.attrVals);
            const maskSet = parseBitmask(request.createattrs.attrmask.mask);
            if (maskSet.has(Nfsv4Attr.FATTR4_MODE)) {
              const m = dec.readUnsignedInt();
              mode = m & 0o7777;
            }
          }
        } catch (_e) {
          // ignore parsing errors, fall back to default mode
        }
        const fd = await this.promises.open(
          createPath,
          this.fs.constants.O_CREAT | this.fs.constants.O_EXCL | this.fs.constants.O_RDWR,
          mode,
        );
        try {
          await fd.close();
        } catch {}
      }
      const _stats = await this.promises.stat(createPath);
      const fh = this.fh.encode(createPath);
      ctx.cfh = fh;
      const before = this.changeCounter;
      const after = ++this.changeCounter;
      const cinfo = new struct.Nfsv4ChangeInfo(true, before, after);
      const attrset = new struct.Nfsv4Bitmap([]);
      const resok = new msg.Nfsv4CreateResOk(cinfo, attrset);
      return new msg.Nfsv4CreateResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4CreateResponse(status);
    }
  }

  public async LINK(request: msg.Nfsv4LinkRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4LinkResponse> {
    const savedPath = this.fh.savedPath(ctx);
    const existingPath = this.absolutePath(savedPath);
    const currentPath = this.fh.currentPath(ctx);
    const newPath = this.absolutePath(NodePath.join(currentPath, request.newname));
    try {
      await this.promises.link(existingPath, newPath);
      const before = this.changeCounter;
      const after = ++this.changeCounter;
      const resok = new msg.Nfsv4LinkResOk(new struct.Nfsv4ChangeInfo(true, before, after));
      return new msg.Nfsv4LinkResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4LinkResponse(status);
    }
  }

  public async NVERIFY(request: msg.Nfsv4NverifyRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4NverifyResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    try {
      const stats = await this.promises.lstat(currentPathAbsolute);
      const fsStats = await this.fsStats();
      // request.objAttributes is a Nfsv4Fattr: use its attrmask when asking
      // encodeAttrs to serialize the server's current attributes and compare
      // raw attrVals bytes.
      const attrs = encodeAttrs(
        request.objAttributes.attrmask,
        stats,
        currentPathAbsolute,
        ctx.cfh!,
        this.leaseTime,
        fsStats,
      );
      if (cmpUint8Array(attrs.attrVals, request.objAttributes.attrVals))
        return new msg.Nfsv4NverifyResponse(Nfsv4Stat.NFS4ERR_NOT_SAME);
      return new msg.Nfsv4NverifyResponse(Nfsv4Stat.NFS4_OK);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4NverifyResponse(status);
    }
  }

  public async SETATTR(request: msg.Nfsv4SetattrRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4SetattrResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    try {
      const inFattr = request.objAttributes;
      const dec = new XdrDecoder();
      dec.reader.reset(inFattr.attrVals);
      const mask = inFattr.attrmask.mask;
      let atime: Date | undefined;
      let mtime: Date | undefined;
      let uid: number | undefined;
      let gid: number | undefined;
      for (let i = 0; i < mask.length; i++) {
        const word = mask[i];
        for (let bit = 0; bit < 32; bit++) {
          const bitMask = 1 << bit;
          if (!(word & bitMask)) continue;
          const attrNum = i * 32 + bit;
          switch (attrNum) {
            case Nfsv4Attr.FATTR4_MODE: {
              const mode = dec.readUnsignedInt();
              await this.promises.chmod(currentPathAbsolute, mode & 0o7777);
              break;
            }
            case Nfsv4Attr.FATTR4_OWNER: {
              const owner = dec.readString();
              const parsedUid = parseInt(owner, 10);
              if (!Number.isNaN(parsedUid)) {
                uid = parsedUid;
              }
              break;
            }
            case Nfsv4Attr.FATTR4_OWNER_GROUP: {
              const group = dec.readString();
              const parsedGid = parseInt(group, 10);
              if (!Number.isNaN(parsedGid)) {
                gid = parsedGid;
              }
              break;
            }
            case Nfsv4Attr.FATTR4_SIZE: {
              const size = dec.readUnsignedHyper();
              await this.promises.truncate(currentPathAbsolute, Number(size));
              break;
            }
            case Nfsv4Attr.FATTR4_TIME_ACCESS_SET: {
              const setIt = dec.readUnsignedInt();
              if (setIt === 1) {
                const seconds = Number(dec.readHyper());
                const nseconds = dec.readUnsignedInt();
                atime = new Date(seconds * 1000 + nseconds / 1000000);
              }
              break;
            }
            case Nfsv4Attr.FATTR4_TIME_MODIFY_SET: {
              const setIt = dec.readUnsignedInt();
              if (setIt === 1) {
                const seconds = Number(dec.readHyper());
                const nseconds = dec.readUnsignedInt();
                mtime = new Date(seconds * 1000 + nseconds / 1000000);
              }
              break;
            }
            case Nfsv4Attr.FATTR4_FILEHANDLE: {
              // read and ignore
              dec.readVarlenArray(() => dec.readUnsignedInt());
              break;
            }
            case Nfsv4Attr.FATTR4_SUPPORTED_ATTRS: {
              const len = dec.readUnsignedInt();
              for (let j = 0; j < len; j++) dec.readUnsignedInt();
              break;
            }
            case Nfsv4Attr.FATTR4_TYPE: {
              dec.readUnsignedInt();
              break;
            }
            case Nfsv4Attr.FATTR4_FILEID:
            case Nfsv4Attr.FATTR4_SPACE_USED:
            case Nfsv4Attr.FATTR4_CHANGE: {
              dec.readUnsignedHyper();
              break;
            }
            case Nfsv4Attr.FATTR4_TIME_ACCESS:
            case Nfsv4Attr.FATTR4_TIME_MODIFY:
            case Nfsv4Attr.FATTR4_TIME_METADATA: {
              dec.readHyper();
              dec.readUnsignedInt();
              break;
            }
            default: {
              return new msg.Nfsv4SetattrResponse(Nfsv4Stat.NFS4ERR_ATTRNOTSUPP);
            }
          }
        }
      }
      if (uid !== undefined || gid !== undefined) {
        const stats = await this.promises.lstat(currentPathAbsolute);
        const uidToSet = uid !== undefined ? uid : stats.uid;
        const gidToSet = gid !== undefined ? gid : stats.gid;
        await this.promises.chown(currentPathAbsolute, uidToSet, gidToSet);
      }
      if (atime || mtime) {
        const stats = await this.promises.lstat(currentPathAbsolute);
        const atimeToSet = atime || stats.atime;
        const mtimeToSet = mtime || stats.mtime;
        await this.promises.utimes(currentPathAbsolute, atimeToSet, mtimeToSet);
      }
      const stats = await this.promises.lstat(currentPathAbsolute);
      const fh = this.fh.encode(currentPath);
      const fsStats = await this.fsStats();
      // Return updated mode and size attributes
      const returnMask = new struct.Nfsv4Bitmap(attrNumsToBitmap([Nfsv4Attr.FATTR4_MODE, Nfsv4Attr.FATTR4_SIZE]));
      const _fattr = encodeAttrs(returnMask, stats, currentPath, fh, this.leaseTime, fsStats);
      const resok = new msg.Nfsv4SetattrResOk(returnMask);
      return new msg.Nfsv4SetattrResponse(Nfsv4Stat.NFS4_OK, resok);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4SetattrResponse(status);
    }
  }

  public async VERIFY(request: msg.Nfsv4VerifyRequest, ctx: Nfsv4OperationCtx): Promise<msg.Nfsv4VerifyResponse> {
    const currentPath = this.fh.currentPath(ctx);
    const currentPathAbsolute = this.absolutePath(currentPath);
    try {
      const stats = await this.promises.lstat(currentPathAbsolute);
      const fsStats = await this.fsStats();
      const attrs = encodeAttrs(request.objAttributes.attrmask, stats, currentPath, ctx.cfh!, this.leaseTime, fsStats);
      if (cmpUint8Array(attrs.attrVals, request.objAttributes.attrVals))
        return new msg.Nfsv4VerifyResponse(Nfsv4Stat.NFS4_OK);
      return new msg.Nfsv4VerifyResponse(Nfsv4Stat.NFS4ERR_NOT_SAME);
    } catch (err: unknown) {
      const status = normalizeNodeFsError(err, ctx.connection.logger);
      return new msg.Nfsv4VerifyResponse(status);
    }
  }
}
