/**
 * NFSv3 Protocol Constants
 * Based on RFC 1813
 */

/**
 * NFSv3 protocol constants
 */
export const enum Nfsv3Const {
  PROGRAM = 100003,
  VERSION = 3,
  FHSIZE = 64,
  COOKIEVERFSIZE = 8,
  CREATEVERFSIZE = 8,
  WRITEVERFSIZE = 8,
}

/**
 * NFSv3 procedure numbers
 */
export const enum Nfsv3Proc {
  NULL = 0,
  GETATTR = 1,
  SETATTR = 2,
  LOOKUP = 3,
  ACCESS = 4,
  READLINK = 5,
  READ = 6,
  WRITE = 7,
  CREATE = 8,
  MKDIR = 9,
  SYMLINK = 10,
  MKNOD = 11,
  REMOVE = 12,
  RMDIR = 13,
  RENAME = 14,
  LINK = 15,
  READDIR = 16,
  READDIRPLUS = 17,
  FSSTAT = 18,
  FSINFO = 19,
  PATHCONF = 20,
  COMMIT = 21,
}

/**
 * NFSv3 status codes
 */
export const enum Nfsv3Stat {
  NFS3_OK = 0,
  NFS3ERR_PERM = 1,
  NFS3ERR_NOENT = 2,
  NFS3ERR_IO = 5,
  NFS3ERR_NXIO = 6,
  NFS3ERR_ACCES = 13,
  NFS3ERR_EXIST = 17,
  NFS3ERR_XDEV = 18,
  NFS3ERR_NODEV = 19,
  NFS3ERR_NOTDIR = 20,
  NFS3ERR_ISDIR = 21,
  NFS3ERR_INVAL = 22,
  NFS3ERR_FBIG = 27,
  NFS3ERR_NOSPC = 28,
  NFS3ERR_ROFS = 30,
  NFS3ERR_MLINK = 31,
  NFS3ERR_NAMETOOLONG = 63,
  NFS3ERR_NOTEMPTY = 66,
  NFS3ERR_DQUOT = 69,
  NFS3ERR_STALE = 70,
  NFS3ERR_REMOTE = 71,
  NFS3ERR_BADHANDLE = 10001,
  NFS3ERR_NOT_SYNC = 10002,
  NFS3ERR_BAD_COOKIE = 10003,
  NFS3ERR_NOTSUPP = 10004,
  NFS3ERR_TOOSMALL = 10005,
  NFS3ERR_SERVERFAULT = 10006,
  NFS3ERR_BADTYPE = 10007,
  NFS3ERR_JUKEBOX = 10008,
}

/**
 * File type enumeration
 */
export const enum Nfsv3FType {
  NF3REG = 1,
  NF3DIR = 2,
  NF3BLK = 3,
  NF3CHR = 4,
  NF3LNK = 5,
  NF3SOCK = 6,
  NF3FIFO = 7,
}

/**
 * Time setting enumeration for SETATTR
 */
export const enum Nfsv3TimeHow {
  DONT_CHANGE = 0,
  SET_TO_SERVER_TIME = 1,
  SET_TO_CLIENT_TIME = 2,
}

/**
 * Stable storage write mode for WRITE operation
 */
export const enum Nfsv3StableHow {
  UNSTABLE = 0,
  DATA_SYNC = 1,
  FILE_SYNC = 2,
}

/**
 * File creation mode for CREATE operation
 */
export const enum Nfsv3CreateMode {
  UNCHECKED = 0,
  GUARDED = 1,
  EXCLUSIVE = 2,
}

/**
 * Access permission bit flags for ACCESS operation
 */
export const enum Nfsv3Access {
  READ = 0x0001,
  LOOKUP = 0x0002,
  MODIFY = 0x0004,
  EXTEND = 0x0008,
  DELETE = 0x0010,
  EXECUTE = 0x0020,
}

/**
 * File mode permission bits
 */
export const enum Nfsv3Mode {
  SUID = 0x00800,
  SGID = 0x00400,
  SVTX = 0x00200,
  RUSR = 0x00100,
  WUSR = 0x00080,
  XUSR = 0x00040,
  RGRP = 0x00020,
  WGRP = 0x00010,
  XGRP = 0x00008,
  ROTH = 0x00004,
  WOTH = 0x00002,
  XOTH = 0x00001,
}

/**
 * FSF property bit flags for FSINFO
 */
export const enum Nfsv3Fsf {
  LINK = 0x0001,
  SYMLINK = 0x0002,
  HOMOGENEOUS = 0x0008,
  CANSETTIME = 0x0010,
}
