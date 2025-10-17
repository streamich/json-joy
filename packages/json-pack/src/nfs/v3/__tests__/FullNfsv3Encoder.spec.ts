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
import {Nfsv3Encoder} from '../Nfsv3Encoder';
import {Nfsv3Decoder} from '../Nfsv3Decoder';
import {FullNfsv3Encoder} from '../FullNfsv3Encoder';
import {Nfsv3Proc, Nfsv3Stat, Nfsv3FType} from '../constants';
import * as msg from '../messages';
import * as structs from '../structs';

describe('FullNfsv3Encoder', () => {
  const rmDecoder = new RmRecordDecoder();
  const rpcDecoder = new RpcMessageDecoder();
  const nfsDecoder = new Nfsv3Decoder();

  const createTestRequest = (): msg.Nfsv3GetattrRequest => {
    const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    return new msg.Nfsv3GetattrRequest(new structs.Nfsv3Fh(fhData));
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
    test('encodes GETATTR request correctly', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const request = createTestRequest();
      const xid = 12345;
      const proc = Nfsv3Proc.GETATTR;
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
      const nfsRequest = nfsDecoder.decodeMessage(call.params!, proc, true);
      expect(nfsRequest).toBeInstanceOf(msg.Nfsv3GetattrRequest);
      expect((nfsRequest as msg.Nfsv3GetattrRequest).object.data).toEqual(request.object.data);
    });

    test('produces same output as separate encoders', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const nfsEncoder = new Nfsv3Encoder();
      const rpcEncoder = new RpcMessageEncoder();
      const rmEncoder = new RmRecordEncoder();
      const request = createTestRequest();
      const xid = 12345;
      const proc = Nfsv3Proc.GETATTR;
      const cred = createTestCred();
      const verf = createTestVerf();
      const fullEncoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      const nfsEncoded = nfsEncoder.encodeMessage(request, proc, true);
      const rpcEncoded = rpcEncoder.encodeCall(xid, 100003, 3, proc, cred, verf, nfsEncoded);
      const rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
      expect(fullEncoded).toEqual(rmEncoded);
    });
  });

  describe('encoding with different request types', () => {
    test('encodes LOOKUP request', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const dirOpArgs = new structs.Nfsv3DirOpArgs(new structs.Nfsv3Fh(fhData), 'test.txt');
      const request = new msg.Nfsv3LookupRequest(dirOpArgs);
      const xid = 54321;
      const proc = Nfsv3Proc.LOOKUP;
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
      const nfsRequest = nfsDecoder.decodeMessage(call.params!, proc, true) as msg.Nfsv3LookupRequest;
      expect(nfsRequest).toBeInstanceOf(msg.Nfsv3LookupRequest);
      expect(nfsRequest.what.name).toBe('test.txt');
    });

    test('encodes READ request', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const fhData = new Uint8Array([1, 2, 3, 4]);
      const request = new msg.Nfsv3ReadRequest(new structs.Nfsv3Fh(fhData), BigInt(0), 4096);
      const xid = 99999;
      const proc = Nfsv3Proc.READ;
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
      const nfsRequest = nfsDecoder.decodeMessage(call.params!, proc, true) as msg.Nfsv3ReadRequest;
      expect(nfsRequest).toBeInstanceOf(msg.Nfsv3ReadRequest);
      expect(nfsRequest.count).toBe(4096);
    });
  });

  describe('edge cases', () => {
    test('handles empty auth credentials', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const request = createTestRequest();
      const xid = 1;
      const proc = Nfsv3Proc.GETATTR;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      expect(encoded.length).toBeGreaterThan(0);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
    });

    test('handles large file handles', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const fhData = new Uint8Array(64).fill(0xff);
      const request = new msg.Nfsv3GetattrRequest(new structs.Nfsv3Fh(fhData));
      const xid = 1;
      const proc = Nfsv3Proc.GETATTR;
      const cred = createTestCred();
      const verf = createTestVerf();
      const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
      expect(encoded.length).toBeGreaterThan(0);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      const call = rpcMessage as RpcCallMessage;
      const nfsRequest = nfsDecoder.decodeMessage(call.params!, proc, true) as msg.Nfsv3GetattrRequest;
      expect(nfsRequest.object.data).toEqual(fhData);
    });
  });

  describe('response encoding', () => {
    test('encodes GETATTR success response correctly', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const xid = 12345;
      const proc = Nfsv3Proc.GETATTR;
      const verf = createTestVerf();
      const fattr = new structs.Nfsv3Fattr(
        Nfsv3FType.NF3REG,
        0o644,
        1,
        1000,
        1000,
        BigInt(1024),
        BigInt(1024),
        new structs.Nfsv3SpecData(0, 0),
        BigInt(1),
        BigInt(12345),
        new structs.Nfsv3Time(1234567890, 0),
        new structs.Nfsv3Time(1234567890, 0),
        new structs.Nfsv3Time(1234567890, 0),
      );
      const resok = new msg.Nfsv3GetattrResOk(fattr);
      const response = new msg.Nfsv3GetattrResponse(Nfsv3Stat.NFS3_OK, resok);
      const encoded = fullEncoder.encodeAcceptedReply(xid, proc, verf, response);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcAcceptedReplyMessage);
      const reply = rpcMessage as RpcAcceptedReplyMessage;
      expect(reply.xid).toBe(xid);
      const nfsResponse = nfsDecoder.decodeMessage(reply.results!, proc, false) as msg.Nfsv3GetattrResponse;
      expect(nfsResponse).toBeInstanceOf(msg.Nfsv3GetattrResponse);
      expect(nfsResponse.status).toBe(Nfsv3Stat.NFS3_OK);
      expect(nfsResponse.resok).toBeDefined();
      expect(nfsResponse.resok!.objAttributes.size).toBe(BigInt(1024));
    });

    test('encodes READ success response correctly', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const xid = 54321;
      const proc = Nfsv3Proc.READ;
      const verf = createTestVerf();
      const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const postOpAttr = new structs.Nfsv3PostOpAttr(false);
      const resok = new msg.Nfsv3ReadResOk(postOpAttr, data.length, true, data);
      const response = new msg.Nfsv3ReadResponse(Nfsv3Stat.NFS3_OK, resok);
      const encoded = fullEncoder.encodeAcceptedReply(xid, proc, verf, response);
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcAcceptedReplyMessage);
      const reply = rpcMessage as RpcAcceptedReplyMessage;
      expect(reply.xid).toBe(xid);
      const nfsResponse = nfsDecoder.decodeMessage(reply.results!, proc, false) as msg.Nfsv3ReadResponse;
      expect(nfsResponse).toBeInstanceOf(msg.Nfsv3ReadResponse);
      expect(nfsResponse.status).toBe(Nfsv3Stat.NFS3_OK);
      expect(nfsResponse.resok).toBeDefined();
      expect(nfsResponse.resok!.data).toEqual(data);
      expect(nfsResponse.resok!.eof).toBe(true);
    });

    test('produces same output as separate encoders for responses', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const nfsEncoder = new Nfsv3Encoder();
      const rpcEncoder = new RpcMessageEncoder();
      const rmEncoder = new RmRecordEncoder();
      const xid = 12345;
      const proc = Nfsv3Proc.GETATTR;
      const verf = createTestVerf();
      const fattr = new structs.Nfsv3Fattr(
        Nfsv3FType.NF3REG,
        0o644,
        1,
        1000,
        1000,
        BigInt(1024),
        BigInt(1024),
        new structs.Nfsv3SpecData(0, 0),
        BigInt(1),
        BigInt(12345),
        new structs.Nfsv3Time(1234567890, 0),
        new structs.Nfsv3Time(1234567890, 0),
        new structs.Nfsv3Time(1234567890, 0),
      );
      const resok = new msg.Nfsv3GetattrResOk(fattr);
      const response = new msg.Nfsv3GetattrResponse(Nfsv3Stat.NFS3_OK, resok);
      const fullEncoded = fullEncoder.encodeAcceptedReply(xid, proc, verf, response);
      const nfsEncoded = nfsEncoder.encodeMessage(response, proc, false);
      const rpcEncoded = rpcEncoder.encodeAcceptedReply(xid, verf, 0, undefined, nfsEncoded);
      const rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
      expect(fullEncoded).toEqual(rmEncoded);
    });
  });

  describe('rejected reply encoding', () => {
    test('encodes RPC_MISMATCH rejected reply', () => {
      const fullEncoder = new FullNfsv3Encoder();
      const xid = 99999;
      const encoded = fullEncoder.encodeRejectedReply(xid, RpcRejectStat.RPC_MISMATCH, {low: 2, high: 2});
      rmDecoder.push(encoded);
      const rmRecord = rmDecoder.readRecord();
      expect(rmRecord).toBeDefined();
      const rpcMessage = rpcDecoder.decodeMessage(rmRecord!);
      expect(rpcMessage).toBeInstanceOf(RpcRejectedReplyMessage);
      const reply = rpcMessage as RpcRejectedReplyMessage;
      expect(reply.xid).toBe(xid);
      expect(reply.stat).toBe(RpcRejectStat.RPC_MISMATCH);
      expect(reply.mismatchInfo).toBeDefined();
      expect(reply.mismatchInfo!.low).toBe(2);
      expect(reply.mismatchInfo!.high).toBe(2);
    });

    test('encodes AUTH_ERROR rejected reply', () => {
      const fullEncoder = new FullNfsv3Encoder();
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
      const fullEncoder = new FullNfsv3Encoder();
      const rpcEncoder = new RpcMessageEncoder();
      const rmEncoder = new RmRecordEncoder();
      const xid = 12345;
      const fullEncoded = fullEncoder.encodeRejectedReply(xid, RpcRejectStat.RPC_MISMATCH, {low: 2, high: 2});
      const rpcEncoded = rpcEncoder.encodeRejectedReply(xid, RpcRejectStat.RPC_MISMATCH, {low: 2, high: 2});
      const rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
      expect(fullEncoded).toEqual(rmEncoded);
    });
  });
});
