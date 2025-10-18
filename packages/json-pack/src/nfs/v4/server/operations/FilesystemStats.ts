/**
 * Filesystem statistics for NFSv4 space and file count attributes.
 */
export class FilesystemStats {
  constructor(
    /** Available space in bytes for unprivileged users */
    public readonly spaceAvail: bigint,
    /** Free space in bytes on the filesystem */
    public readonly spaceFree: bigint,
    /** Total space in bytes on the filesystem */
    public readonly spaceTotal: bigint,
    /** Available file slots (inodes) */
    public readonly filesAvail: bigint,
    /** Free file slots (inodes) */
    public readonly filesFree: bigint,
    /** Total file slots (inodes) */
    public readonly filesTotal: bigint,
  ) {}
}
