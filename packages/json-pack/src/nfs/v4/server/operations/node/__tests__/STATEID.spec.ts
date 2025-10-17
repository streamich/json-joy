import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import {Nfsv4OpenAccess, Nfsv4OpenDeny, Nfsv4LockType} from '../../../../constants';
import {nfs} from '../../../../builder';

/**
 * Stateid validation and lifecycle tests based on RFC 7530 Section 9.1.4
 * Tests stateid structure, validation, and state management
 */
describe('Stateid validation and lifecycle (RFC 7530 §9.1.4)', () => {
  describe('Stateid structure (RFC 7530 §9.1.4.2)', () => {
    test('should have seqid field (32-bit)', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(typeof lockStateid.seqid).toBe('number');
      expect(lockStateid.seqid).toBeGreaterThanOrEqual(0);
      expect(lockStateid.seqid).toBeLessThanOrEqual(0xffffffff);
      await stop();
    });

    test('should have other field (96-bit)', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(lockStateid.other).toBeInstanceOf(Uint8Array);
      expect(lockStateid.other.length).toBe(12);
      await stop();
    });

    test('should return seqid=1 for first stateid instance', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(lockStateid.seqid).toBeGreaterThanOrEqual(1);
      expect(lockStateid.seqid).toBeLessThanOrEqual(2);
      await stop();
    });

    test('should increment seqid on lock modifications', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes1 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const initialSeqid = lockStateid1.seqid;
      const lockRes2 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(200), BigInt(100), nfs.ExistingLockOwner(lockStateid1, 1)),
      ]);
      const lockStateid2 = (lockRes2.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(lockStateid2.seqid).toBe(initialSeqid + 1);
      await stop();
    });

    test('should maintain same other field for same lock-owner/file', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes1 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockRes2 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(200), BigInt(100), nfs.ExistingLockOwner(lockStateid1, 1)),
      ]);
      const lockStateid2 = (lockRes2.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(lockStateid2.other).toEqual(lockStateid1.other);
      await stop();
    });
  });

  describe('Stateid types (RFC 7530 §9.1.4.1)', () => {
    test.todo('should maintain separate stateids for opens');
    test.todo('should maintain separate stateids for byte-range locks');
    test.todo('should associate stateid with specific lock-owner and file');
  });

  describe('Seqid incrementing', () => {
    test('should increment seqid on LOCK operation', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes1 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const seqid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid.seqid;
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockRes2 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(200), BigInt(100), nfs.ExistingLockOwner(lockStateid1, 1)),
      ]);
      const seqid2 = (lockRes2.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid.seqid;
      expect(seqid2).toBe(seqid1 + 1);
      await stop();
    });

    test('should increment seqid on LOCKU operation', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const seqid1 = lockStateid.seqid;
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt(100)),
      ]);
      const seqid2 = (unlockRes.resarray[1] as msg.Nfsv4LockuResponse).resok!.lockStateid.seqid;
      expect(seqid2).toBe(seqid1 + 1);
      await stop();
    });

    test('should not increment on LOCKT (test only)', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes1 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(0),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid, 0, lockOwner1),
        ),
      ]);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const seqid1 = lockStateid1.seqid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      await client.compound([nfs.PUTFH(fh), nfs.LOCKT(Nfsv4LockType.READ_LT, BigInt(50), BigInt(100), lockOwner2)]);
      const lockRes2 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.WRITE_LT, false, BigInt(200), BigInt(100), nfs.ExistingLockOwner(lockStateid1, 1)),
      ]);
      const seqid2 = (lockRes2.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid.seqid;
      expect(seqid2).toBe(seqid1 + 1);
      await stop();
    });

    test.todo('should wrap seqid at UINT32_MAX back to 1 (not 0)');
  });

  describe('Special stateids (RFC 7530 §9.1.4.3)', () => {
    test.todo('should recognize anonymous stateid (all zeros)');
    test.todo('should recognize READ bypass stateid (all ones)');
    test.todo('should return NFS4ERR_BAD_STATEID for invalid special stateid combinations');
    test.todo('should not associate special stateids with client IDs');
  });

  describe('Stateid validation (RFC 7530 §9.1.4.4)', () => {
    test.todo('should return NFS4ERR_BAD_STATEID for unknown other field');
    test.todo('should return NFS4ERR_BAD_STATEID for wrong filehandle');
    test.todo('should return NFS4ERR_BAD_STATEID for wrong stateid type');
    test.todo('should return NFS4ERR_OLD_STATEID for outdated seqid');
    test.todo('should return NFS4ERR_BAD_STATEID for future seqid');
    test.todo('should accept current seqid');
  });

  describe('Stateid lifetime', () => {
    test.todo('should remain valid until client restart');
    test.todo('should remain valid until server restart');
    test.todo('should remain valid until locks returned');
    test.todo('should remain valid after LOCKU while file open');
    test.todo('should become invalid on lease expiration');
  });

  describe('Stateid per lock-owner per file', () => {
    test.todo('should create unique stateid for each lock-owner/file combination');
    test.todo('should reuse stateid for same lock-owner/file across operations');
    test.todo('should not reuse other field for different purposes');
  });

  describe('Revoked state', () => {
    test.todo('should mark stateid as revoked but keep valid');
    test.todo('should return NFS4ERR_EXPIRED for revoked stateid in operations');
    test.todo('should allow client to query revoked state');
  });
});

/**
 * Seqid validation and replay detection tests based on RFC 7530 Sections 9.1.3, 9.1.7, 9.1.8
 */
describe('Seqid validation and replay detection (RFC 7530 §9.1.3, §9.1.7, §9.1.8)', () => {
  describe('Seqid ordering (RFC 7530 §9.1.3)', () => {
    test.todo('should increment seqid by 1 for each operation');
    test.todo('should wrap seqid from UINT32_MAX to 1');
    test.todo('should never use seqid value 0 after initial');
    test.todo('should compare seqids accounting for wraparound');
    test.todo('should treat difference < 2^31 as lower seqid is earlier');
    test.todo('should treat difference >= 2^31 as lower seqid is later (wrapped)');
  });

  describe('Seqid validation (RFC 7530 §9.1.7)', () => {
    test.todo('should accept seqid = last_seqid + 1');
    test.todo('should accept replay with seqid = last_seqid');
    test.todo('should return NFS4ERR_BAD_SEQID for incorrect seqid');
    test.todo('should maintain seqid per state-owner');
    test.todo('should assign seqid=1 for first request from state-owner');
  });

  describe('Replay detection (RFC 7530 §9.1.8)', () => {
    test.todo('should cache last response per state-owner');
    test.todo('should return cached response for duplicate request');
    test.todo('should match request parameters for replay detection');
    test.todo('should cache response as long as state exists');
    test.todo('should detect byzantine router replay attacks');
  });

  describe('At-most-once semantics', () => {
    test.todo('should enforce at-most-once for LOCK operations');
    test.todo('should enforce at-most-once for LOCKU operations');
    test.todo('should enforce at-most-once for OPEN operations');
    test.todo('should enforce at-most-once for CLOSE operations');
  });

  describe('Seqid advance rules (RFC 7530 §9.1.7)', () => {
    test.todo('should advance seqid even after operation error');
    test.todo('should NOT advance seqid after NFS4ERR_STALE_CLIENTID');
    test.todo('should NOT advance seqid after NFS4ERR_STALE_STATEID');
    test.todo('should NOT advance seqid after NFS4ERR_BAD_STATEID');
    test.todo('should NOT advance seqid after NFS4ERR_BAD_SEQID');
    test.todo('should NOT advance seqid after NFS4ERR_BADXDR');
    test.todo('should NOT advance seqid after NFS4ERR_RESOURCE');
    test.todo('should NOT advance seqid after NFS4ERR_NOFILEHANDLE');
    test.todo('should NOT advance seqid after NFS4ERR_MOVED');
  });

  describe('Multiple sequence values (RFC 7530 §9.1.9)', () => {
    test.todo('should check both open-owner and lock-owner seqids for LOCK with new lock-owner');
    test.todo('should prioritize NFS4ERR_BAD_SEQID over stateid errors');
    test.todo('should return NFS4ERR_BAD_SEQID if any seqid is invalid');
    test.todo('should handle replay when multiple seqids match');
  });

  describe('State-owner state release (RFC 7530 §9.1.10)', () => {
    test.todo('should allow server to release state-owner state after lease expiration');
    test.todo('should handle retransmission after state-owner released');
    test.todo('should maintain state-owner while file open or locks held');
  });
});
