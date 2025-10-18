import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {Nfsv4Encoder} from '../Nfsv4Encoder';
import {Nfsv4Decoder} from '../Nfsv4Decoder';
import * as msg from '../messages';
import * as structs from '../structs';
import {Nfsv4Stat} from '../constants';

describe('Nfsv4Encoder', () => {
  describe('COMPOUND structure', () => {
    it('encodes and decodes empty COMPOUND request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const request = new msg.Nfsv4CompoundRequest('test-tag', 0, []);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.tag).toBe('test-tag');
      expect(decoded.minorversion).toBe(0);
      expect(decoded.argarray).toEqual([]);
    });

    it('encodes and decodes COMPOUND response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, 'response-tag', []);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(decoded.tag).toBe('response-tag');
      expect(decoded.resarray).toEqual([]);
    });
  });

  describe('GETATTR operation', () => {
    it('encodes and decodes GETATTR request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const bitmap = new structs.Nfsv4Bitmap([0x00000001, 0x00000002]);
      const getattrReq = new msg.Nfsv4GetattrRequest(bitmap);
      const request = new msg.Nfsv4CompoundRequest('', 0, [getattrReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4GetattrRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4GetattrRequest);
      expect(decodedReq.attrRequest.mask).toEqual([0x00000001, 0x00000002]);
    });

    it('encodes and decodes GETATTR response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const bitmap = new structs.Nfsv4Bitmap([0x00000001]);
      const attrVals = new Uint8Array([0, 0, 0, 1]);
      const fattr = new structs.Nfsv4Fattr(bitmap, attrVals);
      const getattrRes = new msg.Nfsv4GetattrResponse(Nfsv4Stat.NFS4_OK, new msg.Nfsv4GetattrResOk(fattr));
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [getattrRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4GetattrResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4GetattrResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(decodedRes.resok).toBeDefined();
      expect(decodedRes.resok!.objAttributes.attrmask.mask).toEqual([0x00000001]);
    });
  });

  describe('PUTFH operation', () => {
    it('encodes and decodes PUTFH request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const fh = new structs.Nfsv4Fh(new Uint8Array([1, 2, 3, 4]));
      const putfhReq = new msg.Nfsv4PutfhRequest(fh);
      const request = new msg.Nfsv4CompoundRequest('', 0, [putfhReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4PutfhRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4PutfhRequest);
      expect(decodedReq.object.data).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it('encodes and decodes PUTFH response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const putfhRes = new msg.Nfsv4PutfhResponse(Nfsv4Stat.NFS4_OK);
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [putfhRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4PutfhResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4PutfhResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
    });
  });

  describe('LOOKUP operation', () => {
    it('encodes and decodes LOOKUP request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const lookupReq = new msg.Nfsv4LookupRequest('testfile.txt');
      const request = new msg.Nfsv4CompoundRequest('', 0, [lookupReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4LookupRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4LookupRequest);
      expect(decodedReq.objname).toBe('testfile.txt');
    });

    it('encodes and decodes LOOKUP response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const lookupRes = new msg.Nfsv4LookupResponse(Nfsv4Stat.NFS4_OK);
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [lookupRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4LookupResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4LookupResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
    });
  });

  describe('ACCESS operation', () => {
    it('encodes and decodes ACCESS request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const accessReq = new msg.Nfsv4AccessRequest(0x0000001f);
      const request = new msg.Nfsv4CompoundRequest('', 0, [accessReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4AccessRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4AccessRequest);
      expect(decodedReq.access).toBe(0x0000001f);
    });

    it('encodes and decodes ACCESS response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const accessRes = new msg.Nfsv4AccessResponse(
        Nfsv4Stat.NFS4_OK,
        new msg.Nfsv4AccessResOk(0x0000001f, 0x0000001f),
      );
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [accessRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4AccessResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4AccessResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(decodedRes.resok!.supported).toBe(0x0000001f);
      expect(decodedRes.resok!.access).toBe(0x0000001f);
    });
  });

  describe('PUTROOTFH operation', () => {
    it('encodes and decodes PUTROOTFH request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const putrootfhReq = new msg.Nfsv4PutrootfhRequest();
      const request = new msg.Nfsv4CompoundRequest('', 0, [putrootfhReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4PutrootfhRequest);
    });

    it('encodes and decodes PUTROOTFH response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const putrootfhRes = new msg.Nfsv4PutrootfhResponse(Nfsv4Stat.NFS4_OK);
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [putrootfhRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4PutrootfhResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4PutrootfhResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
    });
  });

  describe('GETFH operation', () => {
    it('encodes and decodes GETFH request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const getfhReq = new msg.Nfsv4GetfhRequest();
      const request = new msg.Nfsv4CompoundRequest('', 0, [getfhReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4GetfhRequest);
    });

    it('encodes and decodes GETFH response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const fh = new structs.Nfsv4Fh(new Uint8Array([5, 6, 7, 8]));
      const getfhRes = new msg.Nfsv4GetfhResponse(Nfsv4Stat.NFS4_OK, new msg.Nfsv4GetfhResOk(fh));
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [getfhRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4GetfhResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4GetfhResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(decodedRes.resok!.object.data).toEqual(new Uint8Array([5, 6, 7, 8]));
    });
  });

  describe('READ operation', () => {
    it('encodes and decodes READ request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const stateid = new structs.Nfsv4Stateid(1, new Uint8Array(12).fill(0xff));
      const readReq = new msg.Nfsv4ReadRequest(stateid, BigInt(0), 4096);
      const request = new msg.Nfsv4CompoundRequest('', 0, [readReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4ReadRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4ReadRequest);
      expect(decodedReq.stateid.seqid).toBe(1);
      expect(decodedReq.offset).toBe(BigInt(0));
      expect(decodedReq.count).toBe(4096);
    });

    it('encodes and decodes READ response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const data = new Uint8Array([1, 2, 3, 4]);
      const readRes = new msg.Nfsv4ReadResponse(Nfsv4Stat.NFS4_OK, new msg.Nfsv4ReadResOk(false, data));
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [readRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4ReadResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4ReadResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(decodedRes.resok!.eof).toBe(false);
      expect(decodedRes.resok!.data).toEqual(data);
    });
  });

  describe('WRITE operation', () => {
    it('encodes and decodes WRITE request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const stateid = new structs.Nfsv4Stateid(1, new Uint8Array(12).fill(0xaa));
      const data = new Uint8Array([10, 20, 30, 40]);
      const writeReq = new msg.Nfsv4WriteRequest(stateid, BigInt(0), 1, data);
      const request = new msg.Nfsv4CompoundRequest('', 0, [writeReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4WriteRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4WriteRequest);
      expect(decodedReq.stateid.seqid).toBe(1);
      expect(decodedReq.offset).toBe(BigInt(0));
      expect(decodedReq.stable).toBe(1);
      expect(decodedReq.data).toEqual(data);
    });

    it('encodes and decodes WRITE response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const verifier = new structs.Nfsv4Verifier(new Uint8Array(8).fill(0x12));
      const writeRes = new msg.Nfsv4WriteResponse(Nfsv4Stat.NFS4_OK, new msg.Nfsv4WriteResOk(4, 1, verifier));
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [writeRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4WriteResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4WriteResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(decodedRes.resok!.count).toBe(4);
      expect(decodedRes.resok!.committed).toBe(1);
      expect(decodedRes.resok!.writeverf.data).toEqual(new Uint8Array(8).fill(0x12));
    });
  });

  describe('SETCLIENTID operation', () => {
    it('encodes and decodes SETCLIENTID request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const verifier = new structs.Nfsv4Verifier(new Uint8Array(8).fill(0xab));
      const clientId = new structs.Nfsv4ClientId(verifier, new Uint8Array([1, 2, 3]));
      const clientAddr = new structs.Nfsv4ClientAddr('tcp', '192.168.1.100.8.1');
      const cbClient = new structs.Nfsv4CbClient(0x40000000, clientAddr);
      const setclientidReq = new msg.Nfsv4SetclientidRequest(clientId, cbClient, 12345);
      const request = new msg.Nfsv4CompoundRequest('', 0, [setclientidReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4SetclientidRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4SetclientidRequest);
      expect(decodedReq.client.verifier.data).toEqual(new Uint8Array(8).fill(0xab));
      expect(decodedReq.client.id).toEqual(new Uint8Array([1, 2, 3]));
      expect(decodedReq.callback.cbProgram).toBe(0x40000000);
      expect(decodedReq.callbackIdent).toBe(12345);
    });

    it('encodes and decodes SETCLIENTID response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const verifier = new structs.Nfsv4Verifier(new Uint8Array(8).fill(0xcd));
      const setclientidRes = new msg.Nfsv4SetclientidResponse(
        Nfsv4Stat.NFS4_OK,
        new msg.Nfsv4SetclientidResOk(BigInt(123456789), verifier),
      );
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [setclientidRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4SetclientidResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4SetclientidResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(decodedRes.resok!.clientid).toBe(BigInt(123456789));
      expect(decodedRes.resok!.setclientidConfirm.data).toEqual(new Uint8Array(8).fill(0xcd));
    });
  });

  describe('SETCLIENTID_CONFIRM operation', () => {
    it('encodes and decodes SETCLIENTID_CONFIRM request', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const verifier = new structs.Nfsv4Verifier(new Uint8Array(8).fill(0xef));
      const setclientidConfirmReq = new msg.Nfsv4SetclientidConfirmRequest(BigInt(987654321), verifier);
      const request = new msg.Nfsv4CompoundRequest('', 0, [setclientidConfirmReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray).toHaveLength(1);
      const decodedReq = decoded.argarray[0] as msg.Nfsv4SetclientidConfirmRequest;
      expect(decodedReq).toBeInstanceOf(msg.Nfsv4SetclientidConfirmRequest);
      expect(decodedReq.clientid).toBe(BigInt(987654321));
      expect(decodedReq.setclientidConfirm.data).toEqual(new Uint8Array(8).fill(0xef));
    });

    it('encodes and decodes SETCLIENTID_CONFIRM response', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const setclientidConfirmRes = new msg.Nfsv4SetclientidConfirmResponse(Nfsv4Stat.NFS4_OK);
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [setclientidConfirmRes]);
      const encoded = encoder.encodeCompound(response, false);
      const decoded = decoder.decodeCompound(new Reader(encoded), false) as msg.Nfsv4CompoundResponse;
      expect(decoded.resarray).toHaveLength(1);
      const decodedRes = decoded.resarray[0] as msg.Nfsv4SetclientidConfirmResponse;
      expect(decodedRes).toBeInstanceOf(msg.Nfsv4SetclientidConfirmResponse);
      expect(decodedRes.status).toBe(Nfsv4Stat.NFS4_OK);
    });
  });

  describe('complex COMPOUND requests', () => {
    it('encodes and decodes multi-operation COMPOUND', () => {
      const encoder = new Nfsv4Encoder();
      const decoder = new Nfsv4Decoder();
      const putrootfhReq = new msg.Nfsv4PutrootfhRequest();
      const lookupReq = new msg.Nfsv4LookupRequest('home');
      const getfhReq = new msg.Nfsv4GetfhRequest();
      const bitmap = new structs.Nfsv4Bitmap([0x00000001]);
      const getattrReq = new msg.Nfsv4GetattrRequest(bitmap);
      const request = new msg.Nfsv4CompoundRequest('multi-op', 0, [putrootfhReq, lookupReq, getfhReq, getattrReq]);
      const encoded = encoder.encodeCompound(request, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.tag).toBe('multi-op');
      expect(decoded.argarray).toHaveLength(4);
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4PutrootfhRequest);
      expect(decoded.argarray[1]).toBeInstanceOf(msg.Nfsv4LookupRequest);
      expect((decoded.argarray[1] as msg.Nfsv4LookupRequest).objname).toBe('home');
      expect(decoded.argarray[2]).toBeInstanceOf(msg.Nfsv4GetfhRequest);
      expect(decoded.argarray[3]).toBeInstanceOf(msg.Nfsv4GetattrRequest);
    });
  });
});
