import type {XdrDecoder, XdrEncoder, XdrType} from '../../xdr';
import type {Nfsv4FType, Nfsv4TimeHow, Nfsv4DelegType} from './constants';

/**
 * NFSv4 time structure (seconds and nanoseconds since epoch)
 */
export class Nfsv4Time implements XdrType {
  constructor(
    public readonly seconds: bigint,
    public readonly nseconds: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeHyper(this.seconds);
    xdr.writeUnsignedInt(this.nseconds);
  }
}

/**
 * Special device file data (major/minor device numbers)
 */
export class Nfsv4SpecData implements XdrType {
  constructor(
    public readonly specdata1: number,
    public readonly specdata2: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.specdata1);
    xdr.writeUnsignedInt(this.specdata2);
  }
}

/**
 * NFSv4 file handle
 */
export class Nfsv4Fh implements XdrType {
  constructor(public readonly data: Uint8Array) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeVarlenOpaque(this.data);
  }
}

/**
 * NFSv4 verifier (8 bytes)
 */
export class Nfsv4Verifier implements XdrType {
  constructor(public readonly data: Uint8Array) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeOpaque(this.data);
  }
}

/**
 * File system identifier
 */
export class Nfsv4Fsid implements XdrType {
  constructor(
    public readonly major: bigint,
    public readonly minor: bigint,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedHyper(this.major);
    xdr.writeUnsignedHyper(this.minor);
  }
}

/**
 * Stateid structure for state management
 */
export class Nfsv4Stateid implements XdrType {
  static decode(xdr: XdrDecoder): Nfsv4Stateid {
    const seqid = xdr.readUnsignedInt();
    const other = xdr.readOpaque(12);
    return new Nfsv4Stateid(seqid, other);
  }

  constructor(
    public readonly seqid: number,
    public readonly other: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.seqid);
    xdr.writeOpaque(this.other);
  }
}

/**
 * Change information for directory operations
 */
export class Nfsv4ChangeInfo implements XdrType {
  constructor(
    public readonly atomic: boolean,
    public readonly before: bigint,
    public readonly after: bigint,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeBoolean(this.atomic);
    xdr.writeUnsignedHyper(this.before);
    xdr.writeUnsignedHyper(this.after);
  }
}

/**
 * Set time discriminated union
 */
export class Nfsv4SetTime implements XdrType {
  constructor(
    public readonly how: Nfsv4TimeHow,
    public readonly time?: Nfsv4Time,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.how);
    if (this.time) {
      this.time.encode(xdr);
    }
  }
}

/**
 * Bitmap for attribute mask
 */
export class Nfsv4Bitmap implements XdrType {
  constructor(public readonly mask: number[]) {}

  encode(xdr: XdrEncoder): void {
    const mask = this.mask;
    const length = mask.length;
    xdr.writeUnsignedInt(length);
    for (let i = 0; i < length; i++) xdr.writeUnsignedInt(mask[i]);
  }
}

/**
 * File attributes structure
 */
export class Nfsv4Fattr implements XdrType {
  constructor(
    public readonly attrmask: Nfsv4Bitmap,
    public readonly attrVals: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.attrmask.encode(xdr);
    xdr.writeVarlenOpaque(this.attrVals);
  }
}

/**
 * Client address for callbacks
 */
export class Nfsv4ClientAddr implements XdrType {
  constructor(
    public readonly rNetid: string,
    public readonly rAddr: string,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeStr(this.rNetid);
    xdr.writeStr(this.rAddr);
  }
}

/**
 * Callback client information
 */
export class Nfsv4CbClient implements XdrType {
  constructor(
    public readonly cbProgram: number,
    public readonly cbLocation: Nfsv4ClientAddr,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.cbProgram);
    this.cbLocation.encode(xdr);
  }
}

/**
 * NFS client identifier
 */
export class Nfsv4ClientId implements XdrType {
  constructor(
    public readonly verifier: Nfsv4Verifier,
    public readonly id: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.verifier.encode(xdr);
    xdr.writeVarlenOpaque(this.id);
  }
}

/**
 * Open owner identification
 */
export class Nfsv4OpenOwner implements XdrType {
  constructor(
    public readonly clientid: bigint,
    public readonly owner: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedHyper(this.clientid);
    xdr.writeVarlenOpaque(this.owner);
  }
}

/**
 * Lock owner identification
 */
export class Nfsv4LockOwner implements XdrType {
  constructor(
    public readonly clientid: bigint,
    public readonly owner: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedHyper(this.clientid);
    xdr.writeVarlenOpaque(this.owner);
  }
}

/**
 * Open to lock owner transition
 */
export class Nfsv4OpenToLockOwner implements XdrType {
  constructor(
    public readonly openSeqid: number,
    public readonly openStateid: Nfsv4Stateid,
    public readonly lockSeqid: number,
    public readonly lockOwner: Nfsv4LockOwner,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.openSeqid);
    this.openStateid.encode(xdr);
    xdr.writeUnsignedInt(this.lockSeqid);
    this.lockOwner.encode(xdr);
  }
}

/**
 * File system location
 */
export class Nfsv4FsLocation implements XdrType {
  constructor(
    public readonly server: string[],
    public readonly rootpath: string[],
  ) {}

  encode(xdr: XdrEncoder): void {
    const {server, rootpath} = this;
    const serverLen = server.length;
    xdr.writeUnsignedInt(serverLen);
    for (let i = 0; i < serverLen; i++) xdr.writeStr(server[i]);
    const rootpathLen = rootpath.length;
    xdr.writeUnsignedInt(rootpathLen);
    for (let i = 0; i < rootpathLen; i++) xdr.writeStr(rootpath[i]);
  }
}

/**
 * File system locations for migration/replication
 */
export class Nfsv4FsLocations implements XdrType {
  constructor(
    public readonly fsRoot: string[],
    public readonly locations: Nfsv4FsLocation[],
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.fsRoot.length);
    const {fsRoot, locations} = this;
    const fsRootLen = fsRoot.length;
    for (let i = 0; i < fsRootLen; i++) xdr.writeStr(fsRoot[i]);
    const locationsLen = locations.length;
    xdr.writeUnsignedInt(locationsLen);
    for (let i = 0; i < locationsLen; i++) locations[i].encode(xdr);
  }
}

/**
 * Access Control Entry (ACE)
 */
export class Nfsv4Ace implements XdrType {
  constructor(
    public readonly type: number,
    public readonly flag: number,
    public readonly accessMask: number,
    public readonly who: string,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.type);
    xdr.writeUnsignedInt(this.flag);
    xdr.writeUnsignedInt(this.accessMask);
    xdr.writeStr(this.who);
  }
}

/**
 * Access Control List
 */
export class Nfsv4Acl implements XdrType {
  constructor(public readonly aces: Nfsv4Ace[]) {}

  encode(xdr: XdrEncoder): void {
    const aces = this.aces;
    const length = aces.length;
    xdr.writeUnsignedInt(length);
    for (let i = 0; i < length; i++) aces[i].encode(xdr);
  }
}

/**
 * Security information
 */
export class Nfsv4SecInfo implements XdrType {
  constructor(
    public readonly flavor: number,
    public readonly flavorInfo?: Uint8Array,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.flavor);
    const flavorInfo = this.flavorInfo;
    if (flavorInfo) xdr.writeVarlenOpaque(flavorInfo);
  }
}

/**
 * Open create attributes for UNCHECKED4 and GUARDED4 modes
 */
export class Nfsv4CreateAttrs implements XdrType {
  constructor(public readonly createattrs: Nfsv4Fattr) {}

  encode(xdr: XdrEncoder): void {
    this.createattrs.encode(xdr);
  }
}

/**
 * Open create attributes for EXCLUSIVE4 mode
 */
export class Nfsv4CreateVerf implements XdrType {
  constructor(public readonly createverf: Nfsv4Verifier) {}

  encode(xdr: XdrEncoder): void {
    this.createverf.encode(xdr);
  }
}

/**
 * Open create mode discriminated union
 */
export class Nfsv4CreateHow implements XdrType {
  constructor(
    public readonly mode: number,
    public readonly how?: Nfsv4CreateAttrs | Nfsv4CreateVerf,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.mode);
    this.how?.encode(xdr);
  }
}

/**
 * Open how discriminated union
 */
export class Nfsv4OpenHow implements XdrType {
  constructor(
    public readonly opentype: number,
    public readonly how?: Nfsv4CreateHow,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.opentype);
    this.how?.encode(xdr);
  }
}

/**
 * Open claim - claim file by name
 */
export class Nfsv4OpenClaimNull implements XdrType {
  constructor(public readonly file: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeStr(this.file);
  }
}

/**
 * Open claim - reclaim after server restart
 */
export class Nfsv4OpenClaimPrevious implements XdrType {
  constructor(public readonly delegateType: Nfsv4DelegType) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.delegateType);
  }
}

/**
 * Open claim - claim file delegated to client
 */
export class Nfsv4OpenClaimDelegateCur implements XdrType {
  constructor(
    public readonly delegateStateid: Nfsv4Stateid,
    public readonly file: string,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.delegateStateid.encode(xdr);
    xdr.writeStr(this.file);
  }
}

/**
 * Open claim - reclaim delegation after client restart
 */
export class Nfsv4OpenClaimDelegatePrev implements XdrType {
  constructor(public readonly file: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeStr(this.file);
  }
}

/**
 * Open claim discriminated union
 */
export class Nfsv4OpenClaim implements XdrType {
  constructor(
    public readonly claimType: number,
    public readonly claim:
      | Nfsv4OpenClaimNull
      | Nfsv4OpenClaimPrevious
      | Nfsv4OpenClaimDelegateCur
      | Nfsv4OpenClaimDelegatePrev,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.claimType);
    this.claim.encode(xdr);
  }
}

/**
 * Read delegation
 */
export class Nfsv4OpenReadDelegation implements XdrType {
  constructor(
    public readonly stateid: Nfsv4Stateid,
    public readonly recall: boolean,
    public readonly permissions: Nfsv4Ace[],
  ) {}

  encode(xdr: XdrEncoder): void {
    this.stateid.encode(xdr);
    xdr.writeBoolean(this.recall);
    const permissions = this.permissions;
    const length = permissions.length;
    xdr.writeUnsignedInt(length);
    for (let i = 0; i < length; i++) permissions[i].encode(xdr);
  }
}

/**
 * Write delegation
 */
export class Nfsv4OpenWriteDelegation implements XdrType {
  constructor(
    public readonly stateid: Nfsv4Stateid,
    public readonly recall: boolean,
    public readonly spaceLimit: bigint,
    public readonly permissions: Nfsv4Ace[],
  ) {}

  encode(xdr: XdrEncoder): void {
    this.stateid.encode(xdr);
    xdr.writeBoolean(this.recall);
    xdr.writeUnsignedHyper(this.spaceLimit);
    const permissions = this.permissions;
    const length = permissions.length;
    xdr.writeUnsignedInt(length);
    for (let i = 0; i < length; i++) permissions[i].encode(xdr);
  }
}

/**
 * Open delegation discriminated union
 */
export class Nfsv4OpenDelegation implements XdrType {
  constructor(
    public readonly delegationType: Nfsv4DelegType,
    public readonly delegation?: Nfsv4OpenReadDelegation | Nfsv4OpenWriteDelegation,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.delegationType);
    this.delegation?.encode(xdr);
  }
}

/**
 * Directory entry for READDIR
 */
export class Nfsv4Entry implements XdrType {
  constructor(
    public readonly cookie: bigint,
    public readonly name: string,
    public readonly attrs: Nfsv4Fattr,
    public readonly nextEntry?: Nfsv4Entry,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedHyper(this.cookie);
    xdr.writeStr(this.name);
    this.attrs.encode(xdr);
  }
}

/**
 * Lock request with new lock owner
 */
export class Nfsv4LockNewOwner implements XdrType {
  constructor(public readonly openToLockOwner: Nfsv4OpenToLockOwner) {}

  encode(xdr: XdrEncoder): void {
    this.openToLockOwner.encode(xdr);
  }
}

/**
 * Lock request with existing lock owner
 */
export class Nfsv4LockExistingOwner implements XdrType {
  constructor(
    public readonly lockStateid: Nfsv4Stateid,
    public readonly lockSeqid: number,
  ) {}

  encode(xdr: XdrEncoder): void {
    this.lockStateid.encode(xdr);
    xdr.writeUnsignedInt(this.lockSeqid);
  }
}

/**
 * Lock owner discriminated union
 */
export class Nfsv4LockOwnerInfo implements XdrType {
  constructor(
    public readonly newLockOwner: boolean,
    public readonly owner: Nfsv4LockNewOwner | Nfsv4LockExistingOwner,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeBoolean(this.newLockOwner);
    this.owner.encode(xdr);
  }
}

/**
 * Create type for symbolic link
 */
export class Nfsv4CreateTypeLink implements XdrType {
  constructor(public readonly linkdata: string) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeStr(this.linkdata);
  }
}

/**
 * Create type for device files
 */
export class Nfsv4CreateTypeDevice implements XdrType {
  constructor(public readonly devdata: Nfsv4SpecData) {}

  encode(xdr: XdrEncoder): void {
    this.devdata.encode(xdr);
  }
}

/**
 * Create type for other file types (void)
 */
export class Nfsv4CreateTypeVoid implements XdrType {
  encode(xdr: XdrEncoder): void {}
}

/**
 * Create type discriminated union
 */
export class Nfsv4CreateType implements XdrType {
  constructor(
    public readonly type: Nfsv4FType,
    public readonly objtype: Nfsv4CreateTypeLink | Nfsv4CreateTypeDevice | Nfsv4CreateTypeVoid,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.type);
    this.objtype.encode(xdr);
  }
}

/**
 * RPCSEC_GSS service
 */
export const enum Nfsv4RpcSecGssService {
  RPC_GSS_SVC_NONE = 1,
  RPC_GSS_SVC_INTEGRITY = 2,
  RPC_GSS_SVC_PRIVACY = 3,
}

/**
 * RPCSEC_GSS information
 */
export class Nfsv4RpcSecGssInfo implements XdrType {
  constructor(
    public readonly oid: Uint8Array,
    public readonly qop: number,
    public readonly service: Nfsv4RpcSecGssService,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeVarlenOpaque(this.oid);
    xdr.writeUnsignedInt(this.qop);
    xdr.writeUnsignedInt(this.service);
  }
}

/**
 * Security flavor info discriminated union
 */
export class Nfsv4SecInfoFlavor implements XdrType {
  constructor(
    public readonly flavor: number,
    public readonly flavorInfo?: Nfsv4RpcSecGssInfo,
  ) {}

  encode(xdr: XdrEncoder): void {
    xdr.writeUnsignedInt(this.flavor);
    this.flavorInfo?.encode(xdr);
  }
}
