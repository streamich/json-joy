import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import * as struct from '../../../../structs';
import {Nfsv4Stat, Nfsv4OpenAccess, Nfsv4OpenDeny} from '../../../../constants';
import {nfs} from '../../../../builder';

describe('OPEN_CONFIRM operation', () => {
  test('confirms an open successfully', async () => {
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
    expect(openResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = openResponse.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;
    const confirmReq = nfs.OPEN_CONFIRM(stateid, 0);
    const confirmResponse = await client.compound([confirmReq]);
    expect(confirmResponse.status).toBe(Nfsv4Stat.NFS4_OK);
    const confirmRes = confirmResponse.resarray[0] as msg.Nfsv4OpenConfirmResponse;
    expect(confirmRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(confirmRes.resok).toBeDefined();
    await stop();
  });

  test('returns BAD_STATEID for invalid stateid', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const invalidStateid = new struct.Nfsv4Stateid(999, new Uint8Array(12));
    const confirmReq = nfs.OPEN_CONFIRM(invalidStateid, 0);
    const confirmResponse = await client.compound([confirmReq]);
    const confirmRes = confirmResponse.resarray[0] as msg.Nfsv4OpenConfirmResponse;
    expect(confirmRes.status).toBe(Nfsv4Stat.NFS4ERR_BAD_STATEID);
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
    const confirmReq = nfs.OPEN_CONFIRM(stateid, 99);
    const confirmResponse = await client.compound([confirmReq]);
    const confirmRes = confirmResponse.resarray[0] as msg.Nfsv4OpenConfirmResponse;
    expect(confirmRes.status).toBe(Nfsv4Stat.NFS4ERR_BAD_SEQID);
    await stop();
  });
});
