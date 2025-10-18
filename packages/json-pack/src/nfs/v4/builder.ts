import {attrNumsToBitmap} from './attributes';
import * as msg from './messages';
import * as structs from './structs';
import {Nfsv4CreateMode, Nfsv4FType, type Nfsv4LockType, Nfsv4OpenFlags} from './constants';

/**
 * Static builder helpers for NFS v4 operations.
 * Provides a simpler API for constructing NFS v4 request messages.
 *
 * @example
 * ```ts
 * const response = await client.compound([
 *   nfs.PUTROOTFH(),
 *   nfs.LOOKUP('file.txt'),
 *   nfs.GETATTR([0x00000001]),
 * ]);
 * ```
 */
export const nfs = {
  /**
   * PUTROOTFH - Set current filehandle to root of export.
   */
  PUTROOTFH(): msg.Nfsv4PutrootfhRequest {
    return new msg.Nfsv4PutrootfhRequest();
  },

  /**
   * PUTFH - Set current filehandle.
   * @param fh - Filehandle to set as current
   */
  PUTFH(fh: structs.Nfsv4Fh): msg.Nfsv4PutfhRequest {
    return new msg.Nfsv4PutfhRequest(fh);
  },

  /**
   * PUTPUBFH - Set current filehandle to public filehandle.
   */
  PUTPUBFH(): msg.Nfsv4PutpubfhRequest {
    return new msg.Nfsv4PutpubfhRequest();
  },

  /**
   * GETFH - Get current filehandle.
   */
  GETFH(): msg.Nfsv4GetfhRequest {
    return new msg.Nfsv4GetfhRequest();
  },

  /**
   * LOOKUP - Lookup filename in current directory.
   * @param name - Filename to lookup
   */
  LOOKUP(name: string): msg.Nfsv4LookupRequest {
    return new msg.Nfsv4LookupRequest(name);
  },

  /**
   * LOOKUPP - Lookup parent directory (..).
   */
  LOOKUPP(): msg.Nfsv4LookuppRequest {
    return new msg.Nfsv4LookuppRequest();
  },

  /**
   * GETATTR - Get file attributes.
   * @param attrBitmap - Attribute bitmap (array of uint32 values)
   */
  GETATTR(attrBitmap: number[]): msg.Nfsv4GetattrRequest {
    return new msg.Nfsv4GetattrRequest(new structs.Nfsv4Bitmap(attrBitmap));
  },

  /**
   * READDIR - Read directory entries.
   * @param attrBitmap - Attribute bitmap for entries (single uint32 or array)
   * @param cookieverf - Cookie verifier (8 bytes), defaults to zeros
   * @param cookie - Starting cookie, defaults to 0
   * @param dircount - Max bytes for directory info, defaults to 1000
   * @param maxcount - Max bytes for reply, defaults to 8192
   */
  READDIR(
    attrBitmap: number | number[],
    cookieverf?: Uint8Array,
    cookie?: bigint,
    dircount?: number,
    maxcount?: number,
  ): msg.Nfsv4ReaddirRequest {
    const bitmap = Array.isArray(attrBitmap) ? attrBitmap : [attrBitmap];
    const verifier = cookieverf || new Uint8Array(8);
    return new msg.Nfsv4ReaddirRequest(
      cookie ?? BigInt(0),
      new structs.Nfsv4Verifier(verifier),
      dircount ?? 1000,
      maxcount ?? 8192,
      new structs.Nfsv4Bitmap(bitmap),
    );
  },

  /**
   * ACCESS - Check access permissions.
   * @param accessMask - Access mask (default: 0x3f for all bits)
   */
  ACCESS(accessMask: number = 0x0000003f): msg.Nfsv4AccessRequest {
    return new msg.Nfsv4AccessRequest(accessMask);
  },

  /**
   * READ - Read file data.
   * @param offset - Byte offset to read from
   * @param count - Number of bytes to read
   * @param stateid - State ID (defaults to all zeros)
   */
  READ(offset: bigint, count: number, stateid?: structs.Nfsv4Stateid): msg.Nfsv4ReadRequest {
    const sid = stateid || new structs.Nfsv4Stateid(0, new Uint8Array(12));
    return new msg.Nfsv4ReadRequest(sid, offset, count);
  },

  /**
   * WRITE - Write file data.
   * @param stateid - State ID to write to
   * @param offset - Byte offset
   * @param stable - Stable flag (Nfsv4StableHow)
   * @param data - Data to write
   */
  WRITE(stateid: structs.Nfsv4Stateid, offset: bigint, stable: number, data: Uint8Array): msg.Nfsv4WriteRequest {
    return new msg.Nfsv4WriteRequest(stateid, offset, stable, data);
  },

  /**
   * COMMIT - Commit written data to stable storage.
   * @param offset - Byte offset
   * @param count - Number of bytes
   */
  COMMIT(offset: bigint, count: number): msg.Nfsv4CommitRequest {
    return new msg.Nfsv4CommitRequest(offset, count);
  },

  /**
   * CREATE - Create a new file.
   * @param objtype - Object type to create
   * @param objname - Name of object to create
   * @param createattrs - Attributes for the new object
   */
  CREATE(objtype: structs.Nfsv4CreateType, objname: string, createattrs: structs.Nfsv4Fattr): msg.Nfsv4CreateRequest {
    return new msg.Nfsv4CreateRequest(objtype, objname, createattrs);
  },

  /**
   * LINK - Create a hard link.
   * @param newname - Name for the new link
   */
  LINK(newname: string): msg.Nfsv4LinkRequest {
    return new msg.Nfsv4LinkRequest(newname);
  },

  /**
   * READLINK - Read symbolic link.
   */
  READLINK(): msg.Nfsv4ReadlinkRequest {
    return new msg.Nfsv4ReadlinkRequest();
  },

  /**
   * SAVEFH - Save current filehandle.
   */
  SAVEFH(): msg.Nfsv4SavefhRequest {
    return new msg.Nfsv4SavefhRequest();
  },

  /**
   * RESTOREFH - Restore saved filehandle to current.
   */
  RESTOREFH(): msg.Nfsv4RestorefhRequest {
    return new msg.Nfsv4RestorefhRequest();
  },

  /**
   * SETATTR - Set file attributes.
   * @param stateid - State ID
   * @param attrs - Attributes to set
   */
  SETATTR(stateid: structs.Nfsv4Stateid, attrs: structs.Nfsv4Fattr): msg.Nfsv4SetattrRequest {
    return new msg.Nfsv4SetattrRequest(stateid, attrs);
  },

  /**
   * VERIFY - Verify attributes match.
   * @param attrs - Attributes to verify
   */
  VERIFY(attrs: structs.Nfsv4Fattr): msg.Nfsv4VerifyRequest {
    return new msg.Nfsv4VerifyRequest(attrs);
  },

  /**
   * NVERIFY - Verify attributes don't match.
   * @param attrs - Attributes to verify don't match
   */
  NVERIFY(attrs: structs.Nfsv4Fattr): msg.Nfsv4NverifyRequest {
    return new msg.Nfsv4NverifyRequest(attrs);
  },

  /**
   * REMOVE - Remove file or directory.
   * @param name - Name of file/directory to remove
   */
  REMOVE(name: string): msg.Nfsv4RemoveRequest {
    return new msg.Nfsv4RemoveRequest(name);
  },

  /**
   * RENAME - Rename file or directory.
   * @param oldname - Current name
   * @param newname - New name
   */
  RENAME(oldname: string, newname: string): msg.Nfsv4RenameRequest {
    return new msg.Nfsv4RenameRequest(oldname, newname);
  },

  /**
   * RENEW - Renew client lease.
   * @param clientid - Client ID
   */
  RENEW(clientid: bigint): msg.Nfsv4RenewRequest {
    return new msg.Nfsv4RenewRequest(clientid);
  },

  /**
   * SETCLIENTID - Establish client ID.
   * @param client - Client identifier
   * @param callback - Callback info
   * @param callbackIdent - Callback identifier
   */
  SETCLIENTID(
    client: structs.Nfsv4ClientId,
    callback: structs.Nfsv4CbClient,
    callbackIdent: number,
  ): msg.Nfsv4SetclientidRequest {
    return new msg.Nfsv4SetclientidRequest(client, callback, callbackIdent);
  },

  /**
   * SETCLIENTID_CONFIRM - Confirm client ID.
   * @param clientid - Client ID to confirm
   * @param verifier - Verifier from SETCLIENTID response
   */
  SETCLIENTID_CONFIRM(clientid: bigint, verifier: structs.Nfsv4Verifier): msg.Nfsv4SetclientidConfirmRequest {
    return new msg.Nfsv4SetclientidConfirmRequest(clientid, verifier);
  },

  /**
   * OPEN - Open a file.
   * @param seqid - Sequence ID for open-owner
   * @param shareAccess - Share access mode (OPEN4_SHARE_ACCESS_*)
   * @param shareDeny - Share deny mode (OPEN4_SHARE_DENY_*)
   * @param owner - Open owner (clientid + owner bytes)
   * @param openhow - Open how structure (use OpenHow helper)
   * @param claim - Open claim (use OpenClaim helper)
   */
  OPEN(
    seqid: number,
    shareAccess: number,
    shareDeny: number,
    owner: structs.Nfsv4OpenOwner,
    openhow: structs.Nfsv4OpenHow,
    claim: structs.Nfsv4OpenClaim,
  ): msg.Nfsv4OpenRequest {
    return new msg.Nfsv4OpenRequest(seqid, shareAccess, shareDeny, owner, openhow, claim);
  },

  /**
   * CLOSE - Close an open file.
   * @param seqid - Sequence ID
   * @param openStateid - State ID from OPEN
   */
  CLOSE(seqid: number, openStateid: structs.Nfsv4Stateid): msg.Nfsv4CloseRequest {
    return new msg.Nfsv4CloseRequest(seqid, openStateid);
  },

  /**
   * OPEN_CONFIRM - Confirm an open.
   * @param openStateid - State ID from OPEN
   * @param seqid - Sequence ID
   */
  OPEN_CONFIRM(openStateid: structs.Nfsv4Stateid, seqid: number): msg.Nfsv4OpenConfirmRequest {
    return new msg.Nfsv4OpenConfirmRequest(openStateid, seqid);
  },

  /**
   * OPEN_DOWNGRADE - Downgrade open access/deny modes.
   * @param openStateid - State ID from OPEN
   * @param seqid - Sequence ID
   * @param shareAccess - New share access mode
   * @param shareDeny - New share deny mode
   */
  OPEN_DOWNGRADE(
    openStateid: structs.Nfsv4Stateid,
    seqid: number,
    shareAccess: number,
    shareDeny: number,
  ): msg.Nfsv4OpenDowngradeRequest {
    return new msg.Nfsv4OpenDowngradeRequest(openStateid, seqid, shareAccess, shareDeny);
  },

  /**
   * OPENATTR - Open named attribute directory.
   * @param createdir - Whether to create the directory if it doesn't exist
   */
  OPENATTR(createdir: boolean = false): msg.Nfsv4OpenattrRequest {
    return new msg.Nfsv4OpenattrRequest(createdir);
  },

  /**
   * SECINFO - Get security information for a file.
   * @param name - Filename to get security info for
   */
  SECINFO(name: string): msg.Nfsv4SecinfoRequest {
    return new msg.Nfsv4SecinfoRequest(name);
  },

  /**
   * DELEGPURGE - Purge delegations (not supported).
   * @param clientid - Client ID
   */
  DELEGPURGE(clientid: bigint): msg.Nfsv4DelegpurgeRequest {
    return new msg.Nfsv4DelegpurgeRequest(clientid);
  },

  /**
   * DELEGRETURN - Return delegation (not supported).
   * @param stateid - Delegation stateid
   */
  DELEGRETURN(stateid: structs.Nfsv4Stateid): msg.Nfsv4DelegreturnRequest {
    return new msg.Nfsv4DelegreturnRequest(stateid);
  },

  /**
   * LOCK - Lock byte range.
   * @param locktype - Lock type (READ_LT, WRITE_LT, READW_LT, or WRITEW_LT)
   * @param reclaim - True if reclaiming lock after server restart
   * @param offset - Starting byte offset
   * @param length - Length in bytes (0xFFFFFFFFFFFFFFFF for EOF)
   * @param locker - Lock owner info (new or existing lock owner)
   */
  LOCK(
    locktype: Nfsv4LockType,
    reclaim: boolean,
    offset: bigint,
    length: bigint,
    locker: structs.Nfsv4LockOwnerInfo,
  ): msg.Nfsv4LockRequest {
    return new msg.Nfsv4LockRequest(locktype, reclaim, offset, length, locker);
  },

  /**
   * LOCKT - Test for conflicting lock (non-blocking).
   * @param locktype - Lock type (READ_LT or WRITE_LT)
   * @param offset - Starting byte offset
   * @param length - Length in bytes (0xFFFFFFFFFFFFFFFF for EOF)
   * @param owner - Lock owner
   */
  LOCKT(locktype: number, offset: bigint, length: bigint, owner: structs.Nfsv4LockOwner): msg.Nfsv4LocktRequest {
    return new msg.Nfsv4LocktRequest(locktype, offset, length, owner);
  },

  /**
   * LOCKU - Unlock byte range.
   * @param locktype - Lock type (READ_LT or WRITE_LT)
   * @param seqid - Sequence number
   * @param lockStateid - Lock stateid from LOCK operation
   * @param offset - Starting byte offset
   * @param length - Length in bytes
   */
  LOCKU(
    locktype: number,
    seqid: number,
    lockStateid: structs.Nfsv4Stateid,
    offset: bigint,
    length: bigint,
  ): msg.Nfsv4LockuRequest {
    return new msg.Nfsv4LockuRequest(locktype, seqid, lockStateid, offset, length);
  },

  /**
   * RELEASE_LOCKOWNER - Release all locks for a lock-owner.
   * @param lockOwner - Lock owner to release
   */
  RELEASE_LOCKOWNER(lockOwner: structs.Nfsv4LockOwner): msg.Nfsv4ReleaseLockOwnerRequest {
    return new msg.Nfsv4ReleaseLockOwnerRequest(lockOwner);
  },

  /**
   * Create an Nfsv4Verifier (8-byte opaque data).
   * @param data - 8-byte Uint8Array, defaults to zeros
   */
  Verifier(data?: Uint8Array): structs.Nfsv4Verifier {
    return new structs.Nfsv4Verifier(data || new Uint8Array(8));
  },

  /**
   * Create an Nfsv4Stateid (state identifier).
   * @param seqid - Sequence ID (default: 0)
   * @param other - 12-byte opaque data (default: zeros)
   */
  Stateid(seqid: number = 0, other?: Uint8Array): structs.Nfsv4Stateid {
    return new structs.Nfsv4Stateid(seqid, other || new Uint8Array(12));
  },

  /**
   * Create Nfsv4Fattr from attribute numbers (automatically converts to bitmap).
   * @param attrNums - Array of attribute numbers (Nfsv4Attr enum values)
   * @param attrVals - Encoded attribute values as byte array
   */
  Fattr(attrNums: number[], attrVals: Uint8Array): structs.Nfsv4Fattr {
    const bitmap = new structs.Nfsv4Bitmap(attrNumsToBitmap(attrNums));
    return new structs.Nfsv4Fattr(bitmap, attrVals);
  },

  /**
   * Create Nfsv4ClientId (client identifier).
   * @param verifier - 8-byte verifier
   * @param id - Variable-length client ID bytes
   */
  ClientId(verifier: structs.Nfsv4Verifier, id: Uint8Array): structs.Nfsv4ClientId {
    return new structs.Nfsv4ClientId(verifier, id);
  },

  /**
   * Create Nfsv4CbClient (callback client information).
   * @param cbProgram - Callback program number
   * @param rNetid - Network ID string (e.g., 'tcp', 'udp')
   * @param rAddr - Network address string (e.g., '127.0.0.1.8.1')
   */
  CbClient(cbProgram: number, rNetid: string, rAddr: string): structs.Nfsv4CbClient {
    const cbLocation = new structs.Nfsv4ClientAddr(rNetid, rAddr);
    return new structs.Nfsv4CbClient(cbProgram, cbLocation);
  },

  /**
   * Create Nfsv4Bitmap from attribute numbers.
   * @param attrNums - Array of attribute numbers (Nfsv4Attr enum values)
   */
  Bitmap(attrNums: number[]): structs.Nfsv4Bitmap {
    return new structs.Nfsv4Bitmap(attrNumsToBitmap(attrNums));
  },

  /**
   * Create Nfsv4CreateType for regular file creation.
   */
  CreateTypeFile(): structs.Nfsv4CreateType {
    return new structs.Nfsv4CreateType(Nfsv4FType.NF4REG, new structs.Nfsv4CreateTypeVoid());
  },

  /**
   * Create Nfsv4CreateType for directory creation.
   */
  CreateTypeDir(): structs.Nfsv4CreateType {
    return new structs.Nfsv4CreateType(Nfsv4FType.NF4DIR, new structs.Nfsv4CreateTypeVoid());
  },

  /**
   * Create Nfsv4OpenOwner (open owner identifier).
   * @param clientid - Client ID
   * @param owner - Owner bytes (unique identifier)
   */
  OpenOwner(clientid: bigint, owner: Uint8Array): structs.Nfsv4OpenOwner {
    return new structs.Nfsv4OpenOwner(clientid, owner);
  },

  /**
   * Create Nfsv4OpenClaim for CLAIM_NULL (open by filename).
   * @param filename - Name of file to open
   */
  OpenClaimNull(filename: string): structs.Nfsv4OpenClaim {
    return new structs.Nfsv4OpenClaim(0, new structs.Nfsv4OpenClaimNull(filename));
  },

  /**
   * Create Nfsv4OpenHow for OPEN4_NOCREATE (open existing file).
   */
  OpenHowNoCreate(): structs.Nfsv4OpenHow {
    return new structs.Nfsv4OpenHow(Nfsv4OpenFlags.OPEN4_NOCREATE);
  },

  /**
   * Create Nfsv4OpenHow for OPEN4_CREATE with UNCHECKED4 mode.
   * @param createattrs - Optional file attributes to set on create
   */
  OpenHowCreateUnchecked(createattrs?: structs.Nfsv4Fattr): structs.Nfsv4OpenHow {
    const attrs = createattrs || new structs.Nfsv4Fattr(new structs.Nfsv4Bitmap([]), new Uint8Array(0));
    const how = new structs.Nfsv4CreateHow(Nfsv4CreateMode.UNCHECKED4, new structs.Nfsv4CreateAttrs(attrs));
    return new structs.Nfsv4OpenHow(Nfsv4OpenFlags.OPEN4_CREATE, how);
  },

  /**
   * Create Nfsv4OpenHow for OPEN4_CREATE with GUARDED4 mode.
   * @param createattrs - Optional file attributes to set on create
   */
  OpenHowCreateGuarded(createattrs?: structs.Nfsv4Fattr): structs.Nfsv4OpenHow {
    const attrs = createattrs || new structs.Nfsv4Fattr(new structs.Nfsv4Bitmap([]), new Uint8Array(0));
    const how = new structs.Nfsv4CreateHow(Nfsv4CreateMode.GUARDED4, new structs.Nfsv4CreateAttrs(attrs));
    return new structs.Nfsv4OpenHow(Nfsv4OpenFlags.OPEN4_CREATE, how);
  },

  /**
   * Create Nfsv4OpenHow for OPEN4_CREATE with EXCLUSIVE4 mode.
   * @param verifier - 8-byte verifier for exclusive create
   */
  OpenHowCreateExclusive(verifier: structs.Nfsv4Verifier): structs.Nfsv4OpenHow {
    const how = new structs.Nfsv4CreateHow(Nfsv4CreateMode.EXCLUSIVE4, new structs.Nfsv4CreateVerf(verifier));
    return new structs.Nfsv4OpenHow(Nfsv4OpenFlags.OPEN4_CREATE, how);
  },

  /**
   * Create Nfsv4LockOwner (lock owner identifier).
   * @param clientid - Client ID
   * @param owner - Owner bytes (unique identifier)
   */
  LockOwner(clientid: bigint, owner: Uint8Array): structs.Nfsv4LockOwner {
    return new structs.Nfsv4LockOwner(clientid, owner);
  },

  /**
   * Create Nfsv4LockOwnerInfo for new lock owner (open_to_lock_owner).
   * @param openSeqid - Current open-owner seqid
   * @param openStateid - Open stateid from OPEN operation
   * @param lockSeqid - Initial lock-owner seqid (typically 0)
   * @param lockOwner - Lock owner identifier
   */
  NewLockOwner(
    openSeqid: number,
    openStateid: structs.Nfsv4Stateid,
    lockSeqid: number,
    lockOwner: structs.Nfsv4LockOwner,
  ): structs.Nfsv4LockOwnerInfo {
    const openToLockOwner = new structs.Nfsv4OpenToLockOwner(openSeqid, openStateid, lockSeqid, lockOwner);
    return new structs.Nfsv4LockOwnerInfo(true, new structs.Nfsv4LockNewOwner(openToLockOwner));
  },

  /**
   * Create Nfsv4LockOwnerInfo for existing lock owner.
   * @param lockStateid - Lock stateid from previous LOCK operation
   * @param lockSeqid - Lock-owner seqid
   */
  ExistingLockOwner(lockStateid: structs.Nfsv4Stateid, lockSeqid: number): structs.Nfsv4LockOwnerInfo {
    const owner = new structs.Nfsv4LockExistingOwner(lockStateid, lockSeqid);
    return new structs.Nfsv4LockOwnerInfo(false, owner);
  },

  /**
   * ILLEGAL - Illegal operation (for testing RFC 7530 §15.2.4 compliance).
   * This operation is used to test server handling of illegal operation codes.
   * Per RFC 7530, the server should respond with NFS4ERR_OP_ILLEGAL.
   */
  ILLEGAL(): msg.Nfsv4IllegalRequest {
    return new msg.Nfsv4IllegalRequest();
  },
};
