import {Nfsv4Stat, Nfsv4OpenAccess, Nfsv4OpenDeny, Nfsv4LockType} from '../../../../constants';
import type * as msg from '../../../../messages';
import {nfs} from '../../../../builder';
import {setupNfsClientServerTestbed} from '../../../__tests__/setup';

describe('LOCK operation - seqid handling', () => {
  test('LOCK with new lock owner advances open-owner seqid', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    vol.writeFileSync('/export/file.txt', 'test content');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const openStateid = openRes.resok!.stateid;
    const fhRes = openResponse.resarray[2] as msg.Nfsv4GetfhResponse;
    const fh = fhRes.resok!.object;
    const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
    const lockReq = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(0),
      BigInt(100),
      nfs.NewLockOwner(1, openStateid, 0, lockOwner),
    );
    const lockResponse = await client.compound([nfs.PUTFH(fh), lockReq]);
    expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes = lockResponse.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const closeReq = nfs.CLOSE(2, openStateid);
    const closeResponse = await client.compound([closeReq]);
    expect(closeResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const closeRes = closeResponse.resarray[0] as msg.Nfsv4CloseResponse;
    expect(closeRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('LOCK with incorrect open seqid returns BAD_SEQID', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    vol.writeFileSync('/export/file.txt', 'test content');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const openStateid = openRes.resok!.stateid;
    const fhRes = openResponse.resarray[2] as msg.Nfsv4GetfhResponse;
    const fh = fhRes.resok!.object;
    const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
    const lockReq = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(0),
      BigInt(100),
      nfs.NewLockOwner(5, openStateid, 0, lockOwner),
    );
    const lockResponse = await client.compound([nfs.PUTFH(fh), lockReq]);
    expect(lockResponse.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    const lockRes = lockResponse.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    await stop();
  });

  test('macOS save pattern: OPEN -> LOCK(new owner) -> CLOSE succeeds', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    vol.writeFileSync('/export/file.txt.sb-test', 'scratch content');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt.sb-test');
    const openReq = nfs.OPEN(
      19,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const openStateid = openRes.resok!.stateid;
    const fhRes = openResponse.resarray[2] as msg.Nfsv4GetfhResponse;
    const fh = fhRes.resok!.object;
    const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
    const lockReq = nfs.LOCK(
      Nfsv4LockType.WRITEW_LT,
      false,
      BigInt(0),
      BigInt('18446744073709551615'),
      nfs.NewLockOwner(20, openStateid, 0, lockOwner),
    );
    const lockResponse = await client.compound([nfs.PUTFH(fh), lockReq]);
    expect(lockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes = lockResponse.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid = lockRes.resok!.lockStateid;
    const unlockReq = nfs.LOCKU(Nfsv4LockType.WRITE_LT, 1, lockStateid, BigInt(0), BigInt('18446744073709551615'));
    const unlockResponse = await client.compound([nfs.PUTFH(fh), unlockReq]);
    expect(unlockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const closeReq = nfs.CLOSE(21, openStateid);
    const closeResponse = await client.compound([closeReq]);
    expect(closeResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const closeRes = closeResponse.resarray[0] as msg.Nfsv4CloseResponse;
    expect(closeRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('LOCK with existing lock owner validates and advances seqid', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    vol.writeFileSync('/export/file.txt', 'test content');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const openStateid = openRes.resok!.stateid;
    const fhRes = openResponse.resarray[2] as msg.Nfsv4GetfhResponse;
    const fh = fhRes.resok!.object;
    const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
    const lockReq1 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(0),
      BigInt(100),
      nfs.NewLockOwner(1, openStateid, 0, lockOwner),
    );
    const lockResponse1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
    expect(lockResponse1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes1 = lockResponse1.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid1 = lockRes1.resok!.lockStateid;
    const lockReq2 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(100),
      BigInt(100),
      nfs.ExistingLockOwner(lockStateid1, 1),
    );
    const lockResponse2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
    expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes2 = lockResponse2.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockReq3 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(200),
      BigInt(100),
      nfs.ExistingLockOwner(lockStateid1, 1),
    );
    const lockResponse3 = await client.compound([nfs.PUTFH(fh), lockReq3]);
    expect(lockResponse3.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    await stop();
  });

  test('LOCK replay returns cached response without creating new lock', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    vol.writeFileSync('/export/file.txt', 'test content');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const openStateid = openRes.resok!.stateid;
    const fhRes = openResponse.resarray[2] as msg.Nfsv4GetfhResponse;
    const fh = fhRes.resok!.object;
    const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
    const lockReq1 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(0),
      BigInt(100),
      nfs.NewLockOwner(1, openStateid, 0, lockOwner),
    );
    const lockResponse1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
    expect(lockResponse1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes1 = lockResponse1.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid1 = lockRes1.resok!.lockStateid;
    const lockReq2 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(100),
      BigInt(100),
      nfs.ExistingLockOwner(lockStateid1, 1),
    );
    const lockResponse2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
    expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes2 = lockResponse2.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
    const replayResponse = await client.compound([nfs.PUTFH(fh), lockReq2]);
    expect(replayResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const replayRes = replayResponse.resarray[1] as msg.Nfsv4LockResponse;
    expect(replayRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(replayRes.resok!.lockStateid.seqid).toBe(lockRes2.resok!.lockStateid.seqid);
    await stop();
  });

  test('LOCKU validates and advances lock-owner seqid', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    vol.writeFileSync('/export/file.txt', 'test content');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const openStateid = openRes.resok!.stateid;
    const fhRes = openResponse.resarray[2] as msg.Nfsv4GetfhResponse;
    const fh = fhRes.resok!.object;
    const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
    const lockReq1 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(0),
      BigInt(100),
      nfs.NewLockOwner(1, openStateid, 0, lockOwner),
    );
    const lockResponse1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
    expect(lockResponse1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes1 = lockResponse1.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid1 = lockRes1.resok!.lockStateid;
    const lockReq2 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(100),
      BigInt(100),
      nfs.ExistingLockOwner(lockStateid1, 1),
    );
    const lockResponse2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
    expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes2 = lockResponse2.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid2 = lockRes2.resok!.lockStateid;
    const unlockReq = nfs.LOCKU(Nfsv4LockType.WRITE_LT, 2, lockStateid2, BigInt(100), BigInt(100));
    const unlockResponse = await client.compound([nfs.PUTFH(fh), unlockReq]);
    expect(unlockResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const badUnlockReq = nfs.LOCKU(Nfsv4LockType.WRITE_LT, 2, lockStateid1, BigInt(0), BigInt(100));
    const badUnlockResponse = await client.compound([nfs.PUTFH(fh), badUnlockReq]);
    expect(badUnlockResponse.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    await stop();
  });

  test('LOCKU replay returns cached response', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    vol.writeFileSync('/export/file.txt', 'test content');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq, nfs.GETFH()]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const openStateid = openRes.resok!.stateid;
    const fhRes = openResponse.resarray[2] as msg.Nfsv4GetfhResponse;
    const fh = fhRes.resok!.object;
    const lockOwner = nfs.LockOwner(BigInt(1), new Uint8Array([5, 6, 7, 8]));
    const lockReq1 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(0),
      BigInt(100),
      nfs.NewLockOwner(1, openStateid, 0, lockOwner),
    );
    const lockResponse1 = await client.compound([nfs.PUTFH(fh), lockReq1]);
    expect(lockResponse1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes1 = lockResponse1.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid1 = lockRes1.resok!.lockStateid;
    const lockReq2 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(100),
      BigInt(100),
      nfs.ExistingLockOwner(lockStateid1, 1),
    );
    const lockResponse2 = await client.compound([nfs.PUTFH(fh), lockReq2]);
    expect(lockResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes2 = lockResponse2.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid2 = lockRes2.resok!.lockStateid;
    const lockReq3 = nfs.LOCK(
      Nfsv4LockType.WRITE_LT,
      false,
      BigInt(200),
      BigInt(100),
      nfs.ExistingLockOwner(lockStateid2, 2),
    );
    const lockResponse3 = await client.compound([nfs.PUTFH(fh), lockReq3]);
    expect(lockResponse3.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockRes3 = lockResponse3.resarray[1] as msg.Nfsv4LockResponse;
    expect(lockRes3.status).toBe(Nfsv4Stat.NFS4_OK);
    const lockStateid3 = lockRes3.resok!.lockStateid;
    const unlockReq = nfs.LOCKU(Nfsv4LockType.WRITE_LT, 3, lockStateid3, BigInt(200), BigInt(100));
    const unlockResponse1 = await client.compound([nfs.PUTFH(fh), unlockReq]);
    expect(unlockResponse1.status).toBe(Nfsv4Stat.NFS4_OK);
    const unlockRes1 = unlockResponse1.resarray[1] as msg.Nfsv4LockuResponse;
    expect(unlockRes1.status).toBe(Nfsv4Stat.NFS4_OK);
    const unlockResponse2 = await client.compound([nfs.PUTFH(fh), unlockReq]);
    expect(unlockResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
    const unlockRes2 = unlockResponse2.resarray[1] as msg.Nfsv4LockuResponse;
    expect(unlockRes2.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(unlockRes2.resok!.lockStateid.seqid).toBe(unlockRes1.resok!.lockStateid.seqid);
    await stop();
  });
});
