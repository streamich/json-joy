import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {MountEncoder} from '../MountEncoder';
import {MountDecoder} from '../MountDecoder';
import {MountProc, MountStat} from '../constants';
import * as msg from '../messages';
import * as structs from '../structs';

describe('MountEncoder', () => {
  let encoder: MountEncoder;
  let decoder: MountDecoder;

  beforeEach(() => {
    encoder = new MountEncoder();
    decoder = new MountDecoder();
  });

  describe('MNT', () => {
    it('encodes and decodes MNT request', () => {
      const dirpath = '/export/home';
      const request = new msg.MountMntRequest(dirpath);
      const encoded = encoder.encodeMessage(request, MountProc.MNT, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, true) as msg.MountMntRequest;
      expect(decoded).toBeInstanceOf(msg.MountMntRequest);
      expect(decoded.dirpath).toBe(dirpath);
    });

    it('encodes and decodes MNT success response', () => {
      const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      const fhandle = new structs.MountFhandle3(new Reader(fhData));
      const authFlavors = [0, 1, 6];
      const mountinfo = new msg.MountMntResOk(fhandle, authFlavors);
      const response = new msg.MountMntResponse(MountStat.MNT3_OK, mountinfo);
      const encoded = encoder.encodeMessage(response, MountProc.MNT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, false) as msg.MountMntResponse;
      expect(decoded).toBeInstanceOf(msg.MountMntResponse);
      expect(decoded.status).toBe(MountStat.MNT3_OK);
      expect(decoded.mountinfo).toBeDefined();
      expect(decoded.mountinfo!.fhandle.data.uint8).toEqual(fhData);
      expect(decoded.mountinfo!.authFlavors).toEqual(authFlavors);
    });

    it('encodes and decodes MNT error response', () => {
      const response = new msg.MountMntResponse(MountStat.MNT3ERR_ACCES);
      const encoded = encoder.encodeMessage(response, MountProc.MNT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, false) as msg.MountMntResponse;
      expect(decoded).toBeInstanceOf(msg.MountMntResponse);
      expect(decoded.status).toBe(MountStat.MNT3ERR_ACCES);
      expect(decoded.mountinfo).toBeUndefined();
    });

    it('handles empty auth flavors', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const fhandle = new structs.MountFhandle3(new Reader(fhData));
      const authFlavors: number[] = [];
      const mountinfo = new msg.MountMntResOk(fhandle, authFlavors);
      const response = new msg.MountMntResponse(MountStat.MNT3_OK, mountinfo);
      const encoded = encoder.encodeMessage(response, MountProc.MNT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, false) as msg.MountMntResponse;
      expect(decoded.mountinfo!.authFlavors).toEqual([]);
    });

    it('handles multiple auth flavors', () => {
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const fhandle = new structs.MountFhandle3(new Reader(fhData));
      const authFlavors = [0, 1, 2, 3, 4, 5, 6];
      const mountinfo = new msg.MountMntResOk(fhandle, authFlavors);
      const response = new msg.MountMntResponse(MountStat.MNT3_OK, mountinfo);
      const encoded = encoder.encodeMessage(response, MountProc.MNT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, false) as msg.MountMntResponse;
      expect(decoded.mountinfo!.authFlavors).toEqual(authFlavors);
    });
  });

  describe('DUMP', () => {
    it('encodes and decodes DUMP request', () => {
      const request = new msg.MountDumpRequest();
      const encoded = encoder.encodeMessage(request, MountProc.DUMP, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.DUMP, true);
      expect(decoded).toBeInstanceOf(msg.MountDumpRequest);
    });

    it('encodes and decodes DUMP response with empty list', () => {
      const response = new msg.MountDumpResponse(undefined);
      const encoded = encoder.encodeMessage(response, MountProc.DUMP, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.DUMP, false) as msg.MountDumpResponse;
      expect(decoded).toBeInstanceOf(msg.MountDumpResponse);
      expect(decoded.mountlist).toBeUndefined();
    });

    it('encodes and decodes DUMP response with single entry', () => {
      const mountBody = new structs.MountBody('client1.example.com', '/export/home', undefined);
      const response = new msg.MountDumpResponse(mountBody);
      const encoded = encoder.encodeMessage(response, MountProc.DUMP, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.DUMP, false) as msg.MountDumpResponse;
      expect(decoded.mountlist).toBeDefined();
      expect(decoded.mountlist!.hostname).toBe('client1.example.com');
      expect(decoded.mountlist!.directory).toBe('/export/home');
      expect(decoded.mountlist!.next).toBeUndefined();
    });

    it('encodes and decodes DUMP response with multiple entries', () => {
      const entry3 = new structs.MountBody('client3.example.com', '/export/data', undefined);
      const entry2 = new structs.MountBody('client2.example.com', '/export/www', entry3);
      const entry1 = new structs.MountBody('client1.example.com', '/export/home', entry2);
      const response = new msg.MountDumpResponse(entry1);
      const encoded = encoder.encodeMessage(response, MountProc.DUMP, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.DUMP, false) as msg.MountDumpResponse;
      expect(decoded.mountlist).toBeDefined();
      expect(decoded.mountlist!.hostname).toBe('client1.example.com');
      expect(decoded.mountlist!.directory).toBe('/export/home');
      expect(decoded.mountlist!.next).toBeDefined();
      expect(decoded.mountlist!.next!.hostname).toBe('client2.example.com');
      expect(decoded.mountlist!.next!.next).toBeDefined();
      expect(decoded.mountlist!.next!.next!.hostname).toBe('client3.example.com');
      expect(decoded.mountlist!.next!.next!.next).toBeUndefined();
    });
  });

  describe('UMNT', () => {
    it('encodes and decodes UMNT request', () => {
      const dirpath = '/export/home';
      const request = new msg.MountUmntRequest(dirpath);
      const encoded = encoder.encodeMessage(request, MountProc.UMNT, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.UMNT, true) as msg.MountUmntRequest;
      expect(decoded).toBeInstanceOf(msg.MountUmntRequest);
      expect(decoded.dirpath).toBe(dirpath);
    });

    it('handles long directory paths', () => {
      const dirpath = '/very/long/path/to/export/directory/with/many/components/test';
      const request = new msg.MountUmntRequest(dirpath);
      const encoded = encoder.encodeMessage(request, MountProc.UMNT, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.UMNT, true) as msg.MountUmntRequest;
      expect(decoded.dirpath).toBe(dirpath);
    });
  });

  describe('UMNTALL', () => {
    it('encodes and decodes UMNTALL request', () => {
      const request = new msg.MountUmntallRequest();
      const encoded = encoder.encodeMessage(request, MountProc.UMNTALL, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.UMNTALL, true);
      expect(decoded).toBeInstanceOf(msg.MountUmntallRequest);
    });
  });

  describe('EXPORT', () => {
    it('encodes and decodes EXPORT request', () => {
      const request = new msg.MountExportRequest();
      const encoded = encoder.encodeMessage(request, MountProc.EXPORT, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.EXPORT, true);
      expect(decoded).toBeInstanceOf(msg.MountExportRequest);
    });

    it('encodes and decodes EXPORT response with empty list', () => {
      const response = new msg.MountExportResponse(undefined);
      const encoded = encoder.encodeMessage(response, MountProc.EXPORT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.EXPORT, false) as msg.MountExportResponse;
      expect(decoded).toBeInstanceOf(msg.MountExportResponse);
      expect(decoded.exports).toBeUndefined();
    });

    it('encodes and decodes EXPORT response with single export (no groups)', () => {
      const exportNode = new structs.MountExportNode('/export/home', undefined, undefined);
      const response = new msg.MountExportResponse(exportNode);
      const encoded = encoder.encodeMessage(response, MountProc.EXPORT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.EXPORT, false) as msg.MountExportResponse;
      expect(decoded.exports).toBeDefined();
      expect(decoded.exports!.dir).toBe('/export/home');
      expect(decoded.exports!.groups).toBeUndefined();
      expect(decoded.exports!.next).toBeUndefined();
    });

    it('encodes and decodes EXPORT response with single group', () => {
      const group = new structs.MountGroupNode('trusted-hosts', undefined);
      const exportNode = new structs.MountExportNode('/export/home', group, undefined);
      const response = new msg.MountExportResponse(exportNode);
      const encoded = encoder.encodeMessage(response, MountProc.EXPORT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.EXPORT, false) as msg.MountExportResponse;
      expect(decoded.exports!.groups).toBeDefined();
      expect(decoded.exports!.groups!.name).toBe('trusted-hosts');
      expect(decoded.exports!.groups!.next).toBeUndefined();
    });

    it('encodes and decodes EXPORT response with multiple groups', () => {
      const group3 = new structs.MountGroupNode('admin-hosts', undefined);
      const group2 = new structs.MountGroupNode('web-servers', group3);
      const group1 = new structs.MountGroupNode('trusted-hosts', group2);
      const exportNode = new structs.MountExportNode('/export/home', group1, undefined);
      const response = new msg.MountExportResponse(exportNode);
      const encoded = encoder.encodeMessage(response, MountProc.EXPORT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.EXPORT, false) as msg.MountExportResponse;
      expect(decoded.exports!.groups!.name).toBe('trusted-hosts');
      expect(decoded.exports!.groups!.next!.name).toBe('web-servers');
      expect(decoded.exports!.groups!.next!.next!.name).toBe('admin-hosts');
      expect(decoded.exports!.groups!.next!.next!.next).toBeUndefined();
    });

    it('encodes and decodes EXPORT response with multiple exports', () => {
      const group2 = new structs.MountGroupNode('group2', undefined);
      const group1 = new structs.MountGroupNode('group1', group2);
      const export3 = new structs.MountExportNode('/export/data', undefined, undefined);
      const export2 = new structs.MountExportNode('/export/www', group1, export3);
      const export1 = new structs.MountExportNode('/export/home', undefined, export2);
      const response = new msg.MountExportResponse(export1);
      const encoded = encoder.encodeMessage(response, MountProc.EXPORT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.EXPORT, false) as msg.MountExportResponse;
      expect(decoded.exports!.dir).toBe('/export/home');
      expect(decoded.exports!.groups).toBeUndefined();
      expect(decoded.exports!.next!.dir).toBe('/export/www');
      expect(decoded.exports!.next!.groups!.name).toBe('group1');
      expect(decoded.exports!.next!.next!.dir).toBe('/export/data');
    });
  });

  describe('edge cases', () => {
    it('handles empty directory path', () => {
      const request = new msg.MountMntRequest('');
      const encoded = encoder.encodeMessage(request, MountProc.MNT, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, true) as msg.MountMntRequest;
      expect(decoded.dirpath).toBe('');
    });

    it('handles large file handle', () => {
      const fhData = new Uint8Array(64).fill(255);
      const fhandle = new structs.MountFhandle3(new Reader(fhData));
      const authFlavors = [0];
      const mountinfo = new msg.MountMntResOk(fhandle, authFlavors);
      const response = new msg.MountMntResponse(MountStat.MNT3_OK, mountinfo);
      const encoded = encoder.encodeMessage(response, MountProc.MNT, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, false) as msg.MountMntResponse;
      expect(decoded.mountinfo!.fhandle.data.uint8).toEqual(fhData);
    });

    it('handles various error codes', () => {
      const errorCodes = [
        MountStat.MNT3ERR_PERM,
        MountStat.MNT3ERR_NOENT,
        MountStat.MNT3ERR_IO,
        MountStat.MNT3ERR_ACCES,
        MountStat.MNT3ERR_NOTDIR,
        MountStat.MNT3ERR_INVAL,
        MountStat.MNT3ERR_NAMETOOLONG,
        MountStat.MNT3ERR_NOTSUPP,
        MountStat.MNT3ERR_SERVERFAULT,
      ];
      for (const errorCode of errorCodes) {
        const response = new msg.MountMntResponse(errorCode);
        const encoded = encoder.encodeMessage(response, MountProc.MNT, false);
        const decoded = decoder.decodeMessage(new Reader(encoded), MountProc.MNT, false) as msg.MountMntResponse;
        expect(decoded.status).toBe(errorCode);
      }
    });
  });
});
