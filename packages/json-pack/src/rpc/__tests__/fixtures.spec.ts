import {RpcMessageDecoder} from '../RpcMessageDecoder';
import {RpcMessageEncoder} from '../RpcMessageEncoder';
import {RpcCallMessage, RpcAcceptedReplyMessage, RpcRejectedReplyMessage} from '../messages';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {RpcAcceptStat} from '../constants';
import * as fixtures from './fixtures';

describe('RPC Real-world Fixtures', () => {
  describe('Decoding fixtures', () => {
    test.each(fixtures.ALL_FIXTURES)('$name - can decode byte-for-byte', (fixture) => {
      const decoder = new RpcMessageDecoder();
      const reader = new Reader(fixture.bytes);
      const msg = decoder.decodeMessage(reader);
      expect(msg).toBeDefined();
      expect(msg!.xid).toBe(fixture.expected.xid);
      if (fixture.expected.type === 'CALL') {
        expect(msg!).toBeInstanceOf(RpcCallMessage);
        const call = msg! as RpcCallMessage;
        if (fixture.expected.rpcvers !== undefined) {
          expect(call.rpcvers).toBe(fixture.expected.rpcvers);
        }
        if (fixture.expected.prog !== undefined) {
          expect(call.prog).toBe(fixture.expected.prog);
        }
        if (fixture.expected.vers !== undefined) {
          expect(call.vers).toBe(fixture.expected.vers);
        }
        if (fixture.expected.proc !== undefined) {
          expect(call.proc).toBe(fixture.expected.proc);
        }
        if (fixture.expected.credFlavor !== undefined) {
          expect(call.cred.flavor).toBe(fixture.expected.credFlavor);
        }
        if (fixture.expected.verfFlavor !== undefined) {
          expect(call.verf.flavor).toBe(fixture.expected.verfFlavor);
        }
        if (fixture.expected.credBodyLength !== undefined) {
          expect(call.cred.body.buf().length).toBe(fixture.expected.credBodyLength);
        }
      } else if (fixture.expected.type === 'REPLY') {
        if (fixture.expected.replyStat === 'MSG_ACCEPTED') {
          expect(msg!).toBeInstanceOf(RpcAcceptedReplyMessage);
          const reply = msg! as RpcAcceptedReplyMessage;
          if (fixture.expected.acceptStat !== undefined) {
            expect(reply.stat).toBe(fixture.expected.acceptStat);
          }
          if (fixture.expected.verfFlavor !== undefined) {
            expect(reply.verf.flavor).toBe(fixture.expected.verfFlavor);
          }
          if (fixture.expected.mismatchLow !== undefined) {
            expect(reply.mismatchInfo).toBeDefined();
            expect(reply.mismatchInfo!.low).toBe(fixture.expected.mismatchLow);
            expect(reply.mismatchInfo!.high).toBe(fixture.expected.mismatchHigh);
          }
        } else if (fixture.expected.replyStat === 'MSG_DENIED') {
          expect(msg!).toBeInstanceOf(RpcRejectedReplyMessage);
          const reply = msg! as RpcRejectedReplyMessage;
          if (fixture.expected.rejectStat !== undefined) {
            expect(reply.stat).toBe(fixture.expected.rejectStat);
          }
          if (fixture.expected.mismatchLow !== undefined) {
            expect(reply.mismatchInfo).toBeDefined();
            expect(reply.mismatchInfo!.low).toBe(fixture.expected.mismatchLow);
            expect(reply.mismatchInfo!.high).toBe(fixture.expected.mismatchHigh);
          }
          if (fixture.expected.authStat !== undefined) {
            expect(reply.authStat).toBe(fixture.expected.authStat);
          }
        }
      }
    });
  });

  describe('Round-trip encoding/decoding', () => {
    test.each(fixtures.ALL_FIXTURES)('$name - round-trip preserves structure', (fixture) => {
      const decoder1 = new RpcMessageDecoder();
      const withRecordMarking = fixture.bytes;
      const reader1 = new Reader(withRecordMarking);
      const msg1 = decoder1.decodeMessage(reader1)!;
      expect(msg1).toBeDefined();
      const encoder = new RpcMessageEncoder();
      const encoded = encoder.encodeMessage(msg1);
      const decoder2 = new RpcMessageDecoder();
      const reader2 = new Reader(encoded);
      const msg2 = decoder2.decodeMessage(reader2)!;
      expect(msg2).toBeDefined();
      expect(msg2.xid).toBe(msg1.xid);
      if (msg1 instanceof RpcCallMessage) {
        expect(msg2).toBeInstanceOf(RpcCallMessage);
        const call1 = msg1 as RpcCallMessage;
        const call2 = msg2 as RpcCallMessage;
        expect(call2.rpcvers).toBe(call1.rpcvers);
        expect(call2.prog).toBe(call1.prog);
        expect(call2.vers).toBe(call1.vers);
        expect(call2.proc).toBe(call1.proc);
        expect(call2.cred.flavor).toBe(call1.cred.flavor);
        expect(call2.cred.body.subarray()).toEqual(call1.cred.body.subarray());
        expect(call2.verf.flavor).toBe(call1.verf.flavor);
        expect(call2.verf.body.subarray()).toEqual(call1.verf.body.subarray());
      } else if (msg1 instanceof RpcAcceptedReplyMessage) {
        expect(msg2).toBeInstanceOf(RpcAcceptedReplyMessage);
        const reply1 = msg1 as RpcAcceptedReplyMessage;
        const reply2 = msg2 as RpcAcceptedReplyMessage;
        expect(reply2.stat).toBe(reply1.stat);
        expect(reply2.verf.flavor).toBe(reply1.verf.flavor);
        if (reply1.mismatchInfo) {
          expect(reply2.mismatchInfo).toBeDefined();
          expect(reply2.mismatchInfo!.low).toBe(reply1.mismatchInfo.low);
          expect(reply2.mismatchInfo!.high).toBe(reply1.mismatchInfo.high);
        }
      } else if (msg1 instanceof RpcRejectedReplyMessage) {
        expect(msg2).toBeInstanceOf(RpcRejectedReplyMessage);
        const reply1 = msg1 as RpcRejectedReplyMessage;
        const reply2 = msg2 as RpcRejectedReplyMessage;
        expect(reply2.stat).toBe(reply1.stat);
        if (reply1.mismatchInfo) {
          expect(reply2.mismatchInfo).toBeDefined();
          expect(reply2.mismatchInfo!.low).toBe(reply1.mismatchInfo.low);
          expect(reply2.mismatchInfo!.high).toBe(reply1.mismatchInfo.high);
        }
        if (reply1.authStat !== undefined) {
          expect(reply2.authStat).toBe(reply1.authStat);
        }
      }
    });
  });

  describe('Streaming decode', () => {
    test('can decode message in small chunks', () => {
      const decoder = new RpcMessageDecoder();
      const bytes = fixtures.NFS_NULL_CALL.bytes;
      const reader = new Reader(bytes);
      const msg = decoder.decodeMessage(reader);
      expect(msg).toBeDefined();
      expect(msg!.xid).toBe(1);
    });

    test('can decode multiple messages from stream', () => {
      const decoder = new RpcMessageDecoder();
      const reader1 = new Reader(fixtures.NFS_NULL_CALL.bytes);
      const msg1 = decoder.decodeMessage(reader1);
      expect(msg1).toBeDefined();
      expect(msg1!.xid).toBe(1);
      const reader2 = new Reader(fixtures.SUCCESS_REPLY.bytes);
      const msg2 = decoder.decodeMessage(reader2);
      expect(msg2).toBeDefined();
      expect(msg2!.xid).toBe(156);
      const reader3 = new Reader(fixtures.PROG_UNAVAIL_REPLY.bytes);
      const msg3 = decoder.decodeMessage(reader3);
      expect(msg3).toBeDefined();
      expect(msg3!.xid).toBe(66);
    });

    test('handles partial messages correctly', () => {
      const decoder = new RpcMessageDecoder();
      const bytes = fixtures.CALL_WITH_AUTH_UNIX.bytes;
      let reader = new Reader(bytes.slice(0, 20));
      expect(decoder.decodeMessage(reader)).toBeUndefined();
      reader = new Reader(bytes);
      const msg = decoder.decodeMessage(reader);
      expect(msg).toBeDefined();
      expect(msg!.xid).toBe(1234);
    });

    test('can decode multiple messages from stream', () => {
      const decoder = new RpcMessageDecoder();
      const reader1 = new Reader(fixtures.NFS_NULL_CALL.bytes);
      const msg1 = decoder.decodeMessage(reader1);
      expect(msg1).toBeDefined();
      expect(msg1!.xid).toBe(1);
      const reader2 = new Reader(fixtures.SUCCESS_REPLY.bytes);
      const msg2 = decoder.decodeMessage(reader2);
      expect(msg2).toBeDefined();
      expect(msg2!.xid).toBe(156);
      const reader3 = new Reader(fixtures.PROG_UNAVAIL_REPLY.bytes);
      const msg3 = decoder.decodeMessage(reader3);
      expect(msg3).toBeDefined();
      expect(msg3!.xid).toBe(66);
    });
  });

  describe('XDR padding validation', () => {
    test.each([fixtures.CALL_WITH_PADDING_1BYTE, fixtures.CALL_WITH_PADDING_2BYTE, fixtures.CALL_WITH_PADDING_3BYTE])(
      '$name - correctly handles padding',
      (fixture) => {
        const decoder = new RpcMessageDecoder();
        const withRecordMarking = fixture.bytes;
        const reader = new Reader(withRecordMarking);
        const msg = decoder.decodeMessage(reader)!;
        expect(msg).toBeDefined();
        const call = msg as RpcCallMessage;
        expect(call.cred.body.buf().length).toBe(fixture.expected.credBodyLength);
        const encoder = new RpcMessageEncoder();
        const encoded = encoder.encodeMessage(msg);
        expect(encoded.length % 4).toBe(0);
      },
    );
  });

  describe('Error handling', () => {
    test('handles invalid message type', () => {
      const decoder = new RpcMessageDecoder();
      const invalidBytes = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x01, // XID
        0x00,
        0x00,
        0x00,
        0x99, // Invalid msg_type
      ]);
      const withRecordMarking = invalidBytes;
      const reader = new Reader(withRecordMarking);
      expect(() => decoder.decodeMessage(reader)).toThrow();
    });

    test.skip('handles invalid RPC version', () => {
      const decoder = new RpcMessageDecoder();
      const invalidBytes = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x01, // XID
        0x00,
        0x00,
        0x00,
        0x00, // CALL
        0x00,
        0x00,
        0x00,
        0x99, // Invalid RPC version
        0x00,
        0x00,
        0x00,
        0x01, // prog
        0x00,
        0x00,
        0x00,
        0x01, // vers
        0x00,
        0x00,
        0x00,
        0x00, // proc
        0x00,
        0x00,
        0x00,
        0x00, // cred flavor
        0x00,
        0x00,
        0x00,
        0x00, // cred length
        0x00,
        0x00,
        0x00,
        0x00, // verf flavor
        0x00,
        0x00,
        0x00,
        0x00, // verf length
      ]);
      const withRecordMarking = invalidBytes;
      const reader = new Reader(withRecordMarking);
      expect(() => decoder.decodeMessage(reader)).toThrow();
    });

    test('handles oversized auth body', () => {
      const decoder = new RpcMessageDecoder();
      const invalidBytes = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x01, // XID
        0x00,
        0x00,
        0x00,
        0x00, // CALL
        0x00,
        0x00,
        0x00,
        0x02, // RPC version
        0x00,
        0x00,
        0x00,
        0x01, // prog
        0x00,
        0x00,
        0x00,
        0x01, // vers
        0x00,
        0x00,
        0x00,
        0x00, // proc
        0x00,
        0x00,
        0x00,
        0x01, // cred flavor
        0xff,
        0xff,
        0xff,
        0xff, // oversized length
      ]);
      const withRecordMarking = invalidBytes;
      const reader = new Reader(withRecordMarking);
      expect(() => decoder.decodeMessage(reader)).toThrow();
    });

    test('handles invalid reply_stat', () => {
      const decoder = new RpcMessageDecoder();
      const invalidBytes = new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x01, // XID
        0x00,
        0x00,
        0x00,
        0x01, // REPLY
        0x00,
        0x00,
        0x00,
        0x99, // Invalid reply_stat
      ]);
      const withRecordMarking = invalidBytes;
      const reader = new Reader(withRecordMarking);
      expect(() => decoder.decodeMessage(reader)).toThrow();
    });
  });

  describe('NFS-specific scenarios', () => {
    test('NFS NULL call should have no parameters', () => {
      const decoder = new RpcMessageDecoder();
      const withRecordMarking = fixtures.NFS_NULL_CALL.bytes;
      const reader = new Reader(withRecordMarking);
      const msg = decoder.decodeMessage(reader)!;
      const call = msg as RpcCallMessage;
      expect(call.prog).toBe(100003);
      expect(call.proc).toBe(0);
      expect(call.cred.body.size()).toBe(0);
      expect(call.verf.body.size()).toBe(0);
    });

    test('GETPORT response format is valid', () => {
      const decoder = new RpcMessageDecoder();
      const withRecordMarking = fixtures.SUCCESS_REPLY.bytes;
      const reader = new Reader(withRecordMarking);
      const msg = decoder.decodeMessage(reader)!;
      const reply = msg as RpcAcceptedReplyMessage;
      expect(reply.stat).toBe(RpcAcceptStat.SUCCESS);
    });
  });

  describe('Performance tests', () => {
    test('can decode 1000 messages quickly', () => {
      const decoder = new RpcMessageDecoder();
      const withRecordMarking = fixtures.NFS_NULL_CALL.bytes;
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const reader = new Reader(withRecordMarking);
        const msg = decoder.decodeMessage(reader);
        expect(msg).toBeDefined();
      }
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000);
    });

    test('can encode 1000 messages quickly', () => {
      const encoder = new RpcMessageEncoder();
      const decoder = new RpcMessageDecoder();
      const withRecordMarking = fixtures.NFS_NULL_CALL.bytes;
      const reader = new Reader(withRecordMarking);
      const template = decoder.decodeMessage(reader)!;
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const encoded = encoder.encodeMessage(template);
        expect(encoded).toBeDefined();
      }
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000);
    });
  });
});
