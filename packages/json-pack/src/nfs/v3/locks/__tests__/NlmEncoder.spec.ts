import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {NlmEncoder} from '../NlmEncoder';
import {NlmDecoder} from '../NlmDecoder';
import {NlmProc, Nlm4Stat} from '../constants';
import * as msg from '../messages';
import * as structs from '../structs';

describe('NlmEncoder', () => {
  let encoder: NlmEncoder;
  let decoder: NlmDecoder;

  beforeEach(() => {
    encoder = new NlmEncoder();
    decoder = new NlmDecoder();
  });

  const createTestCookie = (): Reader => {
    return new Reader(new Uint8Array([1, 2, 3, 4]));
  };

  const createTestFileHandle = (): Reader => {
    return new Reader(new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]));
  };

  const createTestOwnerHandle = (): Reader => {
    return new Reader(new Uint8Array([11, 22, 33, 44]));
  };

  const createTestLock = (): structs.Nlm4Lock => {
    return new structs.Nlm4Lock(
      'client.example.com',
      createTestFileHandle(),
      createTestOwnerHandle(),
      12345,
      BigInt(0),
      BigInt(1000),
    );
  };

  describe('TEST', () => {
    it('encodes and decodes TEST request', () => {
      const args = new msg.Nlm4TestArgs(createTestCookie(), true, createTestLock());
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4TestRequest);
      expect(decoded.args.cookie.uint8).toEqual(createTestCookie().uint8);
      expect(decoded.args.exclusive).toBe(true);
      expect(decoded.args.lock.callerName).toBe('client.example.com');
      expect(decoded.args.lock.svid).toBe(12345);
    });

    it('encodes and decodes TEST response (granted)', () => {
      const response = new msg.Nlm4TestResponse(createTestCookie(), Nlm4Stat.NLM4_GRANTED, undefined);
      const encoded = encoder.encodeMessage(response, NlmProc.TEST, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, false) as msg.Nlm4TestResponse;
      expect(decoded).toBeInstanceOf(msg.Nlm4TestResponse);
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
      expect(decoded.holder).toBeUndefined();
    });

    it('encodes and decodes TEST response (denied with holder)', () => {
      const holder = new structs.Nlm4Holder(true, 54321, createTestOwnerHandle(), BigInt(500), BigInt(1500));
      const response = new msg.Nlm4TestResponse(createTestCookie(), Nlm4Stat.NLM4_DENIED, holder);
      const encoded = encoder.encodeMessage(response, NlmProc.TEST, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, false) as msg.Nlm4TestResponse;
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_DENIED);
      expect(decoded.holder).toBeDefined();
      expect(decoded.holder!.exclusive).toBe(true);
      expect(decoded.holder!.svid).toBe(54321);
      expect(decoded.holder!.offset).toBe(BigInt(500));
      expect(decoded.holder!.length).toBe(BigInt(1500));
    });

    it('handles exclusive and non-exclusive locks', () => {
      const exclusiveArgs = new msg.Nlm4TestArgs(createTestCookie(), true, createTestLock());
      const sharedArgs = new msg.Nlm4TestArgs(createTestCookie(), false, createTestLock());
      const exclusiveReq = new msg.Nlm4TestRequest(exclusiveArgs);
      const sharedReq = new msg.Nlm4TestRequest(sharedArgs);
      const encoded1 = encoder.encodeMessage(exclusiveReq, NlmProc.TEST, true);
      const encoded2 = encoder.encodeMessage(sharedReq, NlmProc.TEST, true);
      const decoded1 = decoder.decodeMessage(new Reader(encoded1), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      const decoded2 = decoder.decodeMessage(new Reader(encoded2), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded1.args.exclusive).toBe(true);
      expect(decoded2.args.exclusive).toBe(false);
    });
  });

  describe('LOCK', () => {
    it('encodes and decodes LOCK request', () => {
      const args = new msg.Nlm4LockArgs(createTestCookie(), true, true, createTestLock(), false, 100);
      const request = new msg.Nlm4LockRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.LOCK, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.LOCK, true) as msg.Nlm4LockRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4LockRequest);
      expect(decoded.args.block).toBe(true);
      expect(decoded.args.exclusive).toBe(true);
      expect(decoded.args.reclaim).toBe(false);
      expect(decoded.args.state).toBe(100);
    });

    it('encodes and decodes LOCK response', () => {
      const response = new msg.Nlm4Response(createTestCookie(), Nlm4Stat.NLM4_GRANTED);
      const encoded = encoder.encodeMessage(response, NlmProc.LOCK, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.LOCK, false) as msg.Nlm4Response;
      expect(decoded).toBeInstanceOf(msg.Nlm4Response);
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
    });

    it('handles blocking and non-blocking requests', () => {
      const blockingArgs = new msg.Nlm4LockArgs(createTestCookie(), true, true, createTestLock(), false, 100);
      const nonBlockingArgs = new msg.Nlm4LockArgs(createTestCookie(), false, true, createTestLock(), false, 100);
      const blockingReq = new msg.Nlm4LockRequest(blockingArgs);
      const nonBlockingReq = new msg.Nlm4LockRequest(nonBlockingArgs);
      const encoded1 = encoder.encodeMessage(blockingReq, NlmProc.LOCK, true);
      const encoded2 = encoder.encodeMessage(nonBlockingReq, NlmProc.LOCK, true);
      const decoded1 = decoder.decodeMessage(new Reader(encoded1), NlmProc.LOCK, true) as msg.Nlm4LockRequest;
      const decoded2 = decoder.decodeMessage(new Reader(encoded2), NlmProc.LOCK, true) as msg.Nlm4LockRequest;
      expect(decoded1.args.block).toBe(true);
      expect(decoded2.args.block).toBe(false);
    });

    it('handles reclaim flag', () => {
      const args = new msg.Nlm4LockArgs(createTestCookie(), false, true, createTestLock(), true, 200);
      const request = new msg.Nlm4LockRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.LOCK, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.LOCK, true) as msg.Nlm4LockRequest;
      expect(decoded.args.reclaim).toBe(true);
    });
  });

  describe('CANCEL', () => {
    it('encodes and decodes CANCEL request', () => {
      const args = new msg.Nlm4CancelArgs(createTestCookie(), true, true, createTestLock());
      const request = new msg.Nlm4CancelRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.CANCEL, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.CANCEL, true) as msg.Nlm4CancelRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4CancelRequest);
      expect(decoded.args.block).toBe(true);
      expect(decoded.args.exclusive).toBe(true);
    });

    it('encodes and decodes CANCEL response', () => {
      const response = new msg.Nlm4Response(createTestCookie(), Nlm4Stat.NLM4_GRANTED);
      const encoded = encoder.encodeMessage(response, NlmProc.CANCEL, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.CANCEL, false) as msg.Nlm4Response;
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
    });
  });

  describe('UNLOCK', () => {
    it('encodes and decodes UNLOCK request', () => {
      const args = new msg.Nlm4UnlockArgs(createTestCookie(), createTestLock());
      const request = new msg.Nlm4UnlockRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.UNLOCK, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.UNLOCK, true) as msg.Nlm4UnlockRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4UnlockRequest);
      expect(decoded.args.lock.callerName).toBe('client.example.com');
    });

    it('encodes and decodes UNLOCK response', () => {
      const response = new msg.Nlm4Response(createTestCookie(), Nlm4Stat.NLM4_GRANTED);
      const encoded = encoder.encodeMessage(response, NlmProc.UNLOCK, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.UNLOCK, false) as msg.Nlm4Response;
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
    });
  });

  describe('GRANTED', () => {
    it('encodes and decodes GRANTED request', () => {
      const args = new msg.Nlm4TestArgs(createTestCookie(), true, createTestLock());
      const request = new msg.Nlm4GrantedRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.GRANTED, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.GRANTED, true) as msg.Nlm4GrantedRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4GrantedRequest);
      expect(decoded.args.exclusive).toBe(true);
    });

    it('encodes and decodes GRANTED response', () => {
      const response = new msg.Nlm4Response(createTestCookie(), Nlm4Stat.NLM4_GRANTED);
      const encoded = encoder.encodeMessage(response, NlmProc.GRANTED, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.GRANTED, false) as msg.Nlm4Response;
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
    });
  });

  describe('SHARE', () => {
    it('encodes and decodes SHARE request', () => {
      const share = new structs.Nlm4Share('client.example.com', createTestFileHandle(), createTestOwnerHandle(), 1, 2);
      const args = new msg.Nlm4ShareArgs(createTestCookie(), share, false);
      const request = new msg.Nlm4ShareRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.SHARE, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.SHARE, true) as msg.Nlm4ShareRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4ShareRequest);
      expect(decoded.args.share.callerName).toBe('client.example.com');
      expect(decoded.args.share.mode).toBe(1);
      expect(decoded.args.share.access).toBe(2);
      expect(decoded.args.reclaim).toBe(false);
    });

    it('encodes and decodes SHARE response', () => {
      const response = new msg.Nlm4ShareResponse(createTestCookie(), Nlm4Stat.NLM4_GRANTED, 5);
      const encoded = encoder.encodeMessage(response, NlmProc.SHARE, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.SHARE, false) as msg.Nlm4ShareResponse;
      expect(decoded).toBeInstanceOf(msg.Nlm4ShareResponse);
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
      expect(decoded.sequence).toBe(5);
    });

    it('handles different mode and access values', () => {
      const share = new structs.Nlm4Share('client.example.com', createTestFileHandle(), createTestOwnerHandle(), 7, 15);
      const args = new msg.Nlm4ShareArgs(createTestCookie(), share, false);
      const request = new msg.Nlm4ShareRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.SHARE, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.SHARE, true) as msg.Nlm4ShareRequest;
      expect(decoded.args.share.mode).toBe(7);
      expect(decoded.args.share.access).toBe(15);
    });
  });

  describe('UNSHARE', () => {
    it('encodes and decodes UNSHARE request', () => {
      const share = new structs.Nlm4Share('client.example.com', createTestFileHandle(), createTestOwnerHandle(), 1, 2);
      const args = new msg.Nlm4ShareArgs(createTestCookie(), share, false);
      const request = new msg.Nlm4UnshareRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.UNSHARE, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.UNSHARE, true) as msg.Nlm4UnshareRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4UnshareRequest);
      expect(decoded.args.share.callerName).toBe('client.example.com');
    });

    it('encodes and decodes UNSHARE response', () => {
      const response = new msg.Nlm4ShareResponse(createTestCookie(), Nlm4Stat.NLM4_GRANTED, 3);
      const encoded = encoder.encodeMessage(response, NlmProc.UNSHARE, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.UNSHARE, false) as msg.Nlm4ShareResponse;
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
      expect(decoded.sequence).toBe(3);
    });
  });

  describe('NM_LOCK', () => {
    it('encodes and decodes NM_LOCK request', () => {
      const args = new msg.Nlm4LockArgs(createTestCookie(), false, true, createTestLock(), false, 100);
      const request = new msg.Nlm4NmLockRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.NM_LOCK, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.NM_LOCK, true) as msg.Nlm4NmLockRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4NmLockRequest);
      expect(decoded.args.state).toBe(100);
    });

    it('encodes and decodes NM_LOCK response', () => {
      const response = new msg.Nlm4Response(createTestCookie(), Nlm4Stat.NLM4_GRANTED);
      const encoded = encoder.encodeMessage(response, NlmProc.NM_LOCK, false);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.NM_LOCK, false) as msg.Nlm4Response;
      expect(decoded.stat).toBe(Nlm4Stat.NLM4_GRANTED);
    });
  });

  describe('FREE_ALL', () => {
    it('encodes and decodes FREE_ALL request', () => {
      const notify = new structs.Nlm4Notify('client.example.com', 42);
      const request = new msg.Nlm4FreeAllRequest(notify);
      const encoded = encoder.encodeMessage(request, NlmProc.FREE_ALL, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.FREE_ALL, true) as msg.Nlm4FreeAllRequest;
      expect(decoded).toBeInstanceOf(msg.Nlm4FreeAllRequest);
      expect(decoded.notify.name).toBe('client.example.com');
      expect(decoded.notify.state).toBe(42);
    });
  });

  describe('lock regions', () => {
    it('handles zero offset locks', () => {
      const lock = new structs.Nlm4Lock(
        'client.example.com',
        createTestFileHandle(),
        createTestOwnerHandle(),
        12345,
        BigInt(0),
        BigInt(100),
      );
      const args = new msg.Nlm4TestArgs(createTestCookie(), true, lock);
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded.args.lock.offset).toBe(BigInt(0));
      expect(decoded.args.lock.length).toBe(BigInt(100));
    });

    it('handles large offset locks', () => {
      const lock = new structs.Nlm4Lock(
        'client.example.com',
        createTestFileHandle(),
        createTestOwnerHandle(),
        12345,
        BigInt('9223372036854775807'),
        BigInt(1000),
      );
      const args = new msg.Nlm4TestArgs(createTestCookie(), true, lock);
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded.args.lock.offset).toBe(BigInt('9223372036854775807'));
    });

    it('handles zero-length locks (lock to EOF)', () => {
      const lock = new structs.Nlm4Lock(
        'client.example.com',
        createTestFileHandle(),
        createTestOwnerHandle(),
        12345,
        BigInt(500),
        BigInt(0),
      );
      const args = new msg.Nlm4TestArgs(createTestCookie(), true, lock);
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded.args.lock.length).toBe(BigInt(0));
    });
  });

  describe('error status codes', () => {
    it('handles all NLM4 status codes', () => {
      const statusCodes = [
        Nlm4Stat.NLM4_GRANTED,
        Nlm4Stat.NLM4_DENIED,
        Nlm4Stat.NLM4_DENIED_NOLOCKS,
        Nlm4Stat.NLM4_BLOCKED,
        Nlm4Stat.NLM4_DENIED_GRACE_PERIOD,
        Nlm4Stat.NLM4_DEADLCK,
        Nlm4Stat.NLM4_ROFS,
        Nlm4Stat.NLM4_STALE_FH,
        Nlm4Stat.NLM4_FBIG,
        Nlm4Stat.NLM4_FAILED,
      ];
      for (const status of statusCodes) {
        const response = new msg.Nlm4Response(createTestCookie(), status);
        const encoded = encoder.encodeMessage(response, NlmProc.LOCK, false);
        const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.LOCK, false) as msg.Nlm4Response;
        expect(decoded.stat).toBe(status);
      }
    });
  });

  describe('edge cases', () => {
    it('handles empty cookie', () => {
      const emptyCookie = new Reader(new Uint8Array([]));
      const args = new msg.Nlm4TestArgs(emptyCookie, true, createTestLock());
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded.args.cookie.uint8.length).toBe(0);
    });

    it('handles large cookie', () => {
      const largeCookie = new Reader(new Uint8Array(64).fill(123));
      const args = new msg.Nlm4TestArgs(largeCookie, true, createTestLock());
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded.args.cookie.uint8.length).toBe(64);
      expect(decoded.args.cookie.uint8[0]).toBe(123);
    });

    it('handles empty caller name', () => {
      const lock = new structs.Nlm4Lock(
        '',
        createTestFileHandle(),
        createTestOwnerHandle(),
        12345,
        BigInt(0),
        BigInt(100),
      );
      const args = new msg.Nlm4TestArgs(createTestCookie(), true, lock);
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded.args.lock.callerName).toBe('');
    });

    it('handles long caller name', () => {
      const longName = 'a'.repeat(500);
      const lock = new structs.Nlm4Lock(
        longName,
        createTestFileHandle(),
        createTestOwnerHandle(),
        12345,
        BigInt(0),
        BigInt(100),
      );
      const args = new msg.Nlm4TestArgs(createTestCookie(), true, lock);
      const request = new msg.Nlm4TestRequest(args);
      const encoded = encoder.encodeMessage(request, NlmProc.TEST, true);
      const decoded = decoder.decodeMessage(new Reader(encoded), NlmProc.TEST, true) as msg.Nlm4TestRequest;
      expect(decoded.args.lock.callerName).toBe(longName);
    });
  });
});
