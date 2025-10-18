import {Nfsv4Stat} from '../../..';
import type {Logger} from '../../types';

export const isErrCode = (code: unknown, error: unknown): boolean =>
  !!error && typeof error === 'object' && (error as any).code === code;

export const normalizeNodeFsError = (err: unknown, logger: Logger): Nfsv4Stat => {
  if (isErrCode('ENOENT', err)) return Nfsv4Stat.NFS4ERR_NOENT;
  if (isErrCode('EACCES', err)) return Nfsv4Stat.NFS4ERR_ACCESS;
  if (isErrCode('EEXIST', err)) return Nfsv4Stat.NFS4ERR_EXIST;
  logger.error('UNEXPECTED_FS_ERROR', err);
  return Nfsv4Stat.NFS4ERR_IO;
};
