import type {Nfsv3FType, Nfsv3TimeHow, Nfsv3StableHow, Nfsv3CreateMode} from './constants';

/**
 * NFSv3 time structure (seconds and nanoseconds since epoch)
 */
export class Nfsv3Time {
  constructor(
    public readonly seconds: number,
    public readonly nseconds: number,
  ) {}
}

/**
 * Special device file data (major/minor device numbers)
 */
export class Nfsv3SpecData {
  constructor(
    public readonly specdata1: number,
    public readonly specdata2: number,
  ) {}
}

/**
 * NFSv3 file handle
 */
export class Nfsv3Fh {
  constructor(public readonly data: Uint8Array) {}
}

/**
 * Set mode discriminated union
 */
export class Nfsv3SetMode {
  constructor(
    public readonly set: boolean,
    public readonly mode?: number,
  ) {}
}

/**
 * Set uid discriminated union
 */
export class Nfsv3SetUid {
  constructor(
    public readonly set: boolean,
    public readonly uid?: number,
  ) {}
}

/**
 * Set gid discriminated union
 */
export class Nfsv3SetGid {
  constructor(
    public readonly set: boolean,
    public readonly gid?: number,
  ) {}
}

/**
 * Set size discriminated union
 */
export class Nfsv3SetSize {
  constructor(
    public readonly set: boolean,
    public readonly size?: bigint,
  ) {}
}

/**
 * Set atime discriminated union
 */
export class Nfsv3SetAtime {
  constructor(
    public readonly how: Nfsv3TimeHow,
    public readonly atime?: Nfsv3Time,
  ) {}
}

/**
 * Set mtime discriminated union
 */
export class Nfsv3SetMtime {
  constructor(
    public readonly how: Nfsv3TimeHow,
    public readonly mtime?: Nfsv3Time,
  ) {}
}

/**
 * Settable file attributes
 */
export class Nfsv3Sattr {
  constructor(
    public readonly mode: Nfsv3SetMode,
    public readonly uid: Nfsv3SetUid,
    public readonly gid: Nfsv3SetGid,
    public readonly size: Nfsv3SetSize,
    public readonly atime: Nfsv3SetAtime,
    public readonly mtime: Nfsv3SetMtime,
  ) {}
}

/**
 * Guard for SETATTR operation
 */
export class Nfsv3SattrGuard {
  constructor(
    public readonly check: boolean,
    public readonly objCtime?: Nfsv3Time,
  ) {}
}

/**
 * Directory operation arguments (file handle + name)
 */
export class Nfsv3DirOpArgs {
  constructor(
    public readonly dir: Nfsv3Fh,
    public readonly name: string,
  ) {}
}

/**
 * Weak cache consistency attributes subset
 */
export class Nfsv3WccAttr {
  constructor(
    public readonly size: bigint,
    public readonly mtime: Nfsv3Time,
    public readonly ctime: Nfsv3Time,
  ) {}
}

/**
 * Pre-operation attributes
 */
export class Nfsv3PreOpAttr {
  constructor(
    public readonly attributesFollow: boolean,
    public readonly attributes?: Nfsv3WccAttr,
  ) {}
}

/**
 * Post-operation attributes
 */
export class Nfsv3PostOpAttr {
  constructor(
    public readonly attributesFollow: boolean,
    public readonly attributes?: Nfsv3Fattr,
  ) {}
}

/**
 * Post-operation file handle
 */
export class Nfsv3PostOpFh {
  constructor(
    public readonly handleFollows: boolean,
    public readonly handle?: Nfsv3Fh,
  ) {}
}

/**
 * Weak cache consistency data
 */
export class Nfsv3WccData {
  constructor(
    public readonly before: Nfsv3PreOpAttr,
    public readonly after: Nfsv3PostOpAttr,
  ) {}
}

/**
 * File attributes structure
 */
export class Nfsv3Fattr {
  constructor(
    public readonly type: Nfsv3FType,
    public readonly mode: number,
    public readonly nlink: number,
    public readonly uid: number,
    public readonly gid: number,
    public readonly size: bigint,
    public readonly used: bigint,
    public readonly rdev: Nfsv3SpecData,
    public readonly fsid: bigint,
    public readonly fileid: bigint,
    public readonly atime: Nfsv3Time,
    public readonly mtime: Nfsv3Time,
    public readonly ctime: Nfsv3Time,
  ) {}
}

/**
 * Device file specification for MKNOD
 */
export class Nfsv3DeviceData {
  constructor(
    public readonly devAttributes: Nfsv3Sattr,
    public readonly spec: Nfsv3SpecData,
  ) {}
}

/**
 * MKNOD data discriminated union
 */
export class Nfsv3MknodData {
  constructor(
    public readonly type: Nfsv3FType,
    public readonly chr?: Nfsv3DeviceData,
    public readonly blk?: Nfsv3DeviceData,
    public readonly sock?: Nfsv3Sattr,
    public readonly pipe?: Nfsv3Sattr,
  ) {}
}

/**
 * How to create file for CREATE operation
 */
export class Nfsv3CreateHow {
  constructor(
    public readonly mode: Nfsv3CreateMode,
    public readonly objAttributes?: Nfsv3Sattr,
    public readonly verf?: Uint8Array,
  ) {}
}

/**
 * Stable storage guarantee for WRITE
 */
export class Nfsv3WriteHow {
  constructor(public readonly stable: Nfsv3StableHow) {}
}

/**
 * Directory entry for READDIR
 */
export class Nfsv3Entry {
  constructor(
    public readonly fileid: bigint,
    public readonly name: string,
    public readonly cookie: bigint,
    public readonly nextentry?: Nfsv3Entry,
  ) {}
}

/**
 * Directory entry for READDIRPLUS
 */
export class Nfsv3EntryPlus {
  constructor(
    public readonly fileid: bigint,
    public readonly name: string,
    public readonly cookie: bigint,
    public readonly nameAttributes: Nfsv3PostOpAttr,
    public readonly nameHandle: Nfsv3PostOpFh,
    public readonly nextentry?: Nfsv3EntryPlus,
  ) {}
}

/**
 * Directory list for READDIR
 */
export class Nfsv3DirList {
  constructor(
    public readonly eof: boolean,
    public readonly entries?: Nfsv3Entry,
  ) {}
}

/**
 * Directory list for READDIRPLUS
 */
export class Nfsv3DirListPlus {
  constructor(
    public readonly eof: boolean,
    public readonly entries?: Nfsv3EntryPlus,
  ) {}
}
