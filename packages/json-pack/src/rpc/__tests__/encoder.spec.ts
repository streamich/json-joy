import {RpcMessageEncoder} from '../RpcMessageEncoder';
import {RpcMessageDecoder} from '../RpcMessageDecoder';
import {RpcAuthFlavor, RpcAcceptStat, RpcRejectStat, RpcAuthStat, RPC_VERSION} from '../constants';
import {RpcOpaqueAuth, RpcCallMessage, RpcAcceptedReplyMessage, RpcRejectedReplyMessage} from '../messages';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';

describe('RpcMessageEncoder', () => {
  describe('CALL messages', () => {
    test('can encode a simple CALL message with AUTH_NULL', () => {
      const encoder = new RpcMessageEncoder();
      const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const encoded = encoder.encodeCall(1, 100, 1, 0, cred, verf);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(1);
      expect(msg).toBeInstanceOf(RpcCallMessage);
      const call = msg as RpcCallMessage;
      expect(call.rpcvers).toBe(RPC_VERSION);
      expect(call.prog).toBe(100);
      expect(call.vers).toBe(1);
      expect(call.proc).toBe(0);
      expect(call.cred.flavor).toBe(RpcAuthFlavor.AUTH_NULL);
      expect(call.verf.flavor).toBe(RpcAuthFlavor.AUTH_NULL);
    });

    test('can encode CALL message with opaque auth data', () => {
      const encoder = new RpcMessageEncoder();
      const credBody = new Reader(new Uint8Array([1, 2, 3, 4, 5]));
      const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_UNIX, credBody);
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const encoded = encoder.encodeCall(10, 200, 2, 5, cred, verf);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(10);
      const call = msg as RpcCallMessage;
      expect(call.prog).toBe(200);
      expect(call.vers).toBe(2);
      expect(call.proc).toBe(5);
      expect(call.cred.flavor).toBe(RpcAuthFlavor.AUTH_UNIX);
      expect(call.cred.body.buf()).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    test('can encode CALL message with parameters', () => {
      const encoder = new RpcMessageEncoder();
      const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const params = new Uint8Array([0, 0, 0, 42]);
      const encoded = encoder.encodeCall(15, 300, 1, 3, cred, verf, params);
      expect(encoded.length).toBeGreaterThan(40);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(15);
    });

    test('can encode CALL with RpcMessage object', () => {
      const encoder = new RpcMessageEncoder();
      const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const msg = new RpcCallMessage(20, RPC_VERSION, 100, 1, 0, cred, verf);
      const encoded = encoder.encodeMessage(msg);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const decoded = decoder.decodeMessage(reader)!;
      expect(decoded).toBeDefined();
      expect(decoded.xid).toBe(20);
      expect((decoded as RpcCallMessage).prog).toBe(100);
    });
  });

  describe('REPLY messages - MSG_ACCEPTED', () => {
    test('can encode SUCCESS reply', () => {
      const encoder = new RpcMessageEncoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const results = new Uint8Array([0, 0, 0, 42]);
      const encoded = encoder.encodeAcceptedReply(1, verf, RpcAcceptStat.SUCCESS, undefined, results);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(1);
      expect(msg).toBeInstanceOf(RpcAcceptedReplyMessage);
      const reply = msg as RpcAcceptedReplyMessage;
      expect(reply.stat).toBe(RpcAcceptStat.SUCCESS);
    });

    test('can encode PROG_UNAVAIL reply', () => {
      const encoder = new RpcMessageEncoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const encoded = encoder.encodeAcceptedReply(2, verf, RpcAcceptStat.PROG_UNAVAIL);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(2);
      const reply = msg as RpcAcceptedReplyMessage;
      expect(reply.stat).toBe(RpcAcceptStat.PROG_UNAVAIL);
    });

    test('can encode PROG_MISMATCH reply', () => {
      const encoder = new RpcMessageEncoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const mismatchInfo = {low: 1, high: 3};
      const encoded = encoder.encodeAcceptedReply(3, verf, RpcAcceptStat.PROG_MISMATCH, mismatchInfo);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(3);
      const reply = msg as RpcAcceptedReplyMessage;
      expect(reply.stat).toBe(RpcAcceptStat.PROG_MISMATCH);
      expect(reply.mismatchInfo).toBeDefined();
      expect(reply.mismatchInfo!.low).toBe(1);
      expect(reply.mismatchInfo!.high).toBe(3);
    });

    test('can encode PROC_UNAVAIL reply', () => {
      const encoder = new RpcMessageEncoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const encoded = encoder.encodeAcceptedReply(4, verf, RpcAcceptStat.PROC_UNAVAIL);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(4);
      const reply = msg as RpcAcceptedReplyMessage;
      expect(reply.stat).toBe(RpcAcceptStat.PROC_UNAVAIL);
    });

    test('can encode GARBAGE_ARGS reply', () => {
      const encoder = new RpcMessageEncoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const encoded = encoder.encodeAcceptedReply(5, verf, RpcAcceptStat.GARBAGE_ARGS);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(5);
      const reply = msg as RpcAcceptedReplyMessage;
      expect(reply.stat).toBe(RpcAcceptStat.GARBAGE_ARGS);
    });

    test('can encode AcceptedReply with RpcMessage object', () => {
      const encoder = new RpcMessageEncoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const msg = new RpcAcceptedReplyMessage(25, verf, RpcAcceptStat.SUCCESS);
      const encoded = encoder.encodeMessage(msg);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const decoded = decoder.decodeMessage(reader)!;
      expect(decoded).toBeDefined();
      expect(decoded.xid).toBe(25);
      expect((decoded as RpcAcceptedReplyMessage).stat).toBe(RpcAcceptStat.SUCCESS);
    });
  });

  describe('REPLY messages - MSG_DENIED', () => {
    test('can encode RPC_MISMATCH reply', () => {
      const encoder = new RpcMessageEncoder();
      const mismatchInfo = {low: 2, high: 2};
      const encoded = encoder.encodeRejectedReply(6, RpcRejectStat.RPC_MISMATCH, mismatchInfo);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(6);
      expect(msg).toBeInstanceOf(RpcRejectedReplyMessage);
      const reply = msg as RpcRejectedReplyMessage;
      expect(reply.stat).toBe(RpcRejectStat.RPC_MISMATCH);
      expect(reply.mismatchInfo).toBeDefined();
      expect(reply.mismatchInfo!.low).toBe(2);
      expect(reply.mismatchInfo!.high).toBe(2);
    });

    test('can encode AUTH_ERROR reply', () => {
      const encoder = new RpcMessageEncoder();
      const encoded = encoder.encodeRejectedReply(7, RpcRejectStat.AUTH_ERROR, undefined, RpcAuthStat.AUTH_BADCRED);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      expect(msg.xid).toBe(7);
      const reply = msg as RpcRejectedReplyMessage;
      expect(reply.stat).toBe(RpcRejectStat.AUTH_ERROR);
      expect(reply.authStat).toBe(RpcAuthStat.AUTH_BADCRED);
    });

    test('can encode RejectedReply with RpcMessage object', () => {
      const encoder = new RpcMessageEncoder();
      const msg = new RpcRejectedReplyMessage(30, RpcRejectStat.AUTH_ERROR, undefined, RpcAuthStat.AUTH_TOOWEAK);
      const encoded = encoder.encodeMessage(msg);
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(encoded);
      const decoded = decoder.decodeMessage(reader)!;
      expect(decoded).toBeDefined();
      expect(decoded.xid).toBe(30);
      const reply = decoded as RpcRejectedReplyMessage;
      expect(reply.stat).toBe(RpcRejectStat.AUTH_ERROR);
      expect(reply.authStat).toBe(RpcAuthStat.AUTH_TOOWEAK);
    });
  });

  describe('round-trip encoding/decoding', () => {
    test('multiple messages can be encoded and decoded', () => {
      const encoder = new RpcMessageEncoder();
      const decoder = new RpcMessageDecoder();
      const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const encoded1 = encoder.encodeCall(100, 1000, 1, 0, cred, verf);
      const encoded2 = encoder.encodeCall(101, 1001, 1, 1, cred, verf);
      const encoded3 = encoder.encodeAcceptedReply(100, verf, RpcAcceptStat.SUCCESS);
      const reader1 = new Reader(encoded1);
      const msg1 = decoder.decodeMessage(reader1)!;
      expect(msg1.xid).toBe(100);
      expect((msg1 as RpcCallMessage).prog).toBe(1000);
      const reader2 = new Reader(encoded2);
      const msg2 = decoder.decodeMessage(reader2)!;
      expect(msg2.xid).toBe(101);
      expect((msg2 as RpcCallMessage).prog).toBe(1001);
      const reader3 = new Reader(encoded3);
      const msg3 = decoder.decodeMessage(reader3)!;
      expect(msg3.xid).toBe(100);
      expect((msg3 as RpcAcceptedReplyMessage).stat).toBe(RpcAcceptStat.SUCCESS);
    });

    test('handles auth body padding correctly', () => {
      const encoder = new RpcMessageEncoder();
      const decoder = new RpcMessageDecoder();
      const credBody1 = new Uint8Array([1]);
      const credBody2 = new Uint8Array([1, 2]);
      const credBody3 = new Uint8Array([1, 2, 3]);
      const credBody4 = new Uint8Array([1, 2, 3, 4]);
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const testCred = (body: Uint8Array, xid: number) => {
        const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_UNIX, new Reader(body));
        const encoded = encoder.encodeCall(xid, 100, 1, 0, cred, verf);
        const reader = new Reader(encoded);
        const msg = decoder.decodeMessage(reader)!;
        expect(msg.xid).toBe(xid);
        expect((msg as RpcCallMessage).cred.body.buf()).toEqual(body);
      };
      testCred(credBody1, 1);
      testCred(credBody2, 2);
      testCred(credBody3, 3);
      testCred(credBody4, 4);
    });
  });

  describe('Payload Encoding', () => {
    test('encodes CALL with procedure parameters', () => {
      const encoder = new RpcMessageEncoder();
      const decoder = new RpcMessageDecoder();
      const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const params = new Uint8Array([0x00, 0x00, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x45]);
      const encoded = encoder.encodeCall(1, 100, 1, 1, cred, verf, params);
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      const call = msg as RpcCallMessage;
      expect(call.params).toBeDefined();
      expect(call.params!.buf(call.params!.size())).toEqual(params);
    });

    test('encodes REPLY with result data', () => {
      const encoder = new RpcMessageEncoder();
      const decoder = new RpcMessageDecoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const results = new Uint8Array([0x00, 0x00, 0x00, 0x7b]);
      const encoded = encoder.encodeAcceptedReply(1, verf, RpcAcceptStat.SUCCESS, undefined, results);
      const reader = new Reader(encoded);
      const msg = decoder.decodeMessage(reader)!;
      expect(msg).toBeDefined();
      const reply = msg as RpcAcceptedReplyMessage;
      expect(reply.results).toBeDefined();
      expect(reply.results!.buf(reply.results!.size())).toEqual(results);
    });

    test('encodes RpcCallMessage with params field via encodeMessage', () => {
      const encoder = new RpcMessageEncoder();
      const decoder = new RpcMessageDecoder();
      const cred = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const params = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
      const msg = new RpcCallMessage(1, RPC_VERSION, 100, 1, 1, cred, verf, new Reader(params));
      const encoded = encoder.encodeMessage(msg);
      const reader = new Reader(encoded);
      const decoded = decoder.decodeMessage(reader)!;
      expect(decoded).toBeDefined();
      const decodedCall = decoded as RpcCallMessage;
      expect(decodedCall.params?.buf(decodedCall.params.size())).toEqual(params);
    });

    test('encodes RpcAcceptedReplyMessage with results field via encodeMessage', () => {
      const encoder = new RpcMessageEncoder();
      const decoder = new RpcMessageDecoder();
      const verf = new RpcOpaqueAuth(RpcAuthFlavor.AUTH_NULL, new Reader(new Uint8Array(0)));
      const results = new Uint8Array([0x00, 0x00, 0x01, 0x00]);
      const msg = new RpcAcceptedReplyMessage(1, verf, RpcAcceptStat.SUCCESS, undefined, new Reader(results));
      const encoded = encoder.encodeMessage(msg);
      const reader = new Reader(encoded);
      const decoded = decoder.decodeMessage(reader)!;
      expect(decoded).toBeDefined();
      const decodedReply = decoded as RpcAcceptedReplyMessage;
      expect(decodedReply.results?.buf(decodedReply.results.size())).toEqual(results);
    });
  });
});
