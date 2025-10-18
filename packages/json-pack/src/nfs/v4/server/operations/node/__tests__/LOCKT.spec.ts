import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import {Nfsv4Stat, Nfsv4LockType, Nfsv4OpenAccess, Nfsv4OpenDeny} from '../../../../constants';
import {nfs} from '../../../../builder';

/**
 * LOCKT operation tests based on RFC 7530 Section 16.11
 * Tests non-blocking lock conflict detection
 */
describe('LOCKT operation - Test for Lock (RFC 7530 §16.11)', () => {
  describe('Basic LOCKT functionality', () => {
    test('should return NFS4_OK when no conflicting locks exist', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const response = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(
          Nfsv4LockType.WRITE_LT,
          BigInt(0),
          BigInt(100),
          nfs.LockOwner(BigInt(1), new Uint8Array([1, 2, 3, 4])),
        ),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      const locktRes = response.resarray[2] as msg.Nfsv4LocktResponse;
      expect(locktRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should not acquire a lock when testing', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const lockOwner1 = nfs.LockOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(0), BigInt(100), lockOwner1),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
      const response = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(0), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should use lock_owner4 instead of stateid4 for identification', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const response = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should test READ_LT and READW_LT identically', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const response1 = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.READ_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(response1.status).toBe(Nfsv4Stat.NFS4_OK);
      const response2 = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.READW_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(response2.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should test WRITE_LT and WRITEW_LT identically', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const response1 = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(response1.status).toBe(Nfsv4Stat.NFS4_OK);
      const response2 = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.WRITEW_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(response2.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });
  });

  describe('Conflict detection', () => {
    test('should return NFS4ERR_DENIED (with LOCK4denied) when READ_LT conflicts with WRITE_LT', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(0),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid, 0, lockOwner1),
        ),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.READ_LT, BigInt(50), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const locktRes = response.resarray[1] as msg.Nfsv4LocktResponse;
      expect(locktRes.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      expect(locktRes.denied).toBeDefined();
      await stop();
    });

    test('should return NFS4ERR_DENIED (with LOCK4denied) when WRITE_LT conflicts with READ_LT', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.READ_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner1)),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(50), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      await stop();
    });

    test('should return NFS4ERR_DENIED (with LOCK4denied) when WRITE_LT conflicts with WRITE_LT', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(0),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid, 0, lockOwner1),
        ),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(50), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      await stop();
    });

    test('should return LOCK4denied with offset, length, locktype, and owner', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(0),
          BigInt(100),
          nfs.NewLockOwner(1, openStateid, 0, lockOwner1),
        ),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(50), BigInt(100), lockOwner2),
      ]);
      const locktRes = response.resarray[1] as msg.Nfsv4LocktResponse;
      expect(locktRes.denied).toBeDefined();
      expect(locktRes.denied!.offset).toBeDefined();
      expect(locktRes.denied!.length).toBeDefined();
      expect(locktRes.denied!.locktype).toBeDefined();
      expect(locktRes.denied!.owner).toBeDefined();
      await stop();
    });

    test('should return NFS4_OK when testing READ_LT against READ_LT', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(Nfsv4LockType.READ_LT, false, BigInt(0), BigInt(100), nfs.NewLockOwner(1, openStateid, 0, lockOwner1)),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.READ_LT, BigInt(50), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });
  });

  describe('Lock-owner exclusion (RFC 7530 §16.11.5)', () => {
    test('should exclude locks from current lock-owner when testing', async () => {
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
      const locktRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(locktRes.status).toBe(Nfsv4Stat.NFS4_OK);
      const locktResponse = locktRes.resarray[1] as msg.Nfsv4LocktResponse;
      expect(locktResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should not report conflict with own locks', async () => {
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
      await client.compound([nfs.PUTFH(fh), lockReq1]);
      const _lockStateid = (await client.compound([nfs.PUTFH(fh), lockReq1])).resarray[1] as msg.Nfsv4LockResponse;
      const locktRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.READ_LT, BigInt(50), BigInt(50), lockOwner),
      ]);
      expect(locktRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('may return NFS4ERR_LOCK_RANGE if checking own overlapping locks', async () => {
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
      await client.compound([nfs.PUTFH(fh), lockReq]);
      const locktRes = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(20), BigInt(50), lockOwner),
      ]);
      const locktResponse = locktRes.resarray[1] as msg.Nfsv4LocktResponse;
      expect([Nfsv4Stat.NFS4_OK, Nfsv4Stat.NFS4ERR_LOCK_RANGE]).toContain(locktResponse.status);
      await stop();
    });
  });

  describe('Range testing', () => {
    test('should detect conflict in overlapping byte ranges', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(100),
          BigInt(200),
          nfs.NewLockOwner(1, openStateid, 0, lockOwner1),
        ),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.READ_LT, BigInt(250), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      const locktRes = response.resarray[1] as msg.Nfsv4LocktResponse;
      expect(locktRes.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      expect(locktRes.denied).toBeDefined();
      await stop();
    });

    test('should return NFS4_OK for non-overlapping ranges', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(100),
          BigInt(200),
          nfs.NewLockOwner(1, openStateid, 0, lockOwner1),
        ),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(500), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      const locktRes = response.resarray[1] as msg.Nfsv4LocktResponse;
      expect(locktRes.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(locktRes.denied).toBeUndefined();
      await stop();
    });

    test('should handle EOF locks (length 0xFFFFFFFFFFFFFFFF) correctly', async () => {
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
      await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCK(
          Nfsv4LockType.WRITE_LT,
          false,
          BigInt(0),
          BigInt('0xFFFFFFFFFFFFFFFF'),
          nfs.NewLockOwner(1, openStateid, 0, lockOwner1),
        ),
      ]);
      const lockOwner2 = nfs.LockOwner(BigInt(1), new Uint8Array([9, 10, 11, 12]));
      const response = await client.compound([
        nfs.PUTFH(fh),
        nfs.LOCKT(Nfsv4LockType.READ_LT, BigInt(999999), BigInt(100), lockOwner2),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4ERR_DENIED);
      await stop();
    });

    test.todo('should return NFS4ERR_INVAL for invalid ranges');
    test.todo('should return NFS4ERR_BAD_RANGE for invalid 32-bit ranges');
  });

  describe('Stateid considerations', () => {
    test('should work without requiring an open stateid', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
      const response = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      const locktRes = response.resarray[2] as msg.Nfsv4LocktResponse;
      expect(locktRes.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });

    test('should work with file not opened by testing client', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file.txt', 'test content');
      const lockOwner = nfs.LockOwner(BigInt(2), new Uint8Array([99, 99, 99, 99]));
      const response = await client.compound([
        nfs.PUTROOTFH(),
        nfs.LOOKUP('file.txt'),
        nfs.LOCKT(Nfsv4LockType.WRITE_LT, BigInt(0), BigInt(100), lockOwner),
      ]);
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      await stop();
    });
  });

  describe('Conflicting lock information', () => {
    test.todo('should return exact conflicting lock offset and length when known');
    test.todo('should return requested offset and length if exact conflict unknown');
  });

  describe('Delegation handling (RFC 7530 §16.11.5)', () => {
    test.todo('should handle LOCKT locally when client holds OPEN_DELEGATE_WRITE');
  });

  describe('Error conditions', () => {
    test.todo('should return NFS4ERR_INVAL for zero-length lock');
    test.todo('should return NFS4ERR_INVAL when offset + length overflows');
  });
});
