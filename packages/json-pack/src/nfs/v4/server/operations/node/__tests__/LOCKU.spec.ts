import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import {Nfsv4Stat, Nfsv4OpenAccess, Nfsv4OpenDeny, Nfsv4LockType} from '../../../../constants';
import {nfs} from '../../../../builder';

/**
 * LOCKU operation tests based on RFC 7530 Section 16.12
 * Tests byte-range unlock functionality
 */
describe('LOCKU operation - Unlock File (RFC 7530 §16.12)', () => {
  describe('Basic unlock functionality', () => {
    test('should unlock a previously locked byte range', async () => {
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
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt(100)),
      ]);
      expect(unlockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const unlockResponse = unlockRes.resarray[1] as msg.Nfsv4LockuResponse;
      expect(unlockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(unlockResponse.resok).toBeDefined();
      await stop();
    });

    test('should return updated stateid with incremented seqid', async () => {
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
      const originalSeqid = lockStateid.seqid;
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt(100)),
      ]);
      const unlockStateid = (unlockRes.resarray[1] as msg.Nfsv4LockuResponse).resok!.lockStateid;
      expect(unlockStateid.seqid).toBeGreaterThan(originalSeqid);
      expect(unlockStateid.other).toEqual(lockStateid.other);
      await stop();
    });

    test('should accept any valid locktype value (per RFC)', async () => {
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
        nfs.LOCK(Nfsv4LockType.READ_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner)),
      ]);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt(100)),
      ]);
      expect(unlockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should unlock entire locked range', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openRes1 = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner1,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
        nfs.GETFH(),
      ]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockRes1 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(0),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
        ),
      ]);
      const lockStateid = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt(100)),
      ]);
      expect(unlockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const openRes2 = await client.compound([
        nfs.PUTROOTFH(),
        nfs.OPEN(
          0,
          Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
          Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
          openOwner2,
          nfs.OpenHowNoCreate(),
          nfs.OpenClaimNull('file.txt'),
        ),
      ]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([13, 14, 15, 16]));
      const lockRes2 = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(0),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
        ),
      ]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });
  });

  describe('Partial unlock', () => {
    test.todo('should unlock a sub-range of locked bytes');
    test.todo('should return NFS4ERR_LOCK_RANGE if partial unlock not supported');
    test.todo('should maintain locks on non-unlocked portions');
  });

  describe('Seqid validation (RFC 7530 §16.12.3)', () => {
    test.todo('should validate lock_stateid');
    test.todo('should increment lock-owner seqid on successful unlock');
    test.todo('should ignore seqid parameter value per RFC (server must ignore)');
    test.todo('should validate stateid seqid is not too old (NFS4ERR_OLD_STATEID)');
    test.todo('should validate stateid seqid is not too new (NFS4ERR_BAD_STATEID)');
  });

  describe('Stateid handling', () => {
    test('should require valid lock stateid', async () => {
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
      expect(lockStateid).toBeDefined();
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt(100)),
      ]);
      expect(unlockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should return NFS4ERR_BAD_STATEID for invalid stateid', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const response = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), nfs.GETFH()]);
      const fh = (response.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const invalidStateid = nfs.Stateid(999, new Uint8Array(12).fill(99));
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, invalidStateid, BigInt(0), BigInt(100)),
      ]);
      expect(unlockRes.status).toBe(Nfsv4Stat.NFS4ERR_BAD_STATEID);
      await stop();
    });

    test('should return updated lock_stateid on success', async () => {
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
      const unlockRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt(100)),
      ]);
      const unlockResponse = unlockRes.resarray[1] as msg.Nfsv4LockuResponse;
      expect(unlockResponse.resok).toBeDefined();
      expect(unlockResponse.resok!.lockStateid).toBeDefined();
      expect(unlockResponse.resok!.lockStateid.other).toEqual(lockStateid.other);
      await stop();
    });

    test.todo('should return NFS4ERR_BAD_STATEID if stateid is not for byte-range lock');
    test.todo('should maintain stateid even after all locks freed (while file open)');
  });

  describe('Range specification', () => {
    test.todo('should unlock specified offset and length');
    test.todo('should handle EOF unlock (length 0xFFFFFFFFFFFFFFFF)');
    test.todo('should return NFS4ERR_INVAL for invalid range');
    test.todo('should return NFS4ERR_BAD_RANGE for 32-bit overflow');
  });

  describe('Lock-owner state', () => {
    test.todo('should maintain lock-owner state after unlock');
    test.todo('should maintain stateid after all locks for file are unlocked');
    test.todo('should allow subsequent locks using same stateid');
  });

  describe('Multiple locks unlock', () => {
    test.todo('should unlock only specified range when multiple ranges locked');
    test.todo('should maintain other locked ranges after partial unlock');
    test.todo('should handle unlocking non-contiguous ranges');
  });

  describe('Error conditions', () => {
    test.todo('should return NFS4ERR_BAD_STATEID for unknown stateid');
    test.todo('should return NFS4ERR_STALE_STATEID for stale stateid');
    test.todo('should return NFS4ERR_LOCK_RANGE for unsupported sub-range operation');
    test.todo('should return NFS4ERR_INVAL for zero length');
  });

  describe('Replay detection', () => {
    test.todo('should return cached response for duplicate LOCKU');
    test.todo('should match seqid for replay detection');
  });
});
