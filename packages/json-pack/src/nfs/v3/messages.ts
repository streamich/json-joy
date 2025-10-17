import type {Nfsv3Stat} from './constants';
import type * as stucts from './structs';

export type Nfsv3Message = Nfsv3Request | Nfsv3Response;

export type Nfsv3Request =
  | Nfsv3GetattrRequest
  | Nfsv3SetattrRequest
  | Nfsv3LookupRequest
  | Nfsv3AccessRequest
  | Nfsv3ReadlinkRequest
  | Nfsv3ReadRequest
  | Nfsv3WriteRequest
  | Nfsv3CreateRequest
  | Nfsv3MkdirRequest
  | Nfsv3SymlinkRequest
  | Nfsv3MknodRequest
  | Nfsv3RemoveRequest
  | Nfsv3RmdirRequest
  | Nfsv3RenameRequest
  | Nfsv3LinkRequest
  | Nfsv3ReaddirRequest
  | Nfsv3ReaddirplusRequest
  | Nfsv3FsstatRequest
  | Nfsv3FsinfoRequest
  | Nfsv3PathconfRequest
  | Nfsv3CommitRequest;

export type Nfsv3Response =
  | Nfsv3GetattrResponse
  | Nfsv3SetattrResponse
  | Nfsv3LookupResponse
  | Nfsv3AccessResponse
  | Nfsv3ReadlinkResponse
  | Nfsv3ReadResponse
  | Nfsv3WriteResponse
  | Nfsv3CreateResponse
  | Nfsv3MkdirResponse
  | Nfsv3SymlinkResponse
  | Nfsv3MknodResponse
  | Nfsv3RemoveResponse
  | Nfsv3RmdirResponse
  | Nfsv3RenameResponse
  | Nfsv3LinkResponse
  | Nfsv3ReaddirResponse
  | Nfsv3ReaddirplusResponse
  | Nfsv3FsstatResponse
  | Nfsv3FsinfoResponse
  | Nfsv3PathconfResponse
  | Nfsv3CommitResponse;
/**
 * GETATTR request
 */
export class Nfsv3GetattrRequest {
  constructor(public readonly object: stucts.Nfsv3Fh) {}
}

/**
 * GETATTR response - success case
 */
export class Nfsv3GetattrResOk {
  constructor(public readonly objAttributes: stucts.Nfsv3Fattr) {}
}

/**
 * GETATTR response
 */
export class Nfsv3GetattrResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3GetattrResOk,
  ) {}
}

/**
 * SETATTR request
 */
export class Nfsv3SetattrRequest {
  constructor(
    public readonly object: stucts.Nfsv3Fh,
    public readonly newAttributes: stucts.Nfsv3Sattr,
    public readonly guard: stucts.Nfsv3SattrGuard,
  ) {}
}

/**
 * SETATTR response - success case
 */
export class Nfsv3SetattrResOk {
  constructor(public readonly objWcc: stucts.Nfsv3WccData) {}
}

/**
 * SETATTR response - failure case
 */
export class Nfsv3SetattrResFail {
  constructor(public readonly objWcc: stucts.Nfsv3WccData) {}
}

/**
 * SETATTR response
 */
export class Nfsv3SetattrResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3SetattrResOk,
    public readonly resfail?: Nfsv3SetattrResFail,
  ) {}
}

/**
 * LOOKUP request
 */
export class Nfsv3LookupRequest {
  constructor(public readonly what: stucts.Nfsv3DirOpArgs) {}
}

/**
 * LOOKUP response - success case
 */
export class Nfsv3LookupResOk {
  constructor(
    public readonly object: stucts.Nfsv3Fh,
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly dirAttributes: stucts.Nfsv3PostOpAttr,
  ) {}
}

/**
 * LOOKUP response - failure case
 */
export class Nfsv3LookupResFail {
  constructor(public readonly dirAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * LOOKUP response
 */
export class Nfsv3LookupResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3LookupResOk,
    public readonly resfail?: Nfsv3LookupResFail,
  ) {}
}

/**
 * ACCESS request
 */
export class Nfsv3AccessRequest {
  constructor(
    public readonly object: stucts.Nfsv3Fh,
    public readonly access: number,
  ) {}
}

/**
 * ACCESS response - success case
 */
export class Nfsv3AccessResOk {
  constructor(
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly access: number,
  ) {}
}

/**
 * ACCESS response - failure case
 */
export class Nfsv3AccessResFail {
  constructor(public readonly objAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * ACCESS response
 */
export class Nfsv3AccessResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3AccessResOk,
    public readonly resfail?: Nfsv3AccessResFail,
  ) {}
}

/**
 * READLINK request
 */
export class Nfsv3ReadlinkRequest {
  constructor(public readonly symlink: stucts.Nfsv3Fh) {}
}

/**
 * READLINK response - success case
 */
export class Nfsv3ReadlinkResOk {
  constructor(
    public readonly symlinkAttributes: stucts.Nfsv3PostOpAttr,
    public readonly data: string,
  ) {}
}

/**
 * READLINK response - failure case
 */
export class Nfsv3ReadlinkResFail {
  constructor(public readonly symlinkAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * READLINK response
 */
export class Nfsv3ReadlinkResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3ReadlinkResOk,
    public readonly resfail?: Nfsv3ReadlinkResFail,
  ) {}
}

/**
 * READ request
 */
export class Nfsv3ReadRequest {
  constructor(
    public readonly file: stucts.Nfsv3Fh,
    public readonly offset: bigint,
    public readonly count: number,
  ) {}
}

/**
 * READ response - success case
 */
export class Nfsv3ReadResOk {
  constructor(
    public readonly fileAttributes: stucts.Nfsv3PostOpAttr,
    public readonly count: number,
    public readonly eof: boolean,
    public readonly data: Uint8Array,
  ) {}
}

/**
 * READ response - failure case
 */
export class Nfsv3ReadResFail {
  constructor(public readonly fileAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * READ response
 */
export class Nfsv3ReadResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3ReadResOk,
    public readonly resfail?: Nfsv3ReadResFail,
  ) {}
}

/**
 * WRITE request
 */
export class Nfsv3WriteRequest {
  constructor(
    public readonly file: stucts.Nfsv3Fh,
    public readonly offset: bigint,
    public readonly count: number,
    public readonly stable: number,
    public readonly data: Uint8Array,
  ) {}
}

/**
 * WRITE response - success case
 */
export class Nfsv3WriteResOk {
  constructor(
    public readonly fileWcc: stucts.Nfsv3WccData,
    public readonly count: number,
    public readonly committed: number,
    public readonly verf: Uint8Array,
  ) {}
}

/**
 * WRITE response - failure case
 */
export class Nfsv3WriteResFail {
  constructor(public readonly fileWcc: stucts.Nfsv3WccData) {}
}

/**
 * WRITE response
 */
export class Nfsv3WriteResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3WriteResOk,
    public readonly resfail?: Nfsv3WriteResFail,
  ) {}
}

/**
 * CREATE request
 */
export class Nfsv3CreateRequest {
  constructor(
    public readonly where: stucts.Nfsv3DirOpArgs,
    public readonly how: stucts.Nfsv3CreateHow,
  ) {}
}

/**
 * CREATE response - success case
 */
export class Nfsv3CreateResOk {
  constructor(
    public readonly obj: stucts.Nfsv3PostOpFh,
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly dirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * CREATE response - failure case
 */
export class Nfsv3CreateResFail {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * CREATE response
 */
export class Nfsv3CreateResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3CreateResOk,
    public readonly resfail?: Nfsv3CreateResFail,
  ) {}
}

/**
 * MKDIR request
 */
export class Nfsv3MkdirRequest {
  constructor(
    public readonly where: stucts.Nfsv3DirOpArgs,
    public readonly attributes: stucts.Nfsv3Sattr,
  ) {}
}

/**
 * MKDIR response - success case
 */
export class Nfsv3MkdirResOk {
  constructor(
    public readonly obj: stucts.Nfsv3PostOpFh,
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly dirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * MKDIR response - failure case
 */
export class Nfsv3MkdirResFail {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * MKDIR response
 */
export class Nfsv3MkdirResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3MkdirResOk,
    public readonly resfail?: Nfsv3MkdirResFail,
  ) {}
}

/**
 * SYMLINK request
 */
export class Nfsv3SymlinkRequest {
  constructor(
    public readonly where: stucts.Nfsv3DirOpArgs,
    public readonly symlinkAttributes: stucts.Nfsv3Sattr,
    public readonly symlinkData: string,
  ) {}
}

/**
 * SYMLINK response - success case
 */
export class Nfsv3SymlinkResOk {
  constructor(
    public readonly obj: stucts.Nfsv3PostOpFh,
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly dirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * SYMLINK response - failure case
 */
export class Nfsv3SymlinkResFail {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * SYMLINK response
 */
export class Nfsv3SymlinkResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3SymlinkResOk,
    public readonly resfail?: Nfsv3SymlinkResFail,
  ) {}
}

/**
 * MKNOD request
 */
export class Nfsv3MknodRequest {
  constructor(
    public readonly where: stucts.Nfsv3DirOpArgs,
    public readonly what: stucts.Nfsv3MknodData,
  ) {}
}

/**
 * MKNOD response - success case
 */
export class Nfsv3MknodResOk {
  constructor(
    public readonly obj: stucts.Nfsv3PostOpFh,
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly dirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * MKNOD response - failure case
 */
export class Nfsv3MknodResFail {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * MKNOD response
 */
export class Nfsv3MknodResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3MknodResOk,
    public readonly resfail?: Nfsv3MknodResFail,
  ) {}
}

/**
 * REMOVE request
 */
export class Nfsv3RemoveRequest {
  constructor(public readonly object: stucts.Nfsv3DirOpArgs) {}
}

/**
 * REMOVE response - success case
 */
export class Nfsv3RemoveResOk {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * REMOVE response - failure case
 */
export class Nfsv3RemoveResFail {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * REMOVE response
 */
export class Nfsv3RemoveResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3RemoveResOk,
    public readonly resfail?: Nfsv3RemoveResFail,
  ) {}
}

/**
 * RMDIR request
 */
export class Nfsv3RmdirRequest {
  constructor(public readonly object: stucts.Nfsv3DirOpArgs) {}
}

/**
 * RMDIR response - success case
 */
export class Nfsv3RmdirResOk {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * RMDIR response - failure case
 */
export class Nfsv3RmdirResFail {
  constructor(public readonly dirWcc: stucts.Nfsv3WccData) {}
}

/**
 * RMDIR response
 */
export class Nfsv3RmdirResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3RmdirResOk,
    public readonly resfail?: Nfsv3RmdirResFail,
  ) {}
}

/**
 * RENAME request
 */
export class Nfsv3RenameRequest {
  constructor(
    public readonly from: stucts.Nfsv3DirOpArgs,
    public readonly to: stucts.Nfsv3DirOpArgs,
  ) {}
}

/**
 * RENAME response - success case
 */
export class Nfsv3RenameResOk {
  constructor(
    public readonly fromDirWcc: stucts.Nfsv3WccData,
    public readonly toDirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * RENAME response - failure case
 */
export class Nfsv3RenameResFail {
  constructor(
    public readonly fromDirWcc: stucts.Nfsv3WccData,
    public readonly toDirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * RENAME response
 */
export class Nfsv3RenameResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3RenameResOk,
    public readonly resfail?: Nfsv3RenameResFail,
  ) {}
}

/**
 * LINK request
 */
export class Nfsv3LinkRequest {
  constructor(
    public readonly file: stucts.Nfsv3Fh,
    public readonly link: stucts.Nfsv3DirOpArgs,
  ) {}
}

/**
 * LINK response - success case
 */
export class Nfsv3LinkResOk {
  constructor(
    public readonly fileAttributes: stucts.Nfsv3PostOpAttr,
    public readonly linkDirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * LINK response - failure case
 */
export class Nfsv3LinkResFail {
  constructor(
    public readonly fileAttributes: stucts.Nfsv3PostOpAttr,
    public readonly linkDirWcc: stucts.Nfsv3WccData,
  ) {}
}

/**
 * LINK response
 */
export class Nfsv3LinkResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3LinkResOk,
    public readonly resfail?: Nfsv3LinkResFail,
  ) {}
}

/**
 * READDIR request
 */
export class Nfsv3ReaddirRequest {
  constructor(
    public readonly dir: stucts.Nfsv3Fh,
    public readonly cookie: bigint,
    public readonly cookieverf: Uint8Array,
    public readonly count: number,
  ) {}
}

/**
 * READDIR response - success case
 */
export class Nfsv3ReaddirResOk {
  constructor(
    public readonly dirAttributes: stucts.Nfsv3PostOpAttr,
    public readonly cookieverf: Uint8Array,
    public readonly reply: stucts.Nfsv3DirList,
  ) {}
}

/**
 * READDIR response - failure case
 */
export class Nfsv3ReaddirResFail {
  constructor(public readonly dirAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * READDIR response
 */
export class Nfsv3ReaddirResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3ReaddirResOk,
    public readonly resfail?: Nfsv3ReaddirResFail,
  ) {}
}

/**
 * READDIRPLUS request
 */
export class Nfsv3ReaddirplusRequest {
  constructor(
    public readonly dir: stucts.Nfsv3Fh,
    public readonly cookie: bigint,
    public readonly cookieverf: Uint8Array,
    public readonly dircount: number,
    public readonly maxcount: number,
  ) {}
}

/**
 * READDIRPLUS response - success case
 */
export class Nfsv3ReaddirplusResOk {
  constructor(
    public readonly dirAttributes: stucts.Nfsv3PostOpAttr,
    public readonly cookieverf: Uint8Array,
    public readonly reply: stucts.Nfsv3DirListPlus,
  ) {}
}

/**
 * READDIRPLUS response - failure case
 */
export class Nfsv3ReaddirplusResFail {
  constructor(public readonly dirAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * READDIRPLUS response
 */
export class Nfsv3ReaddirplusResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3ReaddirplusResOk,
    public readonly resfail?: Nfsv3ReaddirplusResFail,
  ) {}
}

/**
 * FSSTAT request
 */
export class Nfsv3FsstatRequest {
  constructor(public readonly fsroot: stucts.Nfsv3Fh) {}
}

/**
 * FSSTAT response - success case
 */
export class Nfsv3FsstatResOk {
  constructor(
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly tbytes: bigint,
    public readonly fbytes: bigint,
    public readonly abytes: bigint,
    public readonly tfiles: bigint,
    public readonly ffiles: bigint,
    public readonly afiles: bigint,
    public readonly invarsec: number,
  ) {}
}

/**
 * FSSTAT response - failure case
 */
export class Nfsv3FsstatResFail {
  constructor(public readonly objAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * FSSTAT response
 */
export class Nfsv3FsstatResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3FsstatResOk,
    public readonly resfail?: Nfsv3FsstatResFail,
  ) {}
}

/**
 * FSINFO request
 */
export class Nfsv3FsinfoRequest {
  constructor(public readonly fsroot: stucts.Nfsv3Fh) {}
}

/**
 * FSINFO response - success case
 */
export class Nfsv3FsinfoResOk {
  constructor(
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly rtmax: number,
    public readonly rtpref: number,
    public readonly rtmult: number,
    public readonly wtmax: number,
    public readonly wtpref: number,
    public readonly wtmult: number,
    public readonly dtpref: number,
    public readonly maxfilesize: bigint,
    public readonly timeDelta: {seconds: number; nseconds: number},
    public readonly properties: number,
  ) {}
}

/**
 * FSINFO response - failure case
 */
export class Nfsv3FsinfoResFail {
  constructor(public readonly objAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * FSINFO response
 */
export class Nfsv3FsinfoResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3FsinfoResOk,
    public readonly resfail?: Nfsv3FsinfoResFail,
  ) {}
}

/**
 * PATHCONF request
 */
export class Nfsv3PathconfRequest {
  constructor(public readonly object: stucts.Nfsv3Fh) {}
}

/**
 * PATHCONF response - success case
 */
export class Nfsv3PathconfResOk {
  constructor(
    public readonly objAttributes: stucts.Nfsv3PostOpAttr,
    public readonly linkmax: number,
    public readonly namemax: number,
    public readonly noTrunc: boolean,
    public readonly chownRestricted: boolean,
    public readonly caseInsensitive: boolean,
    public readonly casePreserving: boolean,
  ) {}
}

/**
 * PATHCONF response - failure case
 */
export class Nfsv3PathconfResFail {
  constructor(public readonly objAttributes: stucts.Nfsv3PostOpAttr) {}
}

/**
 * PATHCONF response
 */
export class Nfsv3PathconfResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3PathconfResOk,
    public readonly resfail?: Nfsv3PathconfResFail,
  ) {}
}

/**
 * COMMIT request
 */
export class Nfsv3CommitRequest {
  constructor(
    public readonly file: stucts.Nfsv3Fh,
    public readonly offset: bigint,
    public readonly count: number,
  ) {}
}

/**
 * COMMIT response - success case
 */
export class Nfsv3CommitResOk {
  constructor(
    public readonly fileWcc: stucts.Nfsv3WccData,
    public readonly verf: Uint8Array,
  ) {}
}

/**
 * COMMIT response - failure case
 */
export class Nfsv3CommitResFail {
  constructor(public readonly fileWcc: stucts.Nfsv3WccData) {}
}

/**
 * COMMIT response
 */
export class Nfsv3CommitResponse {
  constructor(
    public readonly status: Nfsv3Stat,
    public readonly resok?: Nfsv3CommitResOk,
    public readonly resfail?: Nfsv3CommitResFail,
  ) {}
}
