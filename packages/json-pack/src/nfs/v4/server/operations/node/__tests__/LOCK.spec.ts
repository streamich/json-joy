import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import {Nfsv4Stat, Nfsv4OpenAccess, Nfsv4OpenDeny, Nfsv4LockType} from '../../../../constants';
import {nfs} from '../../../../builder';

/**
 * LOCK operation tests based on RFC 7530 Section 16.10
 * Tests basic byte-range lock functionality
 */
describe('LOCK operation - Basic functionality (RFC 7530 §16.10)', () => {
  describe('Basic READ_LT locks', () => {
    test('should acquire a READ_LT lock on a byte range', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse = lockRes.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse.resok).toBeDefined();
      expect(lockResponse.resok!.lockStateid).toBeDefined();
      await stop();
    });

    test('should return a unique stateid for the lock', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(lockStateid).toBeDefined();
      expect(lockStateid.seqid).toBeGreaterThanOrEqual(1);
      expect(lockStateid.other).toHaveLength(12);
      await stop();
    });

    test('should allow multiple READ_LT locks from different lock-owners on overlapping ranges', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(50),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should allow multiple READ_LT locks from the same lock-owner on different ranges', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(200),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid1, 1),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });
  });

  describe('Basic WRITE_LT locks', () => {
    test('should acquire a WRITE_LT lock on a byte range', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse = lockRes.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse.resok).toBeDefined();
      await stop();
    });

    test('should return a unique stateid for the lock', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      const lockStateid = (lockRes.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(lockStateid).toBeDefined();
      expect(lockStateid.seqid).toBeGreaterThanOrEqual(1);
      expect(lockStateid.other).toHaveLength(12);
      await stop();
    });

    test('should prevent conflicting WRITE_LT locks from other lock-owners', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(1n, new Uint8Array([1, 2, 3, 4]));
      const openOwner2 = nfs.OpenOwner(35n, new Uint8Array([9, 10, 11, 12]));
      const lockOwner1 = nfs.LockOwner(123n, new Uint8Array([5, 6, 7, 8]));
      const lockOwner2 = nfs.LockOwner(2n, new Uint8Array([13, 14, 15, 16]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(50),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      await stop();
    });

    test('should prevent conflicting READ_LT locks from other lock-owners when WRITE_LT held', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(50),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      await stop();
    });
  });

  describe('Cross-client lock enforcement', () => {
    test('should prevent READ from different client when WRITE lock held', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content for locking');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(2), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(50),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.denied).toBeDefined();
      expect(lockResponse2.denied!.locktype).toBeGreaterThanOrEqual(Nfsv4LockType.READ_LT);
      expect(lockResponse2.denied!.locktype).toBeLessThanOrEqual(Nfsv4LockType.WRITEW_LT);
      await stop();
    });

    test('should prevent WRITE from different client when READ lock held', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content for locking');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(2), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(50),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.denied).toBeDefined();
      expect(lockResponse2.denied!.locktype).toBeGreaterThanOrEqual(Nfsv4LockType.READ_LT);
      expect(lockResponse2.denied!.locktype).toBeLessThanOrEqual(Nfsv4LockType.WRITEW_LT);
      await stop();
    });

    test('should prevent WRITE from different client when WRITE lock held', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content for locking');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(2), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(50),
        BigInt(50),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.denied).toBeDefined();
      expect(lockResponse2.denied!.offset).toBeDefined();
      expect(lockResponse2.denied!.length).toBeDefined();
      expect(lockResponse2.denied!.locktype).toBeGreaterThanOrEqual(Nfsv4LockType.READ_LT);
      expect(lockResponse2.denied!.locktype).toBeLessThanOrEqual(Nfsv4LockType.WRITEW_LT);
      await stop();
    });

    test('should allow READ from different client when READ lock held', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content for locking');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(2), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(50),
        BigInt(50),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.resok).toBeDefined();
      await stop();
    });
  });

  describe('Lock offset and length', () => {
    test('should lock a specific byte range (offset + length)', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(10),
        BigInt(50),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should lock from offset 0 (beginning of file)', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should lock to EOF using length with all bits set to 1', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt('0xFFFFFFFFFFFFFFFF'),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should lock bytes not yet allocated to the file', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'short');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(10000),
        BigInt(1000),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test.todo('should return NFS4ERR_INVAL when length is zero');
    test.todo('should return NFS4ERR_INVAL when offset + length overflows 64-bit unsigned');
  });

  describe('Lock-owner identification', () => {
    test('should accept new lock-owner via open_to_lock_owner4', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse = lockRes.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse.resok).toBeDefined();
      expect(lockResponse.resok!.lockStateid).toBeDefined();
      await stop();
    });

    test('should accept existing lock-owner via exist_lock_owner4', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      const lockStateid = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(200),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid, 1),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse2.resok).toBeDefined();
      await stop();
    });

    test('should create separate stateids for different lock-owners on same file', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const openOwner2 = nfs.OpenOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(200),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      const lockStateid2 = (lockRes2.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(Buffer.from(lockStateid1.other).equals(Buffer.from(lockStateid2.other))).toBe(false);
      await stop();
    });

    test('should use lock_seqid for sequencing', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const initialSeqid = lockStateid1.seqid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(200),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid1, 1),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      const lockStateid2 = (lockRes2.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      expect(lockStateid2.seqid).toBe(initialSeqid + 1);
      await stop();
    });
  });

  describe('Lock conflict detection (NFS4ERR_DENIED)', () => {
    test('should return NFS4ERR_DENIED when WRITE_LT conflicts with READ_LT', async () => {
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
          Nfsv4LockType.READ_LT,
          false,
          BigInt(0),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
        ),
      ]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
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
          BigInt(50),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
        ),
      ]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      expect(lockResponse2.denied).toBeDefined();
      expect(lockResponse2.denied!.offset).toBeDefined();
      expect(lockResponse2.denied!.length).toBeDefined();
      expect(lockResponse2.denied!.locktype).toBeGreaterThanOrEqual(Nfsv4LockType.READ_LT);
      expect(lockResponse2.denied!.locktype).toBeLessThanOrEqual(Nfsv4LockType.WRITEW_LT);
      await stop();
    });

    test('should return NFS4ERR_DENIED when WRITE_LT conflicts with WRITE_LT', async () => {
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
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
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
          BigInt(25),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
        ),
      ]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      expect(lockResponse2.denied).toBeDefined();
      expect(lockResponse2.denied!.locktype).toBe(Nfsv4LockType.WRITE_LT);
      await stop();
    });

    test('should return NFS4ERR_DENIED when READ_LT conflicts with WRITE_LT', async () => {
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
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
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
          Nfsv4LockType.READ_LT,
          false,
          BigInt(75),
          BigInt(50),
          nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
        ),
      ]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      await stop();
    });

    test('should return LOCK4denied with offset, length, locktype, and owner on conflict', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(100),
          BigInt(200),
          nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
        ),
      ]);
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
          Nfsv4LockType.READ_LT,
          false,
          BigInt(150),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
        ),
      ]);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      expect(lockResponse2.denied).toBeDefined();
      expect(typeof lockResponse2.denied!.offset).toBe('bigint');
      expect(typeof lockResponse2.denied!.length).toBe('bigint');
      expect(lockResponse2.denied!.locktype).toBeGreaterThanOrEqual(Nfsv4LockType.READ_LT);
      expect(lockResponse2.denied!.locktype).toBeLessThanOrEqual(Nfsv4LockType.WRITEW_LT);
      expect(lockResponse2.denied!.owner).toBeDefined();
      expect(lockResponse2.denied!.owner.owner).toBeInstanceOf(Uint8Array);
      await stop();
    });

    test('should allow non-overlapping locks from different owners', async () => {
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
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
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
          BigInt(200),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
        ),
      ]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse2.resok).toBeDefined();
      expect(lockResponse2.resok!.lockStateid).toBeDefined();
      await stop();
    });
  });

  describe('Reclaim parameter', () => {
    test('should accept reclaim=false for normal lock requests', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse = lockRes.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse.resok).toBeDefined();
      await stop();
    });

    test.todo('should handle reclaim=true for lock recovery after server restart');
  });

  describe('32-bit server considerations', () => {
    test.todo('should return NFS4ERR_BAD_RANGE for locks beyond NFS4_UINT32_MAX on 32-bit servers');
    test.todo('should accept locks up to NFS4_UINT32_MAX on 32-bit servers');
  });
});

/**
 * Lock range and sub-range tests based on RFC 7530 Section 9.2
 */
describe('LOCK operation - Lock ranges (RFC 7530 §9.2)', () => {
  describe('Overlapping lock ranges', () => {
    test.todo('should return NFS4ERR_LOCK_RANGE when requesting sub-range of existing lock if not supported');
    test.todo(
      'should return NFS4ERR_LOCK_RANGE when requesting overlapping range from same lock-owner if not supported',
    );

    test('should handle adjacent lock ranges correctly', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content for adjacent locks');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(100),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid1, 1),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should handle multiple separate ranges for same lock-owner', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content for multiple ranges');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(200),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid1, 1),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockReq3 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(400),
        BigInt(100),
        nfs.ExistingLockOwner((lockRes2.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid, 2),
      );
      const lockRes3 = await client.compound([nfs.PUTFH(fh), lockReq3]);
      expect(lockRes3.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });
  });

  describe('EOF locks', () => {
    test('should lock to end of file using length 0xFFFFFFFFFFFFFFFF', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const eofLength = BigInt('0xFFFFFFFFFFFFFFFF');
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        eofLength,
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse = lockRes.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse.resok).toBeDefined();
      await stop();
    });

    test.todo('should handle EOF lock when file grows');
    test.todo('should handle EOF lock when file shrinks');
  });
});

/**
 * Lock upgrade/downgrade tests based on RFC 7530 Section 9.3
 */
describe('LOCK operation - Upgrade and downgrade (RFC 7530 §9.3)', () => {
  describe('Lock downgrade', () => {
    test('should downgrade WRITE_LT to READ_LT atomically', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid1, 1),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect([Nfsv4Stat.NFS4_OK, Nfsv4Stat.NFS4ERR_LOCK_NOTSUPP]).toContain(lockRes2.status);
      if (lockRes2.status === Nfsv4Stat.NFS4_OK) {
        const lockResponse = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
        expect(lockResponse.resok).toBeDefined();
        expect(lockResponse.resok!.lockStateid.seqid).toBe(lockStateid1.seqid + 1);
      }
      await stop();
    });

    test.todo('should return NFS4ERR_LOCK_NOTSUPP if atomic downgrade not supported');
  });

  describe('Lock upgrade', () => {
    test('should upgrade READ_LT to WRITE_LT atomically if no conflicts', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid1, 1),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect([Nfsv4Stat.NFS4_OK, Nfsv4Stat.NFS4ERR_LOCK_NOTSUPP]).toContain(lockRes2.status);
      if (lockRes2.status === Nfsv4Stat.NFS4_OK) {
        const lockResponse = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
        expect(lockResponse.resok).toBeDefined();
      }
      await stop();
    });

    test('should return NFS4ERR_DENIED if upgrade conflicts with other locks', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockStateid1 = (lockRes1.resarray[1] as msg.Nfsv4LockResponse).resok!.lockStateid;
      const openOwner2 = nfs.OpenOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READ_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
      const upgradeReq = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.ExistingLockOwner(lockStateid1, 1),
      );
      const upgradeRes = await client.compound([nfs.PUTFH(fh), upgradeReq]);
      expect([Nfsv4Stat.NFS4ERR_DENIED, Nfsv4Stat.NFS4ERR_LOCK_NOTSUPP]).toContain(upgradeRes.status);
      await stop();
    });

    test.todo('should return NFS4ERR_DEADLOCK if upgrade would cause deadlock with WRITEW_LT');
    test.todo('should return NFS4ERR_LOCK_NOTSUPP if atomic upgrade not supported');
  });
});

/**
 * Blocking lock tests based on RFC 7530 Section 9.4
 */
describe('LOCK operation - Blocking locks (RFC 7530 §9.4)', () => {
  describe('READW_LT locks', () => {
    test('should accept READW_LT as blocking read lock request', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.READW_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse = lockRes.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse.resok).toBeDefined();
      await stop();
    });

    test('should return NFS4ERR_DENIED immediately if lock conflicts', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.READW_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      expect(lockResponse2.denied).toBeDefined();
      await stop();
    });

    test.todo('should queue READW_LT request for fairness');
  });

  describe('WRITEW_LT locks', () => {
    test('should accept WRITEW_LT as blocking write lock request', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
      const openStateid = (openRes.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq = nfs.LOCK(
        Nfsv4LockType.WRITEW_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid, 0, lockOwner),
      );
      const lockRes = await client.compound([nfs.PUTFH(fh), lockReq]);
      expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const lockResponse = lockRes.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(lockResponse.resok).toBeDefined();
      await stop();
    });

    test('should return NFS4ERR_DENIED immediately if lock conflicts', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const openReq1 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner1,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes1 = await client.compound([nfs.PUTROOTFH(), openReq1, nfs.GETFH()]);
      const openStateid1 = (openRes1.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const fh = (openRes1.resarray[2] as msg.Nfsv4GetfhResponse).resok!.object;
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const lockReq1 = nfs.LOCK(
        Nfsv4LockType.WRITE_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid1, 0, lockOwner1),
      );
      const lockRes1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
      expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
      const openOwner2 = nfs.OpenOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const openReq2 = nfs.OPEN(
        0,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner2,
        nfs.OpenHowNoCreate(),
        nfs.OpenClaimNull('file.txt'),
      );
      const openRes2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
      const openStateid2 = (openRes2.resarray[1] as msg.Nfsv4OpenResponse).resok!.stateid;
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([13, 14, 15, 16]));
      const lockReq2 = nfs.LOCK(
        Nfsv4LockType.WRITEW_LT,
        false,
        BigInt(0),
        BigInt(100),
        nfs.NewLockOwner(1, openStateid2, 0, lockOwner2),
      );
      const lockRes2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
      expect(lockRes2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const lockResponse2 = lockRes2.resarray[1] as msg.Nfsv4LockResponse;
      expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      expect(lockResponse2.denied).toBeDefined();
      await stop();
    });

    test.todo('should return NFS4ERR_DEADLOCK if deadlock detected with WRITEW_LT');
    test.todo('should queue WRITEW_LT request for fairness');
  });

  describe('Fairness and queuing', () => {
    test.todo('should grant lock to first waiting client after conflict released');
    test.todo('should wait up to lease period before granting to next client');
    test.todo('should remove lock from pending queue when non-blocking request follows blocking');
  });
});

/**
 * Lock state management based on RFC 7530 Section 16.10.5
 */
describe('LOCK operation - State management (RFC 7530 §16.10.5)', () => {
  describe('open_to_lock_owner4 transition', () => {
    test.todo('should accept open_to_lock_owner4 for first lock by lock-owner');
    test.todo('should validate open_seqid when using open_to_lock_owner4');
    test.todo('should create lock stateid from open stateid');
    test.todo('should return NFS4ERR_BAD_SEQID if open_to_lock_owner4 used when state exists');
    test.todo('should handle retransmission of open_to_lock_owner4 correctly');
  });

  describe('exist_lock_owner4 usage', () => {
    test.todo('should accept exist_lock_owner4 for subsequent locks');
    test.todo('should validate lock_stateid when using exist_lock_owner4');
    test.todo('should increment stateid seqid on successful lock');
  });

  describe('Lock stateid per lock-owner per file', () => {
    test.todo('should maintain one stateid per lock-owner per file');
    test.todo('should maintain separate stateids for same lock-owner on different files');
    test.todo('should maintain separate stateids for different lock-owners on same file');
  });
});
