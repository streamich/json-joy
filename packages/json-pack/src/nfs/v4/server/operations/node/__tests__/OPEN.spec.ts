import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import * as struct from '../../../../structs';
import {Nfsv4Stat, Nfsv4OpenAccess, Nfsv4OpenDeny, Nfsv4OpenClaimType} from '../../../../constants';
import {nfs} from '../../../../builder';

describe('OPEN operation', () => {
  test('opens an existing file for reading', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(2);
    const openRes = response.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(openRes.resok).toBeDefined();
    expect(openRes.resok!.stateid).toBeDefined();
    await stop();
  });

  test('opens an existing file for writing', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = response.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('opens file for both read and write', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
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
    const response = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = response.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('returns NFS4ERR_NOENT for non-existent file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('nonexistent.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(response.status).not.toBe(Nfsv4Stat.NFS4_OK);
    const openRes = response.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4ERR_NOENT);
    await stop();
  });

  test('enforces share deny modes - deny read', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim1 = nfs.OpenClaimNull('file.txt');
    const openReq1 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_READ,
      openOwner1,
      nfs.OpenHowNoCreate(),
      claim1,
    );
    const response1 = await client.compound([nfs.PUTROOTFH(), openReq1]);
    expect(response1.status).toBe(Nfsv4Stat.NFS4_OK);
    const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([5, 6, 7, 8]));
    const claim2 = nfs.OpenClaimNull('file.txt');
    const openReq2 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner2,
      nfs.OpenHowNoCreate(),
      claim2,
    );
    const response2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
    const openRes2 = response2.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes2.status).toBe(Nfsv4Stat.NFS4ERR_SHARE_DENIED);
    await stop();
  });

  test('enforces share deny modes - deny write', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim1 = nfs.OpenClaimNull('file.txt');
    const openReq1 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_WRITE,
      openOwner1,
      nfs.OpenHowNoCreate(),
      claim1,
    );
    const response1 = await client.compound([nfs.PUTROOTFH(), openReq1]);
    expect(response1.status).toBe(Nfsv4Stat.NFS4_OK);
    const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([5, 6, 7, 8]));
    const claim2 = nfs.OpenClaimNull('file.txt');
    const openReq2 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner2,
      nfs.OpenHowNoCreate(),
      claim2,
    );
    const response2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
    const openRes2 = response2.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes2.status).toBe(Nfsv4Stat.NFS4ERR_SHARE_DENIED);
    await stop();
  });

  test('allows multiple opens with compatible share modes', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim1 = nfs.OpenClaimNull('file.txt');
    const openReq1 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner1,
      nfs.OpenHowNoCreate(),
      claim1,
    );
    const response1 = await client.compound([nfs.PUTROOTFH(), openReq1]);
    expect(response1.status).toBe(Nfsv4Stat.NFS4_OK);
    const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([5, 6, 7, 8]));
    const claim2 = nfs.OpenClaimNull('file.txt');
    const openReq2 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner2,
      nfs.OpenHowNoCreate(),
      claim2,
    );
    const response2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
    expect(response2.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes2 = response2.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes2.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('returns NFS4ERR_ISDIR when trying to open a directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('subdir');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response = await client.compound([nfs.PUTROOTFH(), openReq]);
    const openRes = response.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4ERR_ISDIR);
    await stop();
  });

  test('returns NFS4ERR_NOTSUPP for unsupported claim types', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = new struct.Nfsv4OpenClaim(Nfsv4OpenClaimType.CLAIM_PREVIOUS, new struct.Nfsv4OpenClaimPrevious(0));
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response = await client.compound([nfs.PUTROOTFH(), openReq]);
    const openRes = response.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4ERR_NOTSUPP);
    await stop();
  });

  test('allows seqid=0 to reset open-owner state after desync', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq1 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response1 = await client.compound([nfs.PUTROOTFH(), openReq1]);
    expect(response1.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes1 = response1.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes1.status).toBe(Nfsv4Stat.NFS4_OK);
    const openReq2 = nfs.OPEN(
      100,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
    const openRes2 = response2.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes2.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    const openReq3 = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const response3 = await client.compound([nfs.PUTROOTFH(), openReq3]);
    const openRes3 = response3.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes3.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });
});
