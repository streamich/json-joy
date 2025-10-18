import {RmRecordDecoder} from '../../../rm';
import {RpcCallMessage, RpcMessageDecoder, RpcAcceptedReplyMessage} from '../../../rpc';
import {Nfsv3Decoder} from '../Nfsv3Decoder';
import {Nfsv3Proc, Nfsv3Stat} from '../constants';
import * as msg from '../messages';
import {nfsv3} from './fixtures';

const rmDecoder = new RmRecordDecoder();
const rpcDecoder = new RpcMessageDecoder();
const nfsDecoder = new Nfsv3Decoder();

const decodeMessage = (hex: string) => {
  const buffer = Buffer.from(hex, 'hex');
  rmDecoder.push(new Uint8Array(buffer));
  const record = rmDecoder.readRecord();
  if (!record) return undefined;
  const rpcMessage = rpcDecoder.decodeMessage(record);
  return rpcMessage;
};

const decodeCall = (hex: string): {proc: Nfsv3Proc; request: msg.Nfsv3Request} | undefined => {
  const rpcMessage = decodeMessage(hex);
  if (!(rpcMessage instanceof RpcCallMessage)) return undefined;
  const request = nfsDecoder.decodeMessage(rpcMessage.params!, rpcMessage.proc, true) as msg.Nfsv3Request;
  return {proc: rpcMessage.proc, request};
};

const decodeReply = (hex: string, proc: Nfsv3Proc): msg.Nfsv3Response | undefined => {
  const rpcMessage = decodeMessage(hex);
  if (!(rpcMessage instanceof RpcAcceptedReplyMessage)) return undefined;
  return nfsDecoder.decodeMessage(rpcMessage.results!, proc, false) as msg.Nfsv3Response;
};

describe('NFSv3 Decoder with real traffic', () => {
  describe('GETATTR', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.GETATTR.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.GETATTR);
      expect(request).toBeInstanceOf(msg.Nfsv3GetattrRequest);
      expect(request).toBeDefined();
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.GETATTR.Reply[0], Nfsv3Proc.GETATTR);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3GetattrResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
      expect(response.resok).toBeDefined();
    });
  });

  describe('LOOKUP', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.LOOKUP.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.LOOKUP);
      expect(request).toBeInstanceOf(msg.Nfsv3LookupRequest);
      const lookupReq = request as msg.Nfsv3LookupRequest;
      expect(lookupReq.what.name).toBe('hello');
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.LOOKUP.Reply[0], Nfsv3Proc.LOOKUP);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3LookupResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3ERR_NOENT);
    });
  });

  describe('ACCESS', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.ACCESS.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.ACCESS);
      expect(request).toBeInstanceOf(msg.Nfsv3AccessRequest);
      const accessReq = request as msg.Nfsv3AccessRequest;
      expect(accessReq.access).toBe(0x1f);
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.ACCESS.Reply[0], Nfsv3Proc.ACCESS);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3AccessResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
      const accessResp = response as msg.Nfsv3AccessResponse;
      expect(accessResp.resok).toBeDefined();
      expect(accessResp.resok!.access).toBe(0x1f);
    });
  });

  describe('WRITE', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.WRITE.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.WRITE);
      expect(request).toBeInstanceOf(msg.Nfsv3WriteRequest);
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.WRITE.Reply[0], Nfsv3Proc.WRITE);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3WriteResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
      const writeResp = response as msg.Nfsv3WriteResponse;
      expect(writeResp.resok).toBeDefined();
      expect(writeResp.resok!.count).toBe(32768);
    });
  });

  describe('CREATE', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.CREATE.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.CREATE);
      expect(request).toBeInstanceOf(msg.Nfsv3CreateRequest);
      const createReq = request as msg.Nfsv3CreateRequest;
      expect(createReq.where.name).toBe('temp.file');
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.CREATE.Reply[0], Nfsv3Proc.CREATE);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3CreateResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
    });
  });

  describe('MKDIR', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.MKDIR.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.MKDIR);
      expect(request).toBeInstanceOf(msg.Nfsv3MkdirRequest);
      const mkdirReq = request as msg.Nfsv3MkdirRequest;
      expect(mkdirReq.where.name).toBe('hello');
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.MKDIR.Reply[0], Nfsv3Proc.MKDIR);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3MkdirResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
    });
  });

  describe('REMOVE', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.REMOVE.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.REMOVE);
      expect(request).toBeInstanceOf(msg.Nfsv3RemoveRequest);
      const removeReq = request as msg.Nfsv3RemoveRequest;
      expect(removeReq.object.name).toBe('temp.file');
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.REMOVE.Reply[0], Nfsv3Proc.REMOVE);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3RemoveResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
    });
  });

  describe('RMDIR', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.RMDIR.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.RMDIR);
      expect(request).toBeInstanceOf(msg.Nfsv3RmdirRequest);
      const rmdirReq = request as msg.Nfsv3RmdirRequest;
      expect(rmdirReq.object.name).toBe('hello');
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.RMDIR.Reply[0], Nfsv3Proc.RMDIR);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3RmdirResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
    });
  });

  describe('READDIRPLUS', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.READDIRPLUS.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.READDIRPLUS);
      expect(request).toBeInstanceOf(msg.Nfsv3ReaddirplusRequest);
      const readdirReq = request as msg.Nfsv3ReaddirplusRequest;
      expect(readdirReq.cookie).toBe(BigInt(0));
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.READDIRPLUS.Reply[0], Nfsv3Proc.READDIRPLUS);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3ReaddirplusResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
    });
  });

  describe('COMMIT', () => {
    test('decodes call message', () => {
      const result = decodeCall(nfsv3.COMMIT.Call[0]);
      if (!result) return;
      const {proc, request} = result;
      expect(proc).toBe(Nfsv3Proc.COMMIT);
      expect(request).toBeInstanceOf(msg.Nfsv3CommitRequest);
      const commitReq = request as msg.Nfsv3CommitRequest;
      expect(commitReq.offset).toBe(BigInt(0));
    });

    test('decodes reply message', () => {
      const response = decodeReply(nfsv3.COMMIT.Reply[0], Nfsv3Proc.COMMIT);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv3CommitResponse);
      expect(response.status).toBe(Nfsv3Stat.NFS3_OK);
    });
  });
});
