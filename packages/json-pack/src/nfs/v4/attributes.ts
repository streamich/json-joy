/**
 * NFSv4 attribute metadata and classification.
 * Based on RFC 7530 Section 5.
 */

import {Nfsv4Attr} from './constants';

/**
 * Per-server attributes (Section 5.4).
 * These attributes are global to the entire server.
 */
export const PER_SERVER_ATTRS = new Set<Nfsv4Attr>([Nfsv4Attr.FATTR4_LEASE_TIME]);

/**
 * Per-file system attributes (Section 5.4).
 * These attributes are consistent across all objects within a given file system.
 */
export const PER_FS_ATTRS = new Set<Nfsv4Attr>([
  Nfsv4Attr.FATTR4_SUPPORTED_ATTRS,
  Nfsv4Attr.FATTR4_FH_EXPIRE_TYPE,
  Nfsv4Attr.FATTR4_LINK_SUPPORT,
  Nfsv4Attr.FATTR4_SYMLINK_SUPPORT,
  Nfsv4Attr.FATTR4_UNIQUE_HANDLES,
  Nfsv4Attr.FATTR4_ACLSUPPORT,
  Nfsv4Attr.FATTR4_CANSETTIME,
  Nfsv4Attr.FATTR4_CASE_INSENSITIVE,
  Nfsv4Attr.FATTR4_CASE_PRESERVING,
  Nfsv4Attr.FATTR4_CHOWN_RESTRICTED,
  Nfsv4Attr.FATTR4_FILES_AVAIL,
  Nfsv4Attr.FATTR4_FILES_FREE,
  Nfsv4Attr.FATTR4_FILES_TOTAL,
  Nfsv4Attr.FATTR4_FS_LOCATIONS,
  Nfsv4Attr.FATTR4_HOMOGENEOUS,
  Nfsv4Attr.FATTR4_MAXFILESIZE,
  Nfsv4Attr.FATTR4_MAXNAME,
  Nfsv4Attr.FATTR4_MAXREAD,
  Nfsv4Attr.FATTR4_MAXWRITE,
  Nfsv4Attr.FATTR4_NO_TRUNC,
  Nfsv4Attr.FATTR4_SPACE_AVAIL,
  Nfsv4Attr.FATTR4_SPACE_FREE,
  Nfsv4Attr.FATTR4_SPACE_TOTAL,
  Nfsv4Attr.FATTR4_TIME_DELTA,
]);

/**
 * Attributes that must be the same for all objects within a file system (Section 5.4).
 * These are always homogeneous.
 */
export const HOMOGENEOUS_ATTRS = new Set<Nfsv4Attr>([
  Nfsv4Attr.FATTR4_SUPPORTED_ATTRS,
  Nfsv4Attr.FATTR4_FSID,
  Nfsv4Attr.FATTR4_HOMOGENEOUS,
  Nfsv4Attr.FATTR4_LINK_SUPPORT,
  Nfsv4Attr.FATTR4_SYMLINK_SUPPORT,
]);

/**
 * Read-only (get-only) attributes (Section 5.5).
 * Can be retrieved via GETATTR but not set via SETATTR.
 * Attempting to set these returns NFS4ERR_INVAL.
 */
export const GET_ONLY_ATTRS = new Set<Nfsv4Attr>([
  Nfsv4Attr.FATTR4_SUPPORTED_ATTRS,
  Nfsv4Attr.FATTR4_TYPE,
  Nfsv4Attr.FATTR4_FH_EXPIRE_TYPE,
  Nfsv4Attr.FATTR4_CHANGE,
  Nfsv4Attr.FATTR4_LINK_SUPPORT,
  Nfsv4Attr.FATTR4_SYMLINK_SUPPORT,
  Nfsv4Attr.FATTR4_NAMED_ATTR,
  Nfsv4Attr.FATTR4_FSID,
  Nfsv4Attr.FATTR4_UNIQUE_HANDLES,
  Nfsv4Attr.FATTR4_LEASE_TIME,
  Nfsv4Attr.FATTR4_RDATTR_ERROR,
  Nfsv4Attr.FATTR4_FILEHANDLE,
  Nfsv4Attr.FATTR4_ACLSUPPORT,
  Nfsv4Attr.FATTR4_CANSETTIME,
  Nfsv4Attr.FATTR4_CASE_INSENSITIVE,
  Nfsv4Attr.FATTR4_CASE_PRESERVING,
  Nfsv4Attr.FATTR4_CHOWN_RESTRICTED,
  Nfsv4Attr.FATTR4_FILEID,
  Nfsv4Attr.FATTR4_FILES_AVAIL,
  Nfsv4Attr.FATTR4_FILES_FREE,
  Nfsv4Attr.FATTR4_FILES_TOTAL,
  Nfsv4Attr.FATTR4_FS_LOCATIONS,
  Nfsv4Attr.FATTR4_HOMOGENEOUS,
  Nfsv4Attr.FATTR4_MAXFILESIZE,
  Nfsv4Attr.FATTR4_MAXLINK,
  Nfsv4Attr.FATTR4_MAXNAME,
  Nfsv4Attr.FATTR4_MAXREAD,
  Nfsv4Attr.FATTR4_MAXWRITE,
  Nfsv4Attr.FATTR4_MOUNTED_ON_FILEID,
  Nfsv4Attr.FATTR4_NO_TRUNC,
  Nfsv4Attr.FATTR4_NUMLINKS,
  Nfsv4Attr.FATTR4_QUOTA_AVAIL_HARD,
  Nfsv4Attr.FATTR4_QUOTA_AVAIL_SOFT,
  Nfsv4Attr.FATTR4_QUOTA_USED,
  Nfsv4Attr.FATTR4_RAWDEV,
  Nfsv4Attr.FATTR4_SPACE_AVAIL,
  Nfsv4Attr.FATTR4_SPACE_FREE,
  Nfsv4Attr.FATTR4_SPACE_TOTAL,
  Nfsv4Attr.FATTR4_SPACE_USED,
  Nfsv4Attr.FATTR4_TIME_ACCESS,
  Nfsv4Attr.FATTR4_TIME_DELTA,
  Nfsv4Attr.FATTR4_TIME_METADATA,
  Nfsv4Attr.FATTR4_TIME_MODIFY,
]);

/**
 * Write-only (set-only) attributes (Section 5.5).
 * Can be set via SETATTR but not retrieved via GETATTR.
 * Attempting to get these returns NFS4ERR_INVAL.
 */
export const SET_ONLY_ATTRS = new Set<Nfsv4Attr>([Nfsv4Attr.FATTR4_TIME_ACCESS_SET, Nfsv4Attr.FATTR4_TIME_MODIFY_SET]);

/**
 * REQUIRED attributes (Section 5.6, Table 3).
 * Server MUST support these attributes.
 */
export const REQUIRED_ATTRS = new Set<Nfsv4Attr>([
  Nfsv4Attr.FATTR4_SUPPORTED_ATTRS,
  Nfsv4Attr.FATTR4_TYPE,
  Nfsv4Attr.FATTR4_FH_EXPIRE_TYPE,
  Nfsv4Attr.FATTR4_CHANGE,
  Nfsv4Attr.FATTR4_SIZE,
  Nfsv4Attr.FATTR4_LINK_SUPPORT,
  Nfsv4Attr.FATTR4_SYMLINK_SUPPORT,
  Nfsv4Attr.FATTR4_NAMED_ATTR,
  Nfsv4Attr.FATTR4_FSID,
  Nfsv4Attr.FATTR4_UNIQUE_HANDLES,
  Nfsv4Attr.FATTR4_LEASE_TIME,
  Nfsv4Attr.FATTR4_RDATTR_ERROR,
  Nfsv4Attr.FATTR4_FILEHANDLE,
]);

/**
 * RECOMMENDED attributes (Section 5.7, Table 4).
 * Server SHOULD support these attributes.
 */
export const RECOMMENDED_ATTRS = new Set<Nfsv4Attr>([
  Nfsv4Attr.FATTR4_ACL,
  Nfsv4Attr.FATTR4_ACLSUPPORT,
  Nfsv4Attr.FATTR4_ARCHIVE,
  Nfsv4Attr.FATTR4_CANSETTIME,
  Nfsv4Attr.FATTR4_CASE_INSENSITIVE,
  Nfsv4Attr.FATTR4_CASE_PRESERVING,
  Nfsv4Attr.FATTR4_CHOWN_RESTRICTED,
  Nfsv4Attr.FATTR4_FILEID,
  Nfsv4Attr.FATTR4_FILES_AVAIL,
  Nfsv4Attr.FATTR4_FILES_FREE,
  Nfsv4Attr.FATTR4_FILES_TOTAL,
  Nfsv4Attr.FATTR4_FS_LOCATIONS,
  Nfsv4Attr.FATTR4_HIDDEN,
  Nfsv4Attr.FATTR4_HOMOGENEOUS,
  Nfsv4Attr.FATTR4_MAXFILESIZE,
  Nfsv4Attr.FATTR4_MAXLINK,
  Nfsv4Attr.FATTR4_MAXNAME,
  Nfsv4Attr.FATTR4_MAXREAD,
  Nfsv4Attr.FATTR4_MAXWRITE,
  Nfsv4Attr.FATTR4_MIMETYPE,
  Nfsv4Attr.FATTR4_MODE,
  Nfsv4Attr.FATTR4_MOUNTED_ON_FILEID,
  Nfsv4Attr.FATTR4_NO_TRUNC,
  Nfsv4Attr.FATTR4_NUMLINKS,
  Nfsv4Attr.FATTR4_OWNER,
  Nfsv4Attr.FATTR4_OWNER_GROUP,
  Nfsv4Attr.FATTR4_QUOTA_AVAIL_HARD,
  Nfsv4Attr.FATTR4_QUOTA_AVAIL_SOFT,
  Nfsv4Attr.FATTR4_QUOTA_USED,
  Nfsv4Attr.FATTR4_RAWDEV,
  Nfsv4Attr.FATTR4_SPACE_AVAIL,
  Nfsv4Attr.FATTR4_SPACE_FREE,
  Nfsv4Attr.FATTR4_SPACE_TOTAL,
  Nfsv4Attr.FATTR4_SPACE_USED,
  Nfsv4Attr.FATTR4_SYSTEM,
  Nfsv4Attr.FATTR4_TIME_ACCESS,
  Nfsv4Attr.FATTR4_TIME_ACCESS_SET,
  Nfsv4Attr.FATTR4_TIME_BACKUP,
  Nfsv4Attr.FATTR4_TIME_CREATE,
  Nfsv4Attr.FATTR4_TIME_DELTA,
  Nfsv4Attr.FATTR4_TIME_METADATA,
  Nfsv4Attr.FATTR4_TIME_MODIFY,
  Nfsv4Attr.FATTR4_TIME_MODIFY_SET,
]);

/**
 * Attributes that require fs.Stats (lstat) to compute.
 * If none of these are requested, we can skip the lstat call.
 */
export const STAT_ATTRS = new Set<Nfsv4Attr>([
  Nfsv4Attr.FATTR4_TYPE,
  Nfsv4Attr.FATTR4_CHANGE,
  Nfsv4Attr.FATTR4_SIZE,
  Nfsv4Attr.FATTR4_FILEID,
  Nfsv4Attr.FATTR4_MODE,
  Nfsv4Attr.FATTR4_NUMLINKS,
  Nfsv4Attr.FATTR4_RAWDEV,
  Nfsv4Attr.FATTR4_SPACE_USED,
  Nfsv4Attr.FATTR4_TIME_ACCESS,
  Nfsv4Attr.FATTR4_TIME_METADATA,
  Nfsv4Attr.FATTR4_TIME_MODIFY,
]);

/**
 * Attributes that require filesystem stats (e.g. disk space).
 * If none of these are requested, we can skip the filesystem stats call.
 */
export const FS_ATTRS = new Set<Nfsv4Attr>([
  Nfsv4Attr.FATTR4_FILES_AVAIL,
  Nfsv4Attr.FATTR4_FILES_FREE,
  Nfsv4Attr.FATTR4_FILES_TOTAL,
  Nfsv4Attr.FATTR4_SPACE_AVAIL,
  Nfsv4Attr.FATTR4_SPACE_FREE,
  Nfsv4Attr.FATTR4_SPACE_TOTAL,
]);

/**
 * Extract attribute numbers from a bitmap mask.
 *
 * @todo PERF: More efficient would be to parse to `Array<number>` and
 *     also use `Array<number>` for {@link overlap} calculation.
 */
export const parseBitmask = (mask: number[]): Set<number> => {
  const attrs = new Set<number>();
  const length = mask.length;
  for (let i = 0, word = mask[0], base = 0; i < length; i++, word = mask[i], base = i * 32)
    for (let bit = 0; word; bit++, word >>>= 1) if (word & 1) attrs.add(base + bit);
  return attrs;
};

/**
 * Check if two sets overlap (have any elements in common).
 */
export const overlaps = <T>(a: Set<T>, b: Set<T>): boolean => {
  for (const element of b) if (a.has(element)) return true;
  return false;
};

/**
 * Check if attempting to get a set-only attribute (returns NFS4ERR_INVAL).
 */
export const containsSetOnlyAttr = (requestedAttrs: Set<number>): boolean => overlaps(requestedAttrs, SET_ONLY_ATTRS);

/**
 * Check if any requested attributes require lstat.
 */
export const requiresLstat = (requestedAttrs: Set<number>): boolean => overlaps(requestedAttrs, STAT_ATTRS);

export const requiresFsStats = (requestedAttrs: Set<number>): boolean => overlaps(requestedAttrs, FS_ATTRS);

export const setBit = (mask: number[], attrNum: Nfsv4Attr): void => {
  const wordIndex = Math.floor(attrNum / 32);
  const bitIndex = attrNum % 32;
  while (mask.length <= wordIndex) mask.push(0);
  mask[wordIndex] |= 1 << bitIndex;
};

/**
 * Helper to convert attribute numbers to bitmap array.
 * @param attrNums - Array of attribute numbers (Nfsv4Attr values)
 * @returns Bitmap array suitable for Nfsv4Bitmap constructor
 */
export const attrNumsToBitmap = (attrNums: Nfsv4Attr[]): number[] => {
  const mask: number[] = [];
  for (const attrNum of attrNums) setBit(mask, attrNum);
  return mask;
};
