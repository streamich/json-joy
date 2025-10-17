import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import * as struct from '../../../../structs';
import {Nfsv4Stat, Nfsv4OpenAccess, Nfsv4OpenDeny} from '../../../../constants';
import {nfs} from '../../../../builder';

describe('OPEN_DOWNGRADE operation', () => {
  test('downgrades share access successfully', async () => {
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
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;
    const downgradeReq = nfs.OPEN_DOWNGRADE(
      stateid,
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
    );
    const downgradeResponse = await client.compound([downgradeReq]);
    expect(downgradeResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const downgradeRes = downgradeResponse.resarray[0] as msg.Nfsv4OpenDowngradeResponse;
    expect(downgradeRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(downgradeRes.resok).toBeDefined();
    await stop();
  });

  test('downgrades deny mode successfully', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1, 2, 3, 4]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_BOTH,
      openOwner,
      nfs.OpenHowNoCreate(),
      claim,
    );
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;
    const downgradeReq = nfs.OPEN_DOWNGRADE(
      stateid,
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
    );
    const downgradeResponse = await client.compound([downgradeReq]);
    expect(downgradeResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const downgradeRes = downgradeResponse.resarray[0] as msg.Nfsv4OpenDowngradeResponse;
    expect(downgradeRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('returns BAD_STATEID for invalid stateid', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const invalidStateid = new struct.Nfsv4Stateid(999, new Uint8Array(12));
    const downgradeReq = nfs.OPEN_DOWNGRADE(
      invalidStateid,
      0,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
    );
    const downgradeResponse = await client.compound([downgradeReq]);
    const downgradeRes = downgradeResponse.resarray[0] as msg.Nfsv4OpenDowngradeResponse;
    expect(downgradeRes.status).toBe(Nfsv4Stat.NFS4ERR_BAD_STATEID);
    await stop();
  });

  test('returns INVAL for invalid upgrade attempt', async () => {
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
    const downgradeReq = nfs.OPEN_DOWNGRADE(
      stateid,
      2,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_BOTH,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
    );
    const downgradeResponse = await client.compound([downgradeReq]);
    const downgradeRes = downgradeResponse.resarray[0] as msg.Nfsv4OpenDowngradeResponse;
    expect(downgradeRes.status).toBe(Nfsv4Stat.NFS4ERR_INVAL);
    await stop();
  });

  test('returns BAD_SEQID for incorrect sequence number', async () => {
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
    const openResponse = await client.compound([nfs.PUTROOTFH(), openReq]);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;
    const downgradeReq = nfs.OPEN_DOWNGRADE(
      stateid,
      99,
      Nfsv4OpenAccess.OPEN4_SHARE_ACCESS_READ,
      Nfsv4OpenDeny.OPEN4_SHARE_DENY_NONE,
    );
    const downgradeResponse = await client.compound([downgradeReq]);
    const downgradeRes = downgradeResponse.resarray[0] as msg.Nfsv4OpenDowngradeResponse;
    expect(downgradeRes.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    await stop();
  });
});
