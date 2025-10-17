import {EventEmitter} from 'events';
import {Readable, Writable} from 'stream';
import type * as msg from '../messages';
import type * as structs from '../structs';
import {nfs} from '../builder';
import {Nfsv4Stat, Nfsv4StableHow} from '../constants';
import type * as misc from 'memfs/lib/node/types/misc';
import type * as opts from 'memfs/lib/node/types/options';
import type {Nfsv4FsClient} from './Nfsv4FsClient';

/**
 * Implements Node.js-like FileHandle interface for NFS v4 file operations.
 */
export class NfsFsFileHandle extends EventEmitter implements misc.IFileHandle {
  public readonly fd: number;
  private closed: boolean = false;

  constructor(
    fd: number,
    public readonly path: string,
    private readonly client: Nfsv4FsClient,
    private readonly stateid: structs.Nfsv4Stateid,
    private readonly openOwner: structs.Nfsv4OpenOwner,
  ) {
    super();
    this.fd = fd;
  }

  getAsyncId(): number {
    return this.fd;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await this.client.closeStateid(this.openOwner, this.stateid);
    this.emit('close');
  }

  async stat(options?: opts.IStatOptions): Promise<misc.IStats> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.stat(this.path, options);
  }

  async appendFile(data: misc.TData, options?: opts.IAppendFileOptions | string): Promise<void> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.appendFile(this.path, data, options);
  }

  async chmod(mode: misc.TMode): Promise<void> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.chmod(this.path, mode);
  }

  async chown(uid: number, gid: number): Promise<void> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.chown(this.path, uid, gid);
  }

  async datasync(): Promise<void> {
    if (this.closed) throw new Error('File handle is closed');
  }

  async read(
    buffer: Buffer | Uint8Array,
    offset: number,
    length: number,
    position?: number | null,
  ): Promise<misc.TFileHandleReadResult> {
    if (this.closed) throw new Error('File handle is closed');
    const readPos = position !== null && position !== undefined ? BigInt(position) : BigInt(0);
    const readOps: msg.Nfsv4Request[] = [nfs.READ(readPos, length, this.stateid)];
    const response = await this.client.fs.compound(readOps);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to read file: ${response.status}`);
    }
    const readRes = response.resarray[0] as msg.Nfsv4ReadResponse;
    if (readRes.status !== Nfsv4Stat.NFS4_OK || !readRes.resok) {
      throw new Error(`Failed to read file: ${readRes.status}`);
    }
    const data = readRes.resok.data;
    const bytesToCopy = Math.min(data.length, length);
    for (let i = 0; i < bytesToCopy; i++) {
      buffer[offset + i] = data[i];
    }
    return {bytesRead: bytesToCopy, buffer};
  }

  async readFile(options?: opts.IReadFileOptions | string): Promise<misc.TDataOut> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.readFile(this.path, options);
  }

  async truncate(len?: number): Promise<void> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.truncate(this.path, len);
  }

  async utimes(atime: misc.TTime, mtime: misc.TTime): Promise<void> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.utimes(this.path, atime, mtime);
  }

  async write(
    buffer: Buffer | ArrayBufferView | DataView,
    offset?: number,
    length?: number,
    position?: number | null,
  ): Promise<misc.TFileHandleWriteResult> {
    if (this.closed) throw new Error('File handle is closed');
    const actualOffset = offset ?? 0;
    const actualLength = length ?? buffer.byteLength - actualOffset;
    const writePos = position !== null && position !== undefined ? BigInt(position) : BigInt(0);
    let data: Uint8Array;
    if (buffer instanceof Uint8Array) {
      data = Uint8Array.prototype.slice.call(buffer, actualOffset, actualOffset + actualLength);
    } else if (Buffer.isBuffer(buffer)) {
      data = new Uint8Array(buffer.buffer, buffer.byteOffset + actualOffset, actualLength);
    } else if (buffer instanceof DataView) {
      data = new Uint8Array(buffer.buffer, buffer.byteOffset + actualOffset, actualLength);
    } else {
      data = new Uint8Array(
        (buffer as ArrayBufferView).buffer,
        (buffer as ArrayBufferView).byteOffset + actualOffset,
        actualLength,
      );
    }
    const writeOps: msg.Nfsv4Request[] = [nfs.WRITE(this.stateid, writePos, Nfsv4StableHow.FILE_SYNC4, data)];
    const response = await this.client.fs.compound(writeOps);
    if (response.status !== Nfsv4Stat.NFS4_OK) {
      throw new Error(`Failed to write file: ${response.status}`);
    }
    const writeRes = response.resarray[0] as msg.Nfsv4WriteResponse;
    if (writeRes.status !== Nfsv4Stat.NFS4_OK || !writeRes.resok) {
      throw new Error(`Failed to write file: ${writeRes.status}`);
    }
    const resultBuffer =
      buffer instanceof Uint8Array || Buffer.isBuffer(buffer) ? buffer : new Uint8Array(buffer.buffer);
    return {bytesWritten: writeRes.resok.count, buffer: resultBuffer};
  }

  async writeFile(data: misc.TData, options?: opts.IWriteFileOptions): Promise<void> {
    if (this.closed) throw new Error('File handle is closed');
    return this.client.writeFile(this.path, data, options);
  }

  async readv(buffers: ArrayBufferView[], position?: number | null): Promise<misc.TFileHandleReadvResult> {
    if (this.closed) throw new Error('File handle is closed');
    let currentPosition = position !== null && position !== undefined ? BigInt(position) : BigInt(0);
    let totalBytesRead = 0;
    for (const buffer of buffers) {
      const readOps: msg.Nfsv4Request[] = [nfs.READ(currentPosition, buffer.byteLength, this.stateid)];
      const response = await this.client.fs.compound(readOps);
      if (response.status !== Nfsv4Stat.NFS4_OK) {
        throw new Error(`Failed to read file: ${response.status}`);
      }
      const readRes = response.resarray[0] as msg.Nfsv4ReadResponse;
      if (readRes.status !== Nfsv4Stat.NFS4_OK || !readRes.resok) {
        throw new Error(`Failed to read file: ${readRes.status}`);
      }
      const data = readRes.resok.data;
      const bytesToCopy = Math.min(data.length, buffer.byteLength);
      const uint8View = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      for (let i = 0; i < bytesToCopy; i++) {
        uint8View[i] = data[i];
      }
      totalBytesRead += bytesToCopy;
      currentPosition += BigInt(bytesToCopy);
      if (readRes.resok.eof || bytesToCopy < buffer.byteLength) break;
    }
    return {bytesRead: totalBytesRead, buffers};
  }

  async writev(buffers: ArrayBufferView[], position?: number | null): Promise<misc.TFileHandleWritevResult> {
    if (this.closed) throw new Error('File handle is closed');
    let currentPosition = position !== null && position !== undefined ? BigInt(position) : BigInt(0);
    let totalBytesWritten = 0;
    for (const buffer of buffers) {
      const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const writeOps: msg.Nfsv4Request[] = [nfs.WRITE(this.stateid, currentPosition, Nfsv4StableHow.FILE_SYNC4, data)];
      const response = await this.client.fs.compound(writeOps);
      if (response.status !== Nfsv4Stat.NFS4_OK) {
        throw new Error(`Failed to write file: ${response.status}`);
      }
      const writeRes = response.resarray[0] as msg.Nfsv4WriteResponse;
      if (writeRes.status !== Nfsv4Stat.NFS4_OK || !writeRes.resok) {
        throw new Error(`Failed to write file: ${writeRes.status}`);
      }
      totalBytesWritten += writeRes.resok.count;
      currentPosition += BigInt(writeRes.resok.count);
    }
    return {bytesWritten: totalBytesWritten, buffers};
  }

  readableWebStream(options?: opts.IReadableWebStreamOptions): ReadableStream {
    if (this.closed) throw new Error('File handle is closed');
    const stream = this.createReadStream(options as any);
    return Readable.toWeb(stream as any) as ReadableStream;
  }

  createReadStream(options?: opts.IFileHandleReadStreamOptions): misc.IReadStream {
    if (this.closed) throw new Error('File handle is closed');
    const start = options?.start ?? 0;
    const end = options?.end;
    const highWaterMark = options?.highWaterMark ?? 64 * 1024;
    let position = typeof start === 'number' ? start : 0;
    const endPosition = typeof end === 'number' ? end : Infinity;
    let reading = false;
    const self = this;
    const stream = new Readable({
      highWaterMark,
      async read(size) {
        if (reading) return;
        reading = true;
        try {
          while (true) {
            if (position >= endPosition) {
              this.push(null);
              break;
            }
            const bytesToRead = Math.min(size, endPosition - position);
            if (bytesToRead <= 0) {
              this.push(null);
              break;
            }
            const buffer = Buffer.alloc(bytesToRead);
            const result = await self.read(buffer, 0, bytesToRead, position);
            if (result.bytesRead === 0) {
              this.push(null);
              break;
            }
            position += result.bytesRead;
            const chunk = buffer.slice(0, result.bytesRead);
            if (!this.push(chunk)) break;
            if (result.bytesRead < bytesToRead) {
              this.push(null);
              break;
            }
          }
        } catch (err) {
          this.destroy(err as Error);
        } finally {
          reading = false;
        }
      },
    }) as misc.IReadStream;
    stream.path = this.path;
    return stream;
  }

  createWriteStream(options?: opts.IFileHandleWriteStreamOptions): misc.IWriteStream {
    if (this.closed) throw new Error('File handle is closed');
    const start = options?.start ?? 0;
    const highWaterMark = options?.highWaterMark ?? 64 * 1024;
    let position = typeof start === 'number' ? start : 0;
    const self = this;
    const stream = new Writable({
      highWaterMark,
      async write(chunk, encoding, callback) {
        try {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          const result = await self.write(buffer, 0, buffer.length, position);
          position += result.bytesWritten;
          callback();
        } catch (err) {
          callback(err as Error);
        }
      },
      async writev(chunks, callback) {
        try {
          const buffers = chunks.map(({chunk}) => (Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
          const result = await self.writev(buffers, position);
          position += result.bytesWritten;
          callback();
        } catch (err) {
          callback(err as Error);
        }
      },
    }) as misc.IWriteStream;
    stream.path = this.path;
    return stream;
  }
}
