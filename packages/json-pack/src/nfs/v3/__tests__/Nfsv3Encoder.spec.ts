import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {Nfsv3Encoder} from '../Nfsv3Encoder';
import {Nfsv3Decoder} from '../Nfsv3Decoder';
import {Nfsv3Proc, Nfsv3Stat, Nfsv3FType, Nfsv3TimeHow, Nfsv3CreateMode} from '../constants';
import * as msg from '../messages';
import * as structs from '../structs';

describe('Nfsv3Encoder', () => {
  const encoder = new Nfsv3Encoder();
  const decoder = new Nfsv3Decoder();

  describe('GETATTR', () => {
    test('encodes and decodes GETATTR request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const request = new msg.Nfsv3GetattrRequest(new structs.Nfsv3Fh(fhData));
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.GETATTR, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.GETATTR, true) as msg.Nfsv3GetattrRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3GetattrRequest);
      expect(decoded.object.data).toEqual(fhData);
    });

    test('encodes and decodes GETATTR response', () => {
      const time = new structs.Nfsv3Time(1234567890, 123456789);
      const specData = new structs.Nfsv3SpecData(0, 0);
      const fattr = new structs.Nfsv3Fattr(
        Nfsv3FType.NF3REG,
        0o100644,
        1,
        1000,
        1000,
        BigInt(1024),
        BigInt(1024),
        specData,
        BigInt(1),
        BigInt(123456),
        time,
        time,
        time,
      );
      const response = new msg.Nfsv3GetattrResponse(Nfsv3Stat.NFS3_OK, new msg.Nfsv3GetattrResOk(fattr));
      const encoded = encoder.encodeMessage(response, Nfsv3Proc.GETATTR, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.GETATTR, false) as msg.Nfsv3GetattrResponse;
      expect(decoded).toBeInstanceOf(msg.Nfsv3GetattrResponse);
      expect(decoded.status).toBe(Nfsv3Stat.NFS3_OK);
      expect(decoded.resok).toBeDefined();
      expect(decoded.resok!.objAttributes.type).toBe(Nfsv3FType.NF3REG);
      expect(decoded.resok!.objAttributes.mode).toBe(0o100644);
      expect(decoded.resok!.objAttributes.size).toBe(BigInt(1024));
    });
  });

  describe('SETATTR', () => {
    test('encodes and decodes SETATTR request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const mode = new structs.Nfsv3SetMode(true, 0o100644);
      const uid = new structs.Nfsv3SetUid(false);
      const gid = new structs.Nfsv3SetGid(false);
      const size = new structs.Nfsv3SetSize(true, BigInt(2048));
      const atime = new structs.Nfsv3SetAtime(Nfsv3TimeHow.DONT_CHANGE);
      const mtime = new structs.Nfsv3SetMtime(Nfsv3TimeHow.SET_TO_SERVER_TIME);
      const sattr = new structs.Nfsv3Sattr(mode, uid, gid, size, atime, mtime);
      const guard = new structs.Nfsv3SattrGuard(false);
      const request = new msg.Nfsv3SetattrRequest(new structs.Nfsv3Fh(fhData), sattr, guard);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.SETATTR, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.SETATTR, true) as msg.Nfsv3SetattrRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3SetattrRequest);
      expect(decoded.newAttributes.mode.set).toBe(true);
      expect(decoded.newAttributes.mode.mode).toBe(0o100644);
      expect(decoded.newAttributes.size.set).toBe(true);
      expect(decoded.newAttributes.size.size).toBe(BigInt(2048));
    });
  });

  describe('LOOKUP', () => {
    test('encodes and decodes LOOKUP request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const dirOpArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fhData), 'test.txt');
      const request = new msg.Nfsv3LookupRequest(dirOpArgs);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.LOOKUP, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.LOOKUP, true) as msg.Nfsv3LookupRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3LookupRequest);
      expect(decoded.what.name).toBe('test.txt');
    });
  });

  describe('ACCESS', () => {
    test('encodes and decodes ACCESS request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const request = new msg.Nfsv3AccessRequest(new structs.Nfsv3Fh(fhData), 0x1f);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.ACCESS, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.ACCESS, true) as msg.Nfsv3AccessRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3AccessRequest);
      expect(decoded.access).toBe(0x1f);
    });
  });

  describe('READ', () => {
    test('encodes and decodes READ request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const request = new msg.Nfsv3ReadRequest(new structs.Nfsv3Fh(fhData), BigInt(0), 4096);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.READ, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.READ, true) as msg.Nfsv3ReadRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3ReadRequest);
      expect(decoded.offset).toBe(BigInt(0));
      expect(decoded.count).toBe(4096);
    });

    test('encodes and decodes READ response', () => {
      const postOpAttr = new structs.Nfsv3PostOpAttr(false);
      const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const resok = new msg.Nfsv3ReadResOk(postOpAttr, data.length, true, data);
      const response = new msg.Nfsv3ReadResponse(Nfsv3Stat.NFS3_OK, resok);
      const encoded = encoder.encodeMessage(response, Nfsv3Proc.READ, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.READ, false) as msg.Nfsv3ReadResponse;
      expect(decoded).toBeInstanceOf(msg.Nfsv3ReadResponse);
      expect(decoded.status).toBe(Nfsv3Stat.NFS3_OK);
      expect(decoded.resok).toBeDefined();
      expect(decoded.resok!.count).toBe(data.length);
      expect(decoded.resok!.eof).toBe(true);
      expect(decoded.resok!.data).toEqual(data);
    });
  });

  describe('WRITE', () => {
    test('encodes and decodes WRITE request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const request = new msg.Nfsv3WriteRequest(new structs.Nfsv3Fh(fhData), BigInt(0), data.length, 0, data);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.WRITE, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.WRITE, true) as msg.Nfsv3WriteRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3WriteRequest);
      expect(decoded.offset).toBe(BigInt(0));
      expect(decoded.count).toBe(data.length);
      expect(decoded.data).toEqual(data);
    });
  });

  describe('CREATE', () => {
    test('encodes and decodes CREATE request with UNCHECKED mode', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const dirOpArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fhData), 'newfile.txt');
      const mode = new structs.Nfsv3SetMode(true, 0o100644);
      const uid = new structs.Nfsv3SetUid(false);
      const gid = new structs.Nfsv3SetGid(false);
      const size = new structs.Nfsv3SetSize(false);
      const atime = new structs.Nfsv3SetAtime(Nfsv3TimeHow.DONT_CHANGE);
      const mtime = new structs.Nfsv3SetMtime(Nfsv3TimeHow.DONT_CHANGE);
      const sattr = new structs.Nfsv3Sattr(mode, uid, gid, size, atime, mtime);
      const how = new structs.Nfsv3CreateHow(Nfsv3CreateMode.UNCHECKED, sattr);
      const request = new msg.Nfsv3CreateRequest(dirOpArgs, how);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.CREATE, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.CREATE, true) as msg.Nfsv3CreateRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3CreateRequest);
      expect(decoded.where.name).toBe('newfile.txt');
      expect(decoded.how.mode).toBe(Nfsv3CreateMode.UNCHECKED);
    });

    test('encodes and decodes CREATE request with EXCLUSIVE mode', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const dirOpArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fhData), 'newfile.txt');
      const verf = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const how = new structs.Nfsv3CreateHow(Nfsv3CreateMode.EXCLUSIVE, undefined, verf);
      const request = new msg.Nfsv3CreateRequest(dirOpArgs, how);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.CREATE, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.CREATE, true) as msg.Nfsv3CreateRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3CreateRequest);
      expect(decoded.where.name).toBe('newfile.txt');
      expect(decoded.how.mode).toBe(Nfsv3CreateMode.EXCLUSIVE);
      expect(decoded.how.verf).toEqual(verf);
    });
  });

  describe('MKDIR', () => {
    test('encodes and decodes MKDIR request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const dirOpArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fhData), 'newdir');
      const mode = new structs.Nfsv3SetMode(true, 0o040755);
      const uid = new structs.Nfsv3SetUid(false);
      const gid = new structs.Nfsv3SetGid(false);
      const size = new structs.Nfsv3SetSize(false);
      const atime = new structs.Nfsv3SetAtime(Nfsv3TimeHow.DONT_CHANGE);
      const mtime = new structs.Nfsv3SetMtime(Nfsv3TimeHow.DONT_CHANGE);
      const sattr = new structs.Nfsv3Sattr(mode, uid, gid, size, atime, mtime);
      const request = new msg.Nfsv3MkdirRequest(dirOpArgs, sattr);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.MKDIR, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.MKDIR, true) as msg.Nfsv3MkdirRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3MkdirRequest);
      expect(decoded.where.name).toBe('newdir');
      expect(decoded.attributes.mode.mode).toBe(0o040755);
    });
  });

  describe('SYMLINK', () => {
    test('encodes and decodes SYMLINK request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const dirOpArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fhData), 'mylink');
      const mode = new structs.Nfsv3SetMode(true, 0o120777);
      const uid = new structs.Nfsv3SetUid(false);
      const gid = new structs.Nfsv3SetGid(false);
      const size = new structs.Nfsv3SetSize(false);
      const atime = new structs.Nfsv3SetAtime(Nfsv3TimeHow.DONT_CHANGE);
      const mtime = new structs.Nfsv3SetMtime(Nfsv3TimeHow.DONT_CHANGE);
      const sattr = new structs.Nfsv3Sattr(mode, uid, gid, size, atime, mtime);
      const request = new msg.Nfsv3SymlinkRequest(dirOpArgs, sattr, '/path/to/target');
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.SYMLINK, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.SYMLINK, true) as msg.Nfsv3SymlinkRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3SymlinkRequest);
      expect(decoded.where.name).toBe('mylink');
      expect(decoded.symlinkData).toBe('/path/to/target');
    });
  });

  describe('REMOVE', () => {
    test('encodes and decodes REMOVE request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const dirOpArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fhData), 'file-to-remove.txt');
      const request = new msg.Nfsv3RemoveRequest(dirOpArgs);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.REMOVE, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.REMOVE, true) as msg.Nfsv3RemoveRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3RemoveRequest);
      expect(decoded.object.name).toBe('file-to-remove.txt');
    });
  });

  describe('RENAME', () => {
    test('encodes and decodes RENAME request', () => {
      const fromFh = new Uint8Array([1, 2, 3, 4]);
      const toFh = new Uint8Array([5, 6, 7, 8]);
      const fromArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fromFh), 'oldname.txt');
      const toArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(toFh), 'newname.txt');
      const request = new msg.Nfsv3RenameRequest(fromArgs, toArgs);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.RENAME, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.RENAME, true) as msg.Nfsv3RenameRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3RenameRequest);
      expect(decoded.from.name).toBe('oldname.txt');
      expect(decoded.to.name).toBe('newname.txt');
    });
  });

  describe('READDIR', () => {
    test('encodes and decodes READDIR request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const cookieverf = new Uint8Array(8);
      const request = new msg.Nfsv3ReaddirRequest(new structs.Nfsv3Fh(fhData), BigInt(0), cookieverf, 4096);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.READDIR, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.READDIR, true) as msg.Nfsv3ReaddirRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3ReaddirRequest);
      expect(decoded.cookie).toBe(BigInt(0));
      expect(decoded.count).toBe(4096);
    });

    test('encodes and decodes READDIR response', () => {
      const postOpAttr = new structs.Nfsv3PostOpAttr(false);
      const cookieverf = new Uint8Array(8);
      const entry1 = new structs.Nfsv3Entry(BigInt(123), 'file1.txt', BigInt(1));
      const entry2 = new structs.Nfsv3Entry(BigInt(124), 'file2.txt', BigInt(2), entry1);
      const dirList = new structs.Nfsv3DirList(true, entry2);
      const resok = new msg.Nfsv3ReaddirResOk(postOpAttr, cookieverf, dirList);
      const response = new msg.Nfsv3ReaddirResponse(Nfsv3Stat.NFS3_OK, resok);
      const encoded = encoder.encodeMessage(response, Nfsv3Proc.READDIR, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.READDIR, false) as msg.Nfsv3ReaddirResponse;
      expect(decoded).toBeInstanceOf(msg.Nfsv3ReaddirResponse);
      expect(decoded.status).toBe(Nfsv3Stat.NFS3_OK);
      expect(decoded.resok).toBeDefined();
      expect(decoded.resok!.reply.eof).toBe(true);
      expect(decoded.resok!.reply.entries).toBeDefined();
      expect(decoded.resok!.reply.entries!.name).toBe('file2.txt');
      expect(decoded.resok!.reply.entries!.nextentry).toBeDefined();
      expect(decoded.resok!.reply.entries!.nextentry!.name).toBe('file1.txt');
    });
  });

  describe('COMMIT', () => {
    test('encodes and decodes COMMIT request', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const request = new msg.Nfsv3CommitRequest(new structs.Nfsv3Fh(fhData), BigInt(0), 4096);
      const encoded = encoder.encodeMessage(request, Nfsv3Proc.COMMIT, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), Nfsv3Proc.COMMIT, true) as msg.Nfsv3CommitRequest;
      expect(decoded).toBeInstanceOf(msg.Nfsv3CommitRequest);
      expect(decoded.offset).toBe(BigInt(0));
      expect(decoded.count).toBe(4096);
    });
  });
});
