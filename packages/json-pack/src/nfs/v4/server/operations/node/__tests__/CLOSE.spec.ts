import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import type * as struct from '../../../../structs';
import {Nfsv4Stat, Nfsv4OpenAccess, Nfsv4OpenDeny} from '../../../../constants';
import {nfs} from '../../../../builder';

describe('CLOSE operation', () => {
  test('closes an open file successfully', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      1,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(openRes.resok).toBeDefined();
    const stateid = openRes.resok!.stateid;
    const closeReq = nfs.CLOSE(2, stateid);
    const closeResponse = await client.compound([closeReq]);
    expect(closeResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const closeRes = closeResponse.resarray[0] as msg.Nfsv4CloseResponse;
    expect(closeRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(closeRes.resok).toBeDefined();
    await stop();
  });

  test('double close returns NFS4_OK (idempotent)', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      1,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq]);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;
    const closeReq1 = nfs.CLOSE(2, stateid);
    const closeResponse1 = await client.compound([closeReq1]);
    expect(closeResponse1.status).toBe(Nfsv4Stat.NFS4_OK);
    const closeReq2 = nfs.CLOSE(2, stateid);
    const closeResponse2 = await client.compound([closeReq2]);
    expect(closeResponse2.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('returns BAD_SEQID for incorrect sequence number', async () => {
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
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq]);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;
    const closeReq = nfs.CLOSE(99, stateid);
    const closeResponse = await client.compound([closeReq]);
    const closeRes = closeResponse.resarray[0] as msg.Nfsv4CloseResponse;
    expect(closeRes.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    await stop();
  });

  test('releases share reservations after close', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner1 = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim1 = nfs.OpenClaimNull('file.txt');
    const openReq1 = nfs.OPEN(
      1,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_WRITE,
      openOwner1,
      nfs.OpenHowNoCreate(),
      claim1,
    );
    const openResponse1 = await client.compound([nfs.PUTROOTFH(), openReq1]);
    expect(openResponse1.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes1 = openResponse1.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes1.resok!.stateid;
    const openOwner2 = nfs.OpenOwner(BigInt(2), new Uint8Array([5, 6, 7, 8]));
    const claim2 = nfs.OpenClaimNull('file.txt');
    const openReq2 = nfs.OPEN(
      1,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_WRITE,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
      openOwner2,
      nfs.OpenHowNoCreate(),
      claim2,
    );
    const openResponse2 = await client.compound([nfs.PUTROOTFH(), openReq2]);
    const openRes2 = openResponse2.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes2.status).toBe(Nfsv4Stat.NFS4ERR_SHARE_DENIED);
    const closeReq = nfs.CLOSE(2, stateid);
    await client.compound([closeReq]);
    const openResponse3 = await client.compound([nfs.PUTROOTFH(), openReq2]);
    expect(openResponse3.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes3 = openResponse3.resarray[1] as msg.Nfsv4OpenResponse;
    expect(openRes3.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('multiple opens and closes', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const stateids: struct.Nfsv4Stateid[] = [];
    for (let i = 0; i < 3; i++) {
      const claim = nfs.OpenClaimNull('file.txt');
      const openReq = nfs.OPEN(
        i + 1,
        Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
        Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
        openOwner,
        nfs.OpenHowNoCreate(),
        claim,
      );
      const openResponse = await client.compound([nfs.PUTROOTFH(), openReq]);
      expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
      const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
      stateids.push(openRes.resok!.stateid);
    }
    for (let i = 0; i < 3; i++) {
      const closeReq = nfs.CLOSE(i + 4, stateids[i]);
      const closeResponse = await client.compound([closeReq]);
      expect(closeResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    }
    await stop();
  });
});
