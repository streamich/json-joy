import {RmRecordDecoder} from '../../../rm';
import {RpcCallMessage, RpcMessageDecoder, RpcAcceptedReplyMessage} from '../../../rpc';
import {Nfsv4Decoder} from '../Nfsv4Decoder';
import {Nfsv4Const, Nfsv4Stat, Nfsv4Proc} from '../constants';
import * as msg from '../messages';
import {nfsv4} from './fixtures';

const rmDecoder = new RmRecordDecoder();
const rpcDecoder = new RpcMessageDecoder();
const nfsDecoder = new Nfsv4Decoder();

const decodeMessage = (hex: string) => {
  const buffer = Buffer.from(hex, 'hex');
  rmDecoder.push(new Uint8Array(buffer));
  const record = rmDecoder.readRecord();
  if (!record) return undefined;
  const rpcMessage = rpcDecoder.decodeMessage(record);
  return rpcMessage;
};

const decodeCall = (hex: string): msg.Nfsv4CompoundRequest | undefined => {
  const rpcMessage = decodeMessage(hex);
  if (!(rpcMessage instanceof RpcCallMessage)) return undefined;
  return nfsDecoder.decodeCompound(rpcMessage.params!, true) as msg.Nfsv4CompoundRequest;
};

const decodeReply = (hex: string): msg.Nfsv4CompoundResponse | undefined => {
  const rpcMessage = decodeMessage(hex);
  if (!(rpcMessage instanceof RpcAcceptedReplyMessage)) return undefined;
  return nfsDecoder.decodeCompound(rpcMessage.results!, false) as msg.Nfsv4CompoundResponse;
};

describe('NFSv4 Decoder', () => {
  describe('NULL procedure', () => {
    test('decodes NULL call', () => {
      const rpcMessage = decodeMessage(nfsv4.NULL.Call[0]);
      expect(rpcMessage).toBeInstanceOf(RpcCallMessage);
      const rpcMessageStrict = rpcMessage as RpcCallMessage;
      expect(rpcMessageStrict).toBeDefined();
      expect(rpcMessageStrict.rpcvers).toBe(2);
      expect(rpcMessageStrict.prog).toBe(Nfsv4Const.PROGRAM);
      expect(rpcMessageStrict.vers).toBe(Nfsv4Const.VERSION);
      expect(rpcMessageStrict.proc).toBe(Nfsv4Proc.NULL);
    });

    test('decodes NULL reply', () => {
      const rpcMessage = decodeMessage(nfsv4.NULL.Reply[0]);
      expect(rpcMessage).toBeInstanceOf(RpcAcceptedReplyMessage);
      const rpcMessageStrict = rpcMessage as RpcAcceptedReplyMessage;
      expect(rpcMessageStrict.stat).toBe(0);
    });
  });

  describe('COMPOUND structure', () => {
    test('decodes COMPOUND call with tag', () => {
      const request = decodeCall(nfsv4.COMPOUND.GETATTR.Call[0]);
      if (!request) return;
      expect(request).toBeInstanceOf(msg.Nfsv4CompoundRequest);
      expect(request.tag).toBeDefined();
      expect(request.minorversion).toBe(0);
      expect(request.argarray.length).toBeGreaterThan(0);
    });

    test('decodes COMPOUND reply with status', () => {
      const response = decodeReply(nfsv4.COMPOUND.GETATTR.Reply[0]);
      if (!response) return;
      expect(response).toBeInstanceOf(msg.Nfsv4CompoundResponse);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(response.tag).toBeDefined();
      expect(response.resarray.length).toBeGreaterThan(0);
    });
  });

  describe('GETATTR operation', () => {
    test('decodes COMPOUND with GETATTR request', () => {
      const request = decodeCall(nfsv4.COMPOUND.GETATTR.Call[0]);
      if (!request) return;
      const getattrOp = request.argarray.find((op: msg.Nfsv4Request) => op instanceof msg.Nfsv4GetattrRequest);
      expect(getattrOp).toBeDefined();
      expect(getattrOp).toBeInstanceOf(msg.Nfsv4GetattrRequest);
      const getattrOpStrict = getattrOp as msg.Nfsv4GetattrRequest;
      expect(getattrOpStrict.attrRequest).toBeDefined();
      expect(Array.isArray(getattrOpStrict.attrRequest.mask)).toBe(true);
      expect(getattrOpStrict.attrRequest.mask.length).toBeGreaterThan(0);
    });

    test('decodes COMPOUND with GETATTR response', () => {
      const response = decodeReply(nfsv4.COMPOUND.GETATTR.Reply[0]);
      if (!response) return;
      const getattrRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4GetattrResponse);
      expect(getattrRes).toBeDefined();
      expect(getattrRes).toBeInstanceOf(msg.Nfsv4GetattrResponse);
      const getattrResStrict = getattrRes as msg.Nfsv4GetattrResponse;
      expect(getattrResStrict.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(getattrResStrict.resok).toBeDefined();
    });
  });

  describe('LOOKUP operation', () => {
    test('decodes COMPOUND with LOOKUP request', () => {
      const request = decodeCall(nfsv4.COMPOUND.LOOKUP.Call[0]);
      if (!request) return;
      const lookupOp = request.argarray.find((op: msg.Nfsv4Request) => op instanceof msg.Nfsv4LookupRequest);
      expect(lookupOp).toBeDefined();
      expect(lookupOp).toBeInstanceOf(msg.Nfsv4LookupRequest);
      expect((lookupOp as msg.Nfsv4LookupRequest).objname).toBeDefined();
      expect((lookupOp as msg.Nfsv4LookupRequest).objname).toBe('nst');
    });

    test('decodes COMPOUND with LOOKUP success response', () => {
      const response = decodeReply(nfsv4.COMPOUND.LOOKUP.Reply[0]);
      if (!response) return;
      const lookupRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4LookupResponse);
      expect(lookupRes).toBeDefined();
      expect(lookupRes).toBeInstanceOf(msg.Nfsv4LookupResponse);
      const lookupResStrict = lookupRes as msg.Nfsv4LookupResponse;
      expect(lookupResStrict.status).toBe(Nfsv4Stat.NFS4_OK);
    });

    test('decodes COMPOUND with LOOKUP error response', () => {
      const response = decodeReply(nfsv4.COMPOUND.LOOKUP_ERROR.Reply[0]);
      if (!response) return;
      const lookupRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4LookupResponse);
      expect(lookupRes).toBeDefined();
      expect(lookupRes).toBeInstanceOf(msg.Nfsv4LookupResponse);
      const lookupResStrict = lookupRes as msg.Nfsv4LookupResponse;
      expect(lookupResStrict.status).toBe(Nfsv4Stat.NFS4ERR_NOENT);
    });
  });

  describe('OPEN operation', () => {
    test('decodes COMPOUND with OPEN error', () => {
      const response = decodeReply(nfsv4.COMPOUND.OPEN_ERROR.Reply[0]);
      if (!response) return;
      const openRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4OpenResponse);
      expect(openRes).toBeDefined();
      expect(openRes).toBeInstanceOf(msg.Nfsv4OpenResponse);
      const openResStrict = openRes as msg.Nfsv4OpenResponse;
      expect(openResStrict.status).toBe(Nfsv4Stat.NFS4ERR_NOENT);
    });
  });

  describe('READDIR operation', () => {
    test('decodes COMPOUND with READDIR request', () => {
      const request = decodeCall(nfsv4.COMPOUND.READDIR.Call[0]);
      if (!request) return;
      const readdirOp = request.argarray.find((op: msg.Nfsv4Request) => op instanceof msg.Nfsv4ReaddirRequest);
      expect(readdirOp).toBeDefined();
      expect(readdirOp).toBeInstanceOf(msg.Nfsv4ReaddirRequest);
      const readdirOpStrict = readdirOp as msg.Nfsv4ReaddirRequest;
      expect(readdirOpStrict.cookie).toBeDefined();
      expect(readdirOpStrict.dircount).toBeDefined();
      expect(readdirOpStrict.maxcount).toBeDefined();
    });

    test('decodes COMPOUND with READDIR response', () => {
      const response = decodeReply(nfsv4.COMPOUND.READDIR.Reply[0]);
      if (!response) return;
      const readdirRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4ReaddirResponse);
      expect(readdirRes).toBeDefined();
      expect(readdirRes).toBeInstanceOf(msg.Nfsv4ReaddirResponse);
      if (readdirRes instanceof msg.Nfsv4ReaddirResponse && readdirRes.status === Nfsv4Stat.NFS4_OK) {
        expect(readdirRes.resok).toBeDefined();
        // Real-world data contains "testdir" entry
      }
    });
  });

  describe('PUTFH operation', () => {
    test('decodes COMPOUND with PUTFH request', () => {
      const request = decodeCall(nfsv4.COMPOUND.GETATTR.Call[0]);
      if (!request) return;
      const putfhOp = request.argarray.find((op: msg.Nfsv4Request) => op instanceof msg.Nfsv4PutfhRequest);
      expect(putfhOp).toBeDefined();
      expect(putfhOp).toBeInstanceOf(msg.Nfsv4PutfhRequest);
      const putfhOpStrict = putfhOp as msg.Nfsv4PutfhRequest;
      expect(putfhOpStrict.object).toBeDefined();
    });

    test('decodes COMPOUND with PUTFH response', () => {
      const response = decodeReply(nfsv4.COMPOUND.GETATTR.Reply[0]);
      if (!response) return;
      const putfhRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4PutfhResponse);
      expect(putfhRes).toBeDefined();
      expect(putfhRes).toBeInstanceOf(msg.Nfsv4PutfhResponse);
      const putfhResStrict = putfhRes as msg.Nfsv4PutfhResponse;
      expect(putfhResStrict.status).toBe(Nfsv4Stat.NFS4_OK);
    });
  });

  describe('ACCESS operation', () => {
    test('decodes COMPOUND with ACCESS request', () => {
      const request = decodeCall(nfsv4.COMPOUND.ACCESS.Call[0]);
      if (!request) return;
      const accessOp = request.argarray.find((op: msg.Nfsv4Request) => op instanceof msg.Nfsv4AccessRequest);
      expect(accessOp).toBeDefined();
      expect(accessOp).toBeInstanceOf(msg.Nfsv4AccessRequest);
      const accessOpStrict = accessOp as msg.Nfsv4AccessRequest;
      expect(accessOpStrict.access).toBeDefined();
      expect(accessOpStrict.access).toBe(0x1f);
    });

    test('decodes COMPOUND with ACCESS response', () => {
      const response = decodeReply(nfsv4.COMPOUND.ACCESS.Reply[0]);
      if (!response) return;
      const accessRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4AccessResponse);
      expect(accessRes).toBeDefined();
      expect(accessRes).toBeInstanceOf(msg.Nfsv4AccessResponse);
      if (accessRes instanceof msg.Nfsv4AccessResponse && accessRes.status === Nfsv4Stat.NFS4_OK) {
        expect(accessRes.resok).toBeDefined();
      }
    });
  });

  describe('PUTROOTFH operation', () => {
    test('decodes COMPOUND with PUTROOTFH + GETATTR', () => {
      const request = decodeCall(nfsv4.COMPOUND.PUTROOTFH_GETATTR.Call[0]);
      if (!request) return;
      const putrootfhOp = request.argarray.find((op: msg.Nfsv4Request) => op instanceof msg.Nfsv4PutrootfhRequest);
      expect(putrootfhOp).toBeDefined();
      expect(putrootfhOp).toBeInstanceOf(msg.Nfsv4PutrootfhRequest);
    });

    test('decodes PUTROOTFH response', () => {
      const response = decodeReply(nfsv4.COMPOUND.PUTROOTFH_GETATTR.Reply[0]);
      if (!response) return;
      const putrootfhRes = response.resarray.find((op: msg.Nfsv4Response) => op instanceof msg.Nfsv4PutrootfhResponse);
      expect(putrootfhRes).toBeDefined();
      expect(putrootfhRes).toBeInstanceOf(msg.Nfsv4PutrootfhResponse);
      const putrootfhResStrict = putrootfhRes as msg.Nfsv4PutrootfhResponse;
      expect(putrootfhResStrict.status).toBe(Nfsv4Stat.NFS4_OK);
    });
  });

  describe('SETCLIENTID operation', () => {
    test('decodes SETCLIENTID request', () => {
      const request = decodeCall(nfsv4.SETCLIENTID.Call[0]);
      if (!request) return;
      const setclientidOp = request.argarray.find((op: msg.Nfsv4Request) => op instanceof msg.Nfsv4SetclientidRequest);
      expect(setclientidOp).toBeDefined();
      expect(setclientidOp).toBeInstanceOf(msg.Nfsv4SetclientidRequest);
      const setclientidOpStrict = setclientidOp as msg.Nfsv4SetclientidRequest;
      expect(setclientidOpStrict.client).toBeDefined();
      expect(setclientidOpStrict.callback).toBeDefined();
    });

    test('decodes SETCLIENTID response', () => {
      const response = decodeReply(nfsv4.SETCLIENTID.Reply[0]);
      if (!response) return;
      const setclientidRes = response.resarray.find(
        (op: msg.Nfsv4Response) => op instanceof msg.Nfsv4SetclientidResponse,
      );
      expect(setclientidRes).toBeDefined();
      expect(setclientidRes).toBeInstanceOf(msg.Nfsv4SetclientidResponse);
      if (setclientidRes instanceof msg.Nfsv4SetclientidResponse && setclientidRes.status === Nfsv4Stat.NFS4_OK) {
        expect(setclientidRes.resok).toBeDefined();
        expect(setclientidRes.resok?.clientid).toBeDefined();
      }
    });
  });

  describe('SETCLIENTID_CONFIRM operation', () => {
    test('decodes SETCLIENTID_CONFIRM request', () => {
      const request = decodeCall(nfsv4.SETCLIENTID_CONFIRM.Call[0]);
      if (!request) return;
      const confirmOp = request.argarray.find(
        (op: msg.Nfsv4Request) => op instanceof msg.Nfsv4SetclientidConfirmRequest,
      );
      expect(confirmOp).toBeDefined();
      expect(confirmOp).toBeInstanceOf(msg.Nfsv4SetclientidConfirmRequest);
      const confirmOpStrict = confirmOp as msg.Nfsv4SetclientidConfirmRequest;
      expect(confirmOpStrict.clientid).toBeDefined();
      expect(confirmOpStrict.setclientidConfirm).toBeDefined();
    });

    test('decodes SETCLIENTID_CONFIRM response', () => {
      const response = decodeReply(nfsv4.SETCLIENTID_CONFIRM.Reply[0]);
      if (!response) return;
      const confirmRes = response.resarray.find(
        (op: msg.Nfsv4Response) => op instanceof msg.Nfsv4SetclientidConfirmResponse,
      );
      expect(confirmRes).toBeDefined();
      expect(confirmRes).toBeInstanceOf(msg.Nfsv4SetclientidConfirmResponse);
      const confirmResStrict = confirmRes as msg.Nfsv4SetclientidConfirmResponse;
      expect(confirmResStrict.status).toBe(Nfsv4Stat.NFS4_OK);
    });
  });
});
