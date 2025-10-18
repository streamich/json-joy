import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {RmRecordEncoder, RmRecordDecoder} from '../../../rm';
import {
  RpcMessageEncoder,
  RpcMessageDecoder,
  RpcCallMessage,
  RpcAcceptedReplyMessage,
  RpcRejectedReplyMessage,
} from '../../../rpc';
import {RpcRejectStat, RpcAuthStat} from '../../../rpc/constants';
import {Nfsv4Encoder} from '../Nfsv4Encoder';
import {Nfsv4Decoder} from '../Nfsv4Decoder';
import {Nfsv4FullEncoder} from '../Nfsv4FullEncoder';
import {Nfsv4Proc, Nfsv4Stat} from '../constants';
import * as msg from '../messages';
import * as structs from '../structs';

describe('FullNfsv4Encoder', () => {
  const rmDecoder = new RmRecordDecoder();
  const rpcDecoder = new RpcMessageDecoder();
  const nfsDecoder = new Nfsv4Decoder();

  const createTestRequest = (): msg.Nfsv4CompoundRequest => {
    const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(fhData));
    const getattr = new msg.Nfsv4GetattrRequest(new structs.Nfsv4Bitmap([0, 1]));
    return new msg.Nfsv4CompoundRequest('test', 0, [putfh, getattr]);
  };

  const createTestCred = () => {
    return {
      flavor: 0,
      body: new Reader(new Uint8Array()),
    };
  };

  const createTestVerf = () => {
    return {
      flavor: 0,
      body: new Reader(new Uint8Array()),
    };
  };

  describe('encoding correctness', () => {
    test('encodes COMPOUND request correctly', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const request = createTestRequest();
      const xid = 12345;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcCallMessage);
      const call = rpcMessage as RpcCallMessage;
      expect(call.xid).toBe(xid);
      expect(call.proc).toBe(proc);
      const nfsRequest = nfsDecoder.decodeCompound(call.params!, true);
      expect(nfsRequest).toBeInstanceOf(msg.Nfsv4CompoundRequest);
      expect((nfsRequest as msg.Nfsv4CompoundRequest).tag).toBe('test');
      expect((nfsRequest as msg.Nfsv4CompoundRequest).argarray.length).toBe(2);
    });

    test('produces same output as separate encoders', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const nfsEncoder = new Nfsv4Encoder();
      const rpcEncoder = new RpcMessageEncoder();
      const rmEncoder = new RmRecordEncoder();
      const request = createTestRequest();
      const xid = 12345;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const fullEncoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      const nfsEncoded = nfsEncoder.encodeCompound(request, true);
      const rpcEncoded = rpcEncoder.encodeCall(xid, 100003, 4, proc, cred, verf, nfsEncoded);
      const rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
      expect(fullEncoded).toEqual(rmEncoded);
    });
  });

  describe('encoding with different request types', () => {
    test('encodes LOOKUP request', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(fhData));
      const lookup = new msg.Nfsv4LookupRequest('test.txt');
      const request = new msg.Nfsv4CompoundRequest('lookup', 0, [putfh, lookup]);
      const xid = 54321;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcCallMessage);
      const call = rpcMessage as RpcCallMessage;
      expect(call.xid).toBe(xid);
      expect(call.proc).toBe(proc);
      const nfsRequest = nfsDecoder.decodeCompound(call.params!, true) as msg.Nfsv4CompoundRequest;
      expect(nfsRequest).toBeInstanceOf(msg.Nfsv4CompoundRequest);
      expect(nfsRequest.argarray.length).toBe(2);
      expect(nfsRequest.argarray[1]).toBeInstanceOf(msg.Nfsv4LookupRequest);
      expect((nfsRequest.argarray[1] as msg.Nfsv4LookupRequest).objname).toBe('test.txt');
    });

    test('encodes READ request', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(fhData));
      const stateid = new structs.Nfsv4Stateid(0, new Uint8Array(12).fill(0));
      const read = new msg.Nfsv4ReadRequest(stateid, BigInt(0), 4096);
      const request = new msg.Nfsv4CompoundRequest('read', 0, [putfh, read]);
      const xid = 99999;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcCallMessage);
      const call = rpcMessage as RpcCallMessage;
      expect(call.xid).toBe(xid);
      expect(call.proc).toBe(proc);
      const nfsRequest = nfsDecoder.decodeCompound(call.params!, true) as msg.Nfsv4CompoundRequest;
      expect(nfsRequest).toBeInstanceOf(msg.Nfsv4CompoundRequest);
      expect(nfsRequest.argarray.length).toBe(2);
      expect(nfsRequest.argarray[1]).toBeInstanceOf(msg.Nfsv4ReadRequest);
      expect((nfsRequest.argarray[1] as msg.Nfsv4ReadRequest).count).toBe(4096);
    });
  });

  describe('edge cases', () => {
    test('handles empty auth credentials', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const request = createTestRequest();
      const xid = 1;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      expect(encoded.length).toBeGreaterThan(0);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
    });

    test('handles large file handles', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const fhData = new Uint8Array(128).fill(0xff);
      const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(fhData));
      const getattr = new msg.Nfsv4GetattrRequest(new structs.Nfsv4Bitmap([0]));
      const request = new msg.Nfsv4CompoundRequest('large-fh', 0, [putfh, getattr]);
      const xid = 1;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      expect(encoded.length).toBeGreaterThan(0);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      const call = rpcMessage as RpcCallMessage;
      const nfsRequest = nfsDecoder.decodeCompound(call.params!, true) as msg.Nfsv4CompoundRequest;
      expect(nfsRequest.argarray[0]).toBeInstanceOf(msg.Nfsv4PutfhRequest);
      expect((nfsRequest.argarray[0] as msg.Nfsv4PutfhRequest).object.data).toEqual(fhData);
    });

    test('handles empty COMPOUND request', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const request = new msg.Nfsv4CompoundRequest('empty', 0, []);
      const xid = 1;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      expect(encoded.length).toBeGreaterThan(0);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      const call = rpcMessage as RpcCallMessage;
      const nfsRequest = nfsDecoder.decodeCompound(call.params!, true) as msg.Nfsv4CompoundRequest;
      expect(nfsRequest.argarray.length).toBe(0);
    });
  });

  describe('response encoding', () => {
    test('encodes COMPOUND success response correctly', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const xid = 12345;
      const proc = Nfsv4Proc.COMPOUND;
      const verf = createTestVerf();
      const putfhRes = new msg.Nfsv4PutfhResponse(Nfsv4Stat.NFS4_OK);
      const getattrRes = new msg.Nfsv4GetattrResponse(
        Nfsv4Stat.NFS4_OK,
        new msg.Nfsv4GetattrResOk(new structs.Nfsv4Fattr(new structs.Nfsv4Bitmap([0]), new Uint8Array())),
      );
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, 'test', [putfhRes, getattrRes]);
      const encoded = fullEncoder.encodeAcceptedCompoundReply(xid, proc, verf, response);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcAcceptedReplyMessage);
      const reply = rpcMessage as RpcAcceptedReplyMessage;
      expect(reply.xid).toBe(xid);
      const nfsResponse = nfsDecoder.decodeCompound(reply.results!, false) as msg.Nfsv4CompoundResponse;
      expect(nfsResponse).toBeInstanceOf(msg.Nfsv4CompoundResponse);
      expect(nfsResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(nfsResponse.resarray.length).toBe(2);
    });

    test('encodes READ success response correctly', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const xid = 54321;
      const proc = Nfsv4Proc.COMPOUND;
      const verf = createTestVerf();
      const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const putfhRes = new msg.Nfsv4PutfhResponse(Nfsv4Stat.NFS4_OK);
      const readRes = new msg.Nfsv4ReadResponse(Nfsv4Stat.NFS4_OK, new msg.Nfsv4ReadResOk(true, data));
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, 'read', [putfhRes, readRes]);
      const encoded = fullEncoder.encodeAcceptedCompoundReply(xid, proc, verf, response);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcAcceptedReplyMessage);
      const reply = rpcMessage as RpcAcceptedReplyMessage;
      expect(reply.xid).toBe(xid);
      const nfsResponse = nfsDecoder.decodeCompound(reply.results!, false) as msg.Nfsv4CompoundResponse;
      expect(nfsResponse).toBeInstanceOf(msg.Nfsv4CompoundResponse);
      expect(nfsResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(nfsResponse.resarray.length).toBe(2);
      expect(nfsResponse.resarray[1]).toBeInstanceOf(msg.Nfsv4ReadResponse);
      const readResult = nfsResponse.resarray[1] as msg.Nfsv4ReadResponse;
      expect(readResult.resok).toBeDefined();
      expect(readResult.resok!.data).toEqual(data);
      expect(readResult.resok!.eof).toBe(true);
    });

    test('produces same output as separate encoders for responses', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const nfsEncoder = new Nfsv4Encoder();
      const rpcEncoder = new RpcMessageEncoder();
      const rmEncoder = new RmRecordEncoder();
      const xid = 12345;
      const proc = Nfsv4Proc.COMPOUND;
      const verf = createTestVerf();
      const putfhRes = new msg.Nfsv4PutfhResponse(Nfsv4Stat.NFS4_OK);
      const getattrRes = new msg.Nfsv4GetattrResponse(
        Nfsv4Stat.NFS4_OK,
        new msg.Nfsv4GetattrResOk(new structs.Nfsv4Fattr(new structs.Nfsv4Bitmap([0]), new Uint8Array())),
      );
      const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, 'test', [putfhRes, getattrRes]);
      const fullEncoded = fullEncoder.encodeAcceptedCompoundReply(xid, proc, verf, response);
      const nfsEncoded = nfsEncoder.encodeCompound(response, false);
      const rpcEncoded = rpcEncoder.encodeAcceptedReply(xid, verf, 0, undefined, nfsEncoded);
      const rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
      expect(fullEncoded).toEqual(rmEncoded);
    });
  });

  describe('rejected reply encoding', () => {
    test('encodes RPC_MISMATCH rejected reply', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const xid = 99999;
      const encoded = fullEncoder.encodeRejectedReply(xid, RpcRejectStat.RPC_MISMATCH, {low: 4, high: 4});
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcRejectedReplyMessage);
      const reply = rpcMessage as RpcRejectedReplyMessage;
      expect(reply.xid).toBe(xid);
      expect(reply.stat).toBe(RpcRejectStat.RPC_MISMATCH);
      expect(reply.mismatchInfo).toBeDefined();
      expect(reply.mismatchInfo!.low).toBe(4);
      expect(reply.mismatchInfo!.high).toBe(4);
    });

    test('encodes AUTH_ERROR rejected reply', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const xid = 88888;
      const encoded = fullEncoder.encodeRejectedReply(
        xid,
        RpcRejectStat.AUTH_ERROR,
        undefined,
        RpcAuthStat.AUTH_TOOWEAK,
      );
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcRejectedReplyMessage);
      const reply = rpcMessage as RpcRejectedReplyMessage;
      expect(reply.xid).toBe(xid);
      expect(reply.stat).toBe(RpcRejectStat.AUTH_ERROR);
      expect(reply.authStat).toBe(RpcAuthStat.AUTH_TOOWEAK);
    });

    test('produces same output as separate encoders for rejected replies', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const rpcEncoder = new RpcMessageEncoder();
      const rmEncoder = new RmRecordEncoder();
      const xid = 12345;
      const fullEncoded = fullEncoder.encodeRejectedReply(xid, RpcRejectStat.RPC_MISMATCH, {low: 4, high: 4});
      const rpcEncoded = rpcEncoder.encodeRejectedReply(xid, RpcRejectStat.RPC_MISMATCH, {low: 4, high: 4});
      const rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
      expect(fullEncoded).toEqual(rmEncoded);
    });
  });

  describe('multi-operation COMPOUND requests', () => {
    test('encodes complex multi-operation COMPOUND', () => {
      const fullEncoder = new Nfsv4FullEncoder();
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(fhData));
      const lookup = new msg.Nfsv4LookupRequest('file.txt');
      const getfh = new msg.Nfsv4GetfhRequest();
      const getattr = new msg.Nfsv4GetattrRequest(new structs.Nfsv4Bitmap([0, 1]));
      const access = new msg.Nfsv4AccessRequest(0x1f);
      const request = new msg.Nfsv4CompoundRequest('multi-op', 0, [putfh, lookup, getfh, getattr, access]);
      const xid = 77777;
      const proc = Nfsv4Proc.COMPOUND;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      const call = rpcMessage as RpcCallMessage;
      const nfsRequest = nfsDecoder.decodeCompound(call.params!, true) as msg.Nfsv4CompoundRequest;
      expect(nfsRequest.argarray.length).toBe(5);
      expect(nfsRequest.argarray[0]).toBeInstanceOf(msg.Nfsv4PutfhRequest);
      expect(nfsRequest.argarray[1]).toBeInstanceOf(msg.Nfsv4LookupRequest);
      expect(nfsRequest.argarray[2]).toBeInstanceOf(msg.Nfsv4GetfhRequest);
      expect(nfsRequest.argarray[3]).toBeInstanceOf(msg.Nfsv4GetattrRequest);
      expect(nfsRequest.argarray[4]).toBeInstanceOf(msg.Nfsv4AccessRequest);
    });
  });
});
