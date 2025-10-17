import {Nfsv4OperationsNode} from '../Nfsv4OperationsNode';
import * as msg from '../../../../messages';
import * as struct from '../../../../structs';
import {Nfsv4Stat, Nfsv4Attr} from '../../../../constants';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('READDIR operation', () => {
  let tmpDir: string;
  let ops: Nfsv4OperationsNode;

  beforeEach(async () => {
    tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'nfs-readdir-test-'));
    await fs.promises.writeFile(path.join(tmpDir, 'file1.txt'), 'content1');
    await fs.promises.writeFile(path.join(tmpDir, 'file2.txt'), 'content2');
    await fs.promises.mkdir(path.join(tmpDir, 'subdir'));
    ops = new Nfsv4OperationsNode({fs, dir: tmpDir});
  });

  afterEach(async () => {
    await fs.promises.rm(tmpDir, {recursive: true, force: true});
  });

  test('reads directory entries from root', async () => {
    const ctx: any = {
      cfh: new Uint8Array([0]),
      connection: {logger: {log: jest.fn()}, debug: false},
      getPrincipal: () => 'test',
    };
    const attrRequest = new struct.Nfsv4Bitmap([1 << (Nfsv4Attr.FATTR4_TYPE % 32)]);
    const request = new msg.Nfsv4ReaddirRequest(
      BigInt(0),
      new struct.Nfsv4Verifier(new Uint8Array(8)),
      1024,
      4096,
      attrRequest,
    );
    const response = await ops.READDIR(request, ctx);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resok).toBeDefined();
    if (response.resok) {
      expect(response.resok.entries.length).toBeGreaterThan(0);
      expect(response.resok.eof).toBe(true);
      const entryNames = response.resok.entries.map((e) => e.name);
      expect(entryNames).toContain('file1.txt');
      expect(entryNames).toContain('file2.txt');
      expect(entryNames).toContain('subdir');
    }
  });

  test('handles pagination with maxcount', async () => {
    const ctx: any = {
      cfh: new Uint8Array([0]),
      connection: {logger: {log: jest.fn()}, debug: false},
      getPrincipal: () => 'test',
    };
    const attrRequest = new struct.Nfsv4Bitmap([1 << (Nfsv4Attr.FATTR4_TYPE % 32)]);
    const request = new msg.Nfsv4ReaddirRequest(
      BigInt(0),
      new struct.Nfsv4Verifier(new Uint8Array(8)),
      1024,
      128,
      attrRequest,
    );
    const response = await ops.READDIR(request, ctx);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resok).toBeDefined();
    if (response.resok) {
      expect(response.resok.entries.length).toBeGreaterThan(0);
    }
  });

  test('returns error for non-directory', async () => {
    await fs.promises.writeFile(path.join(tmpDir, 'notadir.txt'), 'content');
    const filePath = path.join(tmpDir, 'notadir.txt');
    const fh = (ops as any).fh.encode(filePath);
    const ctx: any = {
      cfh: fh,
      connection: {logger: {log: jest.fn()}, debug: false},
      getPrincipal: () => 'test',
    };
    const attrRequest = new struct.Nfsv4Bitmap([1 << (Nfsv4Attr.FATTR4_TYPE % 32)]);
    const request = new msg.Nfsv4ReaddirRequest(
      BigInt(0),
      new struct.Nfsv4Verifier(new Uint8Array(8)),
      1024,
      4096,
      attrRequest,
    );
    await expect(ops.READDIR(request, ctx)).rejects.toBe(Nfsv4Stat.NFS4ERR_NOTDIR);
  });

  test('validates cookieverf for continued reads', async () => {
    const ctx: any = {
      cfh: new Uint8Array([0]),
      connection: {logger: {log: jest.fn()}, debug: false},
      getPrincipal: () => 'test',
    };
    const attrRequest = new struct.Nfsv4Bitmap([1 << (Nfsv4Attr.FATTR4_TYPE % 32)]);
    const firstRequest = new msg.Nfsv4ReaddirRequest(
      BigInt(0),
      new struct.Nfsv4Verifier(new Uint8Array(8)),
      1024,
      4096,
      attrRequest,
    );
    const firstResponse = await ops.READDIR(firstRequest, ctx);
    expect(firstResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(firstResponse.resok).toBeDefined();
    if (firstResponse.resok && firstResponse.resok.entries.length > 0) {
      const _cookieverf = firstResponse.resok.cookieverf;
      const lastEntry = firstResponse.resok.entries[firstResponse.resok.entries.length - 1];
      const invalidCookieverf = new struct.Nfsv4Verifier(new Uint8Array(8).fill(0xff));
      const secondRequest = new msg.Nfsv4ReaddirRequest(lastEntry.cookie, invalidCookieverf, 1024, 4096, attrRequest);
      await expect(ops.READDIR(secondRequest, ctx)).rejects.toBe(Nfsv4Stat.NFS4ERR_NOT_SAME);
    }
  });

  test('skips reserved cookie values 1 and 2', async () => {
    const ctx: any = {
      cfh: new Uint8Array([0]),
      connection: {logger: {log: jest.fn()}, debug: false},
      getPrincipal: () => 'test',
    };
    const attrRequest = new struct.Nfsv4Bitmap([1 << (Nfsv4Attr.FATTR4_TYPE % 32)]);
    const request = new msg.Nfsv4ReaddirRequest(
      BigInt(0),
      new struct.Nfsv4Verifier(new Uint8Array(8)),
      1024,
      4096,
      attrRequest,
    );
    const response = await ops.READDIR(request, ctx);
    expect(response).toBeInstanceOf(msg.Nfsv4ReaddirResponse);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resok).toBeDefined();
    if (response.resok) {
      const cookies = response.resok.entries.map((e) => e.cookie);
      expect(cookies).not.toContain(BigInt(0));
      expect(cookies).not.toContain(BigInt(1));
      expect(cookies).not.toContain(BigInt(2));
    }
  });
});
